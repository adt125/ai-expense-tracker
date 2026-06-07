from datetime import date
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from ..services import expense_service, user_service
from .. import models, schemas
from ..dependencies import get_current_user, get_db
import tempfile, shutil, os
from pathlib import Path
from ..ingest.pipeline import run_pipeline

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/create", response_model=schemas.ExpenseRead)
def create_expense(
    expense: schemas.ExpenseCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.create_expense(db, current_user.id, expense)


@router.get("/get_all_expenses", response_model=List[schemas.ExpenseRead])
def list_expenses(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.get_expenses(db, current_user.id, start_date, end_date)


@router.put("/update_by_id/{expense_id}", response_model=schemas.ExpenseRead)
def update_expense(
    expense_id: int,
    expense_update: schemas.ExpenseUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = expense_service.update_expense(
        db, current_user.id, expense_id, expense_update
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
        )
    return expense


@router.delete("/delete_by_id/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = expense_service.delete_expense(db, current_user.id, expense_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
        )
    return {"detail": "Expense deleted"}


@router.post("/upload")
async def upload_expenses(
    files: Annotated[
        List[UploadFile], File(description="Bank statement PDFs or CSVs or XLSX")
    ],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    ALLOWED_EXTENSIONS = {".pdf", ".csv", ".xlsx", ".xls"}
    MAX_FILE_SIZE_MB = 10

    tmp_dir = tempfile.mkdtemp()
    tmp_paths = []

    try:
        for upload in files:
            ext = Path(upload.filename).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {upload.filename}. Allowed: {ALLOWED_EXTENSIONS}")

            contents = await upload.read()
            size_mb = len(contents) / (1024 * 1024)
            if size_mb > MAX_FILE_SIZE_MB:
                raise HTTPException(status_code=413, detail=f"{upload.filename} exceeds {MAX_FILE_SIZE_MB}MB limit")

            tmp_path = os.path.join(tmp_dir, upload.filename)
            with open(tmp_path, "wb") as f:
                f.write(contents)
            tmp_paths.append(tmp_path)

        # Run pipeline
        result = run_pipeline(tmp_paths, db, current_user.id, dry_run=False)

        return {
            "imported": result.new_inserted,
            "duplicates_skipped": result.duplicates_skipped,
            "errors": result.errors,
            "message": f"Added {result.new_inserted} new expenses" + (f", skipped {result.duplicates_skipped} duplicates" if result.duplicates_skipped else ""),
        }

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@router.get("/get_user_settings", response_model=schemas.UserSettingsRead)
def get_user_settings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.get_or_create_user_settings(db=db, user_id=current_user.id)


@router.post("/update_user_settings", response_model=schemas.UserSettingsRead)
def update_user_settings(
    budget: float,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return user_service.update_user_settings(
        db=db, user_id=current_user.id, budget_goal=budget
    )
