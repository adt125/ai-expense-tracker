from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..dependencies import get_current_user, get_db
from ..services.ai_service import generate_health_report

router = APIRouter(tags=["report"])


@router.get("/report", response_model=schemas.ReportResponse)
def report(
    budget: float = 50000.0,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expenses = crud.get_expenses(db, current_user.id)
    expense_data = [
        {
            "date": exp.date.isoformat(),
            "amount": float(exp.amount),
            "primary_tag": exp.primary_tag,
            "secondary_tag": exp.secondary_tag,
        }
        for exp in expenses
    ]
    report = generate_health_report(expense_data, budget)
    return schemas.ReportResponse(summary=report["summary"], advice=report["advice"])
