from sqlalchemy import Column, Integer, String, Numeric, Date, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    expenses = relationship("Expense", back_populates="owner", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    budget_goal = Column(Numeric(10, 2), nullable=False, default=50000.0)
    currency = Column(String(10), nullable=False, default="INR")
    email_alerts = Column(String(20), nullable=False, default="enabled")
    chat_daily_count = Column(Integer, nullable=False, default=0)
    chat_daily_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="settings")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    primary_tag = Column(String(100), nullable=False)
    secondary_tag = Column(String(100), nullable=False)
    payment_source = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="expenses")
