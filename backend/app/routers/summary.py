from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..dependencies import get_current_user, get_db
from ..services.summary_service import SummaryService

router = APIRouter(tags=["summary"])


@router.get("/summary", response_model=schemas.SummaryResponse)
def summary(
    month: Optional[int] = None,
    year: Optional[int] = None,
    budget: float = 50000.0,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = SummaryService(db, current_user.id, budget=budget, month=month, year=year)
    return service.build()
