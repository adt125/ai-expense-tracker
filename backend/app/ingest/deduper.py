from datetime import datetime, timedelta
from typing import List, Tuple
from .normalizer import NormalizedTransaction
from .. import models
from sqlalchemy.orm import Session


def make_hash(txn: NormalizedTransaction) -> str:
    key = f"{txn.date}|{txn.amount:.2f}|{txn.description[:40].lower().strip()}"
    import hashlib
    return hashlib.sha256(key.encode()).hexdigest()


def is_fuzzy_duplicate(txn: NormalizedTransaction, existing: List[models.Expense], date_tolerance_days: int = 1, amount_tolerance: float = 0.01) -> bool:
    txn_date = datetime.strptime(txn.date, "%Y-%m-%d")
    for ex in existing:
        ex_date = ex.date
        if isinstance(ex_date, str):
            ex_date = datetime.strptime(ex_date, "%Y-%m-%d")
        date_diff = abs((txn_date - ex_date).days)
        amount_diff = abs(float(txn.amount) - float(ex.amount))
        if (
            date_diff <= date_tolerance_days
            and amount_diff <= amount_tolerance
            and txn.description[:30].lower() == (ex.description or "")[:30].lower()
        ):
            return True
    return False


def deduplicate_and_insert(transactions: List[NormalizedTransaction], db: Session, user_id: int) -> Tuple[List[NormalizedTransaction], List[NormalizedTransaction]]:
    new_txns = []
    dupe_txns = []

    if not transactions:
        return new_txns, dupe_txns

    # Fetch relevant existing expenses for this user around the transaction dates
    dates = [datetime.strptime(t.date, "%Y-%m-%d") for t in transactions]
    min_date = min(dates) - timedelta(days=7)
    max_date = max(dates) + timedelta(days=7)

    existing = db.query(models.Expense).filter(
        models.Expense.user_id == user_id,
        models.Expense.date >= min_date.date(),
        models.Expense.date <= max_date.date(),
    ).all()

    seen = []
    for txn in transactions:
        if txn.amount is None or txn.amount == 0:
            dupe_txns.append(txn)
            continue

        # Within-batch dedup
        if any(txn.description[:40].lower() == s.description[:40].lower() and abs(txn.amount - s.amount) < 0.01 for s in seen):
            dupe_txns.append(txn)
            continue

        # Against DB
        if is_fuzzy_duplicate(txn, existing):
            dupe_txns.append(txn)
            continue

        # Insert
        from ..services.expense_service import create_expense
        from .. import schemas
        from datetime import datetime as dt

        try:
            expense_date = dt.strptime(txn.date, "%Y-%m-%d").date()
        except Exception:
            expense_date = None

        expense_in = schemas.ExpenseCreate(
            amount=txn.amount,
            date=expense_date,
            description=txn.description,
            primary_tag=txn.category or "Other",
            secondary_tag=txn.subcategory or "",
            payment_source=txn.bank or "",
        )

        # create_expense handles commit
        create_expense(db, user_id, expense_in)
        new_txns.append(txn)
        seen.append(txn)

    print(f"[DEDUP] New: {len(new_txns)}, Duplicates skipped: {len(dupe_txns)}")
    return new_txns, dupe_txns
