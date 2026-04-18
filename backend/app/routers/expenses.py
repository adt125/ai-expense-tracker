from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from ..services import expense_service
from .. import models, schemas
from ..dependencies import get_current_user, get_db
from ..services.excel_service import parse_expense_template

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
    expense = expense_service.update_expense(db, current_user.id, expense_id, expense_update)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return expense


@router.delete("/delete_by_id/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = expense_service.delete_expense(db, current_user.id, expense_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return {"detail": "Expense deleted"}


@router.post("/upload")
def upload_expenses(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload an .xlsx file")

    content = file.file.read()
    with open("/tmp/expense_upload.xlsx", "wb") as tmp_file:
        tmp_file.write(content)

    try:
        rows = parse_expense_template("/tmp/expense_upload.xlsx")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    imported = 0
    for row in rows:
        expense = schemas.ExpenseCreate(**row)
        expense_service.create_expense(db, current_user.id, expense)
        imported += 1

    return {"imported": imported, "message": f"Imported {imported} expenses."}
