import calendar
from datetime import date
from typing import Optional

from .email_service import send_email
from .forecast import build_expense_points, predict_budget_warning
from .. import crud


class SummaryService:
    def __init__(
        self,
        db,
        user_id: int,
        budget: Optional[float] = None,
        month: Optional[int] = None,
        year: Optional[int] = None,
        user_email: Optional[str] = None,
    ):
        self.db = db
        self.user_id = user_id
        self.user_email = user_email
        self.settings = crud.get_or_create_user_settings(db, user_id)
        self.budget = budget if budget is not None else float(self.settings.budget_goal)
        self.today = date.today()
        self.target_month = month or self.today.month
        self.target_year = year or self.today.year
        self.month_days = calendar.monthrange(self.target_year, self.target_month)[1]

    def build(self) -> dict:
        expenses = crud.get_expenses(self.db, self.user_id)
        monthly_expenses = self._monthly_expenses(expenses)
        monthly_total = self._monthly_total(monthly_expenses)
        points = build_expense_points(monthly_expenses)
        forecast_available = self._forecast_available(points)

        if forecast_available:
            forecast = predict_budget_warning(points, self.budget, month_days=self.month_days)
        else:
            forecast = {"predicted_total": monthly_total, "will_exceed_budget": False}

        summary = {
            "monthly_total": round(monthly_total, 2),
            "budget": round(self.budget, 2),
            "predicted_total": round(forecast["predicted_total"], 2),
            "warning": self._build_warning(forecast, forecast_available),
            "average_daily_spend": round(self._average_daily_spend(monthly_total), 2),
            "days_remaining": self._days_remaining(),
            "forecast_available": forecast_available,
        }

        self._send_alert_if_needed(monthly_total, forecast)
        return summary

    def _monthly_expenses(self, expenses):
        return [
            expense
            for expense in expenses
            if expense.date.month == self.target_month and expense.date.year == self.target_year
        ]

    def _monthly_total(self, expenses):
        return sum(float(exp.amount) for exp in expenses)

    def _forecast_available(self, expenses) -> bool:
        return len({expense["date"] for expense in expenses}) >= 7

    def _average_daily_spend(self, monthly_total: float) -> float:
        days_passed = min(self.today.day, self.month_days)
        return float(monthly_total / days_passed) if days_passed else 0.0

    def _days_remaining(self) -> int:
        days_passed = min(self.today.day, self.month_days)
        return max(self.month_days - days_passed, 0)

    def _build_warning(self, forecast: dict, forecast_available: bool) -> str:
        if not forecast_available:
            return "Forecast available after at least 7 days of expense history."
        if forecast["will_exceed_budget"]:
            return "Spending velocity indicates you may exceed your budget this month."
        if forecast["predicted_total"] > self.budget * 0.9:
            return "Your forecast is close to your budget — keep an eye on spending."
        return ""

    def _send_alert_if_needed(self, monthly_total: float, forecast: dict):
        if not self.user_email:
            return

        threshold = self.budget * 0.9
        actual_alert = monthly_total >= threshold
        forecast_alert = forecast.get("predicted_total", 0) >= threshold

        if actual_alert or forecast_alert:
            subject = "Expense Tracker Budget Alert"
            body = (
                f"Hi,\n\nYour current spending is ₹{monthly_total:.2f}. "
                f"Your budget is ₹{self.budget:.2f}. "
                f"Forecasted monthly spend is ₹{forecast['predicted_total']:.2f}.\n\n"
                "Review your expenses or adjust your budget to stay on track."
            )
            send_email(subject, body, self.user_email)
