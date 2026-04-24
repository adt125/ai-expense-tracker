from fastapi import APIRouter, Depends
from ..agents import agent_runner
from .. import models, schemas
from ..dependencies import get_current_user, get_session_id

router = APIRouter(prefix="/expensoAi", tags=["chat-bot"])


@router.post("/chat", response_model=schemas.ChatResponse)
async def chat(
    chat_input: schemas.ChatInput,
    current_user: models.User = Depends(get_current_user),
    session_id: str = Depends(get_session_id),
):
    return await agent_runner.run(chat_input, current_user.id, session_id=session_id)


@router.post("/reset-session")
async def logout(
    current_user: models.User = Depends(get_current_user),
    session_id: str = Depends(get_session_id),
):
    await agent_runner.delete_session(current_user.id, session_id)
    return {"detail": "Logged out"}
