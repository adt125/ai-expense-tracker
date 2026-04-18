from datetime import date
from ..services import expense_service
from typing import List, Optional, Dict, Any
from ..database import SessionLocal


def get_expense_data(
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    source: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Fetches and filters expense records from the database based on user criteria.

    Use this tool for:
    1. Direct history: "What were my last 5 expenses?"
    2. Category analysis: "How much did I spend on Food/Travel?" (Pass the 'category' argument).
    3. Source tracking: "What is my total Credit Card or UPI usage?" (Pass the 'source' argument).
    4. Time-based reports: "What are my expenses for last month?" (Pass 'start_date' and 'end_date').

    The agent should use the returned list to calculate totals or averages if the user asks for a summary.

    Args:
        user_id (int): The unique ID of the authenticated user.
        start_date (Optional[date]): Start date for filtering (YYYY-MM-DD).
        end_date (Optional[date]): End date for filtering (YYYY-MM-DD).
        category (Optional[str]): Filter by expense category or tag (e.g., 'Food', 'Rent').
        source (Optional[str]): Filter by payment method/source (e.g., 'Credit Card', 'Cash').
    """
    db = SessionLocal()
    try:
        # 1. Base fetch from service
        expenses = expense_service.get_expenses(
            db=db, user_id=user_id, start_date=start_date, end_date=end_date
        )

        # 2. Smart Filtering (Unified logic)
        if category:
            c = category.lower()
            expenses = [
                e for e in expenses if (e.primary_tag and c in e.primary_tag.lower())
            ]

        if source:
            s = source.lower()
            expenses = [
                e
                for e in expenses
                if (e.payment_source and s in e.payment_source.lower())
            ]

        # 3. Plain dictionary return for Gemini
        return [
            {
                "amount": str(e.amount),
                "category": e.primary_tag,
                "secondary_tag": e.secondary_tag,
                "source": e.payment_source,
                "date": str(e.date),
                "desc": e.description,
            }
            for e in expenses
        ]
    finally:
        db.close()
