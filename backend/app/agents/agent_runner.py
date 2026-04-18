from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from .expense_agent import expense_analysis_agent
from google.genai import types
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

api_key = os.getenv("GOOGLE_API_KEY")

APP_NAME = "expenso"  # temp
USER_ID = "user1234"  # temp
SESSION_ID = "session_code_exec_async"  # temp

session_service = InMemorySessionService()
runner = Runner(
    agent=expense_analysis_agent, app_name=APP_NAME, session_service=session_service
)


async def run(query: str, user_id: str, session_id: str) -> str:
    prompt = query + f"the current user id is {user_id}"
    content = types.Content(role="user", parts=[types.Part(text=prompt)])
    print("Session id: #######", session_id)
    # Check if it exists
    session = await session_service.get_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=session_id
    )
    if not session:
        # Explicitly create it with your ID if it's missing
        session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=session_id,
        )
        print("Created session: #######", session)

    final_response_content = "No final response received."
    async for event in runner.run_async(
        user_id=USER_ID, session_id=session_id, new_message=content
    ):
        # print(f"Event: {event.type}, Author: {event.author}") # Uncomment for detailed logging
        if event.is_final_response() and event.content and event.content.parts:
            # For output_schema, the content is the JSON string itself
            final_response_content = event.content.parts[0].text

    return {"response": final_response_content}
