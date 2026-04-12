import os
from typing import List

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


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
    if OPENAI_API_KEY:
        try:
            import openai

            openai.api_key = OPENAI_API_KEY
            prompt = (
                "Create a concise monthly spending health report for a user. "
                f"Their monthly budget is ₹{budget:.2f} and expense entries are: {expenses}. "
                "Include a brief summary and 3 actionable suggestions."
            )
            response = openai.Completion.create(
                model="text-davinci-003",
                prompt=prompt,
                max_tokens=200,
                temperature=0.7,
            )
            text = response.choices[0].text.strip()
            return {"summary": text, "advice": payload["advice"]}
        except Exception:
            return payload
    return payload
