from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from . import models, schemas
from .auth import verify_password, get_password_hash


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_expense(db: Session, user_id: int, expense: schemas.ExpenseCreate) -> models.Expense:
    db_expense = models.Expense(
        user_id=user_id,
        amount=Decimal(str(expense.amount)),
        date=expense.date,
        description=expense.description,
        primary_tag=expense.primary_tag,
        secondary_tag=expense.secondary_tag,
        payment_source=expense.payment_source,
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expenses(db: Session, user_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[models.Expense]:
    query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    if start_date:
        query = query.filter(models.Expense.date >= start_date)
    if end_date:
        query = query.filter(models.Expense.date <= end_date)
    return query.order_by(models.Expense.date.desc()).all()


def get_expense_by_id(db: Session, user_id: int, expense_id: int) -> Optional[models.Expense]:
    return (
        db.query(models.Expense)
        .filter(models.Expense.user_id == user_id, models.Expense.id == expense_id)
        .first()
    )


def update_expense(db: Session, user_id: int, expense_id: int, expense_update: schemas.ExpenseBase) -> Optional[models.Expense]:
    expense = get_expense_by_id(db, user_id, expense_id)
    if not expense:
        return None
    expense.amount = Decimal(str(expense_update.amount))
    expense.date = expense_update.date
    expense.description = expense_update.description
    expense.primary_tag = expense_update.primary_tag
    expense.secondary_tag = expense_update.secondary_tag
    expense.payment_source = expense_update.payment_source
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, user_id: int, expense_id: int) -> bool:
    expense = get_expense_by_id(db, user_id, expense_id)
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True


def get_or_create_user_settings(db: Session, user_id: int) -> models.UserSettings:
    settings = db.query(models.UserSettings).filter(models.UserSettings.user_id == user_id).first()
    if not settings:
        settings = models.UserSettings(user_id=user_id, budget_goal=50000.0)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_user_settings(db: Session, user_id: int, budget_goal: float) -> models.UserSettings:
    settings = get_or_create_user_settings(db, user_id)
    settings.budget_goal = budget_goal
    db.commit()
    db.refresh(settings)
    return settings


def calculate_monthly_summary(db: Session, user_id: int, target_month: int, target_year: int) -> dict:
    total = db.query(func.coalesce(func.sum(models.Expense.amount), 0)).filter(
        models.Expense.user_id == user_id,
        extract("month", models.Expense.date) == target_month,
        extract("year", models.Expense.date) == target_year,
    ).scalar()
    return {"monthly_total": float(total or 0)}


def get_daily_spend_points(expenses: List[models.Expense]) -> List[dict]:
    points = {}
    for expense in expenses:
        key = expense.date.isoformat()
        points[key] = points.get(key, 0) + float(expense.amount)
    return [{"date": date_str, "amount": amount} for date_str, amount in sorted(points.items())]
