import calendar
import os
from datetime import date, datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi import Body
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .auth import create_access_token, decode_access_token
from .database import Base, SessionLocal, engine
from .services.ai_service import generate_health_report
from .services.forecast import build_expense_points, predict_budget_warning

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")
    user = crud.get_user_by_email(db, payload["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@app.post("/auth/register", response_model=schemas.UserRead)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, user_data)
    return user


@app.post("/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin = Body(...), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/expenses", response_model=schemas.ExpenseRead)
def create_expense(expense: schemas.ExpenseCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_expense(db, current_user.id, expense)


@app.get("/expenses", response_model=List[schemas.ExpenseRead])
def list_expenses(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_expenses(db, current_user.id, start_date, end_date)


@app.get("/summary", response_model=schemas.SummaryResponse)
def summary(
    month: Optional[int] = None,
    year: Optional[int] = None,
    budget: float = 50000.0,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    target_month = month or today.month
    target_year = year or today.year
    expenses = crud.get_expenses(db, current_user.id)
    monthly_total = sum(float(exp.amount) for exp in expenses if exp.date.month == target_month and exp.date.year == target_year)
    points = build_expense_points([exp for exp in expenses if exp.date.month == target_month and exp.date.year == target_year])
    month_days = calendar.monthrange(target_year, target_month)[1]
    forecast = predict_budget_warning(points, budget, month_days=month_days)
    days_passed = min(today.day, month_days)
    days_remaining = max(month_days - days_passed, 0)
    average_daily_spend = float(monthly_total / days_passed) if days_passed else 0.0
    warning = "" if not forecast["will_exceed_budget"] else "Spending velocity indicates you may exceed your budget this month."
    return {
        "monthly_total": round(monthly_total, 2),
        "budget": round(budget, 2),
        "predicted_total": round(forecast["predicted_total"], 2),
        "warning": warning,
        "average_daily_spend": round(average_daily_spend, 2),
        "days_remaining": days_remaining,
    }


@app.get("/report", response_model=schemas.ReportResponse)
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
