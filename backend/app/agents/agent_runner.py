from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from .expense_agent import expense_analysis_agent
from google.genai import types
import os
from dotenv import load_dotenv, find_dotenv
from .. import schemas, models

load_dotenv(find_dotenv())

api_key = os.getenv("GOOGLE_API_KEY")

APP_NAME = "expenso"  # temp
SESSION_ID = "session_code_exec_async"  # temp

session_service = InMemorySessionService()
runner = Runner(
    agent=expense_analysis_agent, app_name=APP_NAME, session_service=session_service
)


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
    user_id = str(current_user.id)
    query = chat_input.query
    prompt = (
        query
        + f" the current user id is {current_user.id} and name is {current_user.full_name}"
    )
    content = types.Content(role="user", parts=[types.Part(text=prompt)])

    final_response_content = "No final response received."
    async for event in runner.run_async(
        user_id=user_id, session_id=session_id, new_message=content
    ):
        # print(f"Event: {event.type}, Author: {event.author}") # Uncomment for detailed logging
        if event.is_final_response() and event.content and event.content.parts:
            # For output_schema, the content is the JSON string itself
            final_response_content = event.content.parts[0].text

    return {"response": final_response_content}
