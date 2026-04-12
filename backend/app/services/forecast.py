from datetime import date, datetime
from typing import List

import numpy as np


def predict_budget_warning(expense_points: List[dict], budget: float, month_days: int) -> dict:
    if not expense_points:
        return {"predicted_total": 0.0, "will_exceed_budget": False}

    X = []
    y = []
    for point in expense_points:
        dt = date.fromisoformat(point["date"])
        X.append(dt.day)
        y.append(point["amount"])

    try:
        X = np.array(X).reshape(-1, 1)
        y = np.array(y)
        coeffs = np.polyfit(X.flatten(), y, 1)
        daily_pred = np.polyval(coeffs, np.arange(1, month_days + 1))
        predicted_total = float(max(sum(daily_pred), 0))
    except Exception:
        average = sum(y) / len(y)
        predicted_total = float(average * month_days)

    return {
        "predicted_total": round(predicted_total, 2),
        "will_exceed_budget": predicted_total > budget,
    }


def build_expense_points(expenses):
    points = {}
    for expense in expenses:
        key = expense.date.isoformat()
        points[key] = points.get(key, 0.0) + float(expense.amount)
    return [{"date": key, "amount": amount} for key, amount in sorted(points.items())]
