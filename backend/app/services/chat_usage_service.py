from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from .. import models


FREE_TIER_DAILY_QUESTION_LIMIT = 5


def try_consume_daily_question(
    db: Session, user_id: int, day: date | None = None, limit: int = FREE_TIER_DAILY_QUESTION_LIMIT
) -> tuple[bool, int]:
    """
    Attempt to consume one "question" from a user's daily free-tier budget.

    Returns:
        (allowed, used_after_attempt)
    """
    day = day or date.today()

    settings = (
        db.query(models.UserSettings)
        .filter(models.UserSettings.user_id == user_id)
        .with_for_update()
        .first()
    )

    if settings is None:
        settings = models.UserSettings(user_id=user_id, budget_goal=50000.0)
        db.add(settings)
        db.flush()

    if settings.chat_daily_date != day:
        settings.chat_daily_date = day
        settings.chat_daily_count = 0

    if settings.chat_daily_count >= limit:
        db.commit()
        return False, settings.chat_daily_count

    settings.chat_daily_count += 1
    db.commit()
    db.refresh(settings)
    return True, settings.chat_daily_count
