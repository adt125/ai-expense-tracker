from fastapi import APIRouter, Depends
from ..agents import agent_runner
from .. import models
from ..dependencies import get_current_user, get_session_id

router = APIRouter(prefix="/expensoAi", tags=["chat-bot"])


@router.post("/chat")
async def chat(
    query: str,
    current_user: models.User = Depends(get_current_user),
    session_id: str = Depends(get_session_id),
):
    return await agent_runner.run(query, current_user.id, session_id=session_id)
