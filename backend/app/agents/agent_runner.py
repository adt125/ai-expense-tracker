from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from .expense_agent import expense_analysis_agent
from google.genai import types
import os
from dotenv import load_dotenv, find_dotenv
from .. import schemas, models
import asyncio
from typing import Dict

load_dotenv(find_dotenv())

api_key = os.getenv("GOOGLE_API_KEY")

APP_NAME = "expenso"  # temp
SESSION_ID = "session_code_exec_async"  # temp

# Shared session service for all agents in this app
session_service = InMemorySessionService()
# Cache runners per agent name to reuse underlying resources
_runners: Dict[str, Runner] = {}


def _get_runner_for_agent(agent) -> Runner:
    key = getattr(agent, "name", repr(agent))
    if key not in _runners:
        _runners[key] = Runner(agent=agent, app_name=APP_NAME, session_service=session_service)
    return _runners[key]


async def create_session(user_id: str, session_id: str):
    return await session_service.create_session(
        app_name=APP_NAME,
        user_id=str(user_id),
        session_id=session_id,
    )


async def delete_session(user_id: str, session_id: str):
    user_id = str(user_id)
    session = await session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )
    if session:
        await session_service.delete_session(
            app_name=APP_NAME, user_id=user_id, session_id=session_id
        )


async def run(
    chat_input: schemas.ChatInput, current_user: models.User, session_id: str
) -> str:
    """
    Existing specialized run for the expense_analysis_agent kept for compatibility.
    """
    user_id = str(current_user.id)
    query = chat_input.query
    prompt = (
        query
        + f" the current user id is {current_user.id} and name is {current_user.full_name}"
    )
    content = types.Content(role="user", parts=[types.Part(text=prompt)])

    final_response_content = "No final response received."
    runner = _get_runner_for_agent(expense_analysis_agent)
    async for event in runner.run_async(
        user_id=user_id, session_id=session_id, new_message=content
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_response_content = event.content.parts[0].text

    return {"response": final_response_content}


async def run_agent_async(agent, user_id: str, session_id: str, message_text: str) -> str:
    """Run any agent and return the final response text (async).

    Args:
        agent: an ADK agent instance (e.g., LlmAgent)
        user_id: unique user id
        session_id: session id
        message_text: text of the user message

    Returns:
        final response text produced by the agent (or empty string)
    """
    content = types.Content(role="user", parts=[types.Part(text=message_text)])
    final_response = None
    runner = _get_runner_for_agent(agent)
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text
    return final_response or ""


def run_agent(agent, user_id: str, session_id: str, message_text: str) -> str:
    """Sync wrapper around run_agent_async for callers that want a blocking call."""
    try:
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(run_agent_async(agent, user_id, session_id, message_text))
        finally:
            loop.close()
    except Exception:
        raise
