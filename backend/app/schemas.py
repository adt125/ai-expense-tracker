from datetime import date
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]

    class Config:
        orm_mode = True


class ExpenseBase(BaseModel):
    amount: float
    date: date
    description: Optional[str] = None
    primary_tag: str
    secondary_tag: str
    payment_source: str


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseRead(ExpenseBase):
    id: int

    class Config:
        orm_mode = True


class SummaryResponse(BaseModel):
    monthly_total: float
    budget: float
    predicted_total: float
    warning: Optional[str]
    average_daily_spend: float
    days_remaining: int


class ReportResponse(BaseModel):
    summary: str
    advice: List[str]


class ExpenseChartPoint(BaseModel):
    label: str
    value: float


class ForecastResponse(BaseModel):
    predicted_monthly_spend: float
    will_exceed_budget: bool
