import os
import asyncio
from typing import List
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from ..agents import expense_agent

# --- Set up Session Management and Runners ---
session_service = InMemorySessionService()
runner = Runner(agent=expense_agent, app_name="APP", session_service=session_service)


def build_local_report(expenses: List[dict], budget: float) -> dict:
    total = sum(item["amount"] for item in expenses)
    categories = {}
    for item in expenses:
        categories[item["primary_tag"]] = categories.get(item["primary_tag"], 0) + item["amount"]

    top_spend = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
    advice = [
        "Review your top expense categories and cut back on the largest discretionary items.",
        "Try using cash for meals or transportation when you can to make spending feel more intentional.",
        "Track recurring payments and cancel subscriptions you no longer use.",
    ]
    if total > budget:
        advice.insert(0, "You are currently above your planned budget, so prioritize needs over wants for the rest of the month.")
    else:
        advice.insert(0, "Your spending is on track, but watch the categories where you spend most heavily.")

    detail_lines = [f"Your current monthly total is ₹{total:.2f}."]
    detail_lines.append("Top categories: " + ", ".join(f"{tag} (₹{amt:.2f})" for tag, amt in top_spend))
    return {
        "summary": " ".join(detail_lines),
        "advice": advice,
    }


def generate_health_report(expenses: List[dict], budget: float) -> dict:
    payload = build_local_report(expenses, budget)
    # if OPENAI_API_KEY:
    #     try:
    #         import openai

    #         openai.api_key = OPENAI_API_KEY
    #         prompt = (
    #             "Create a concise monthly spending health report for a user. "
    #             f"Their monthly budget is ₹{budget:.2f} and expense entries are: {expenses}. "
    #             "Include a brief summary and 3 actionable suggestions."
    #         )
    #         response = openai.Completion.create(
    #             model="text-davinci-003",
    #             prompt=prompt,
    #             max_tokens=200,
    #             temperature=0.7,
    #         )
    #         text = response.choices[0].text.strip()
    #         return {"summary": text, "advice": payload["advice"]}
    #     except Exception:
    #         return payload
    return payload

async def get_ai_suggestion(expenses: List[dict], budget: float):
    
    session = await session_service.create_session(
        app_name="EXPENSO", 
        user_id="USER123", 
        session_id="SESSION_123"
    )
    
    prompt_text = f"""
        I need a complete expense analysis for my monthly spending.
        Budget: ₹{budget:.2f}
        Expenses: {expenses}

        Can you:
        1. Generate a detailed spending report
        2. Provide suggestions on where I can improve my spending
        3. Help me understand my financial patterns
        """
    
    user_content = types.Content(role='user', parts=[types.Part(text=prompt_text)])
    
    final_response_content = "No final response received."
    async for event in runner.run_async(user_id="USER123", session_id="SESSION_123", new_message=user_content):
        if event.is_final_response() and event.content and event.content.parts:
            # For output_schema, the content is the JSON string itself
            final_response_content = event.content.parts[0].text
            
    return final_response_content
