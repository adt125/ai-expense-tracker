from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..agents import agent_runner
from .. import models, schemas
from ..dependencies import get_current_user, get_db, get_session_id
from ..services import chat_usage_service

router = APIRouter(prefix="/expensoAi", tags=["chat-bot"])


@router.post("/chat", response_model=schemas.ChatResponse)
async def chat(
    chat_input: schemas.ChatInput,
    current_user: models.User = Depends(get_current_user),
    session_id: str = Depends(get_session_id),
    db: Session = Depends(get_db),
):
    allowed, _used = chat_usage_service.try_consume_daily_question(
        db, user_id=current_user.id, day=date.today()
    )
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You have exceeded your free tier limit for today (5 questions). Please try again tomorrow.",
        )

    return await agent_runner.run(chat_input, current_user, session_id=session_id)


@router.post("/reset-session")
async def logout(
    current_user: models.User = Depends(get_current_user),
    session_id: str = Depends(get_session_id),
):
    await agent_runner.delete_session(current_user.id, session_id)
    return {"detail": "Logged out"}
