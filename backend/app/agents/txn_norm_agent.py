from google.adk.agents import LlmAgent

from .categories import CATEGORIES_PROMPT as CATEGORIES

INSTRUCTION = f"""
You are a financial data normalizer for an Indian expense tracker.
Given a list of bank transaction descriptions, extract structured information.

Available categories and subcategories:
{CATEGORIES}

Return ONLY a JSON array (no markdown, no explanation) with one object per transaction:
[
  {{
    "index": 1,
    "merchant": "clean merchant name (e.g. Swiggy, Amazon, Uber)",
    "category": "exact category from the list",
    "subcategory": "exact subcategory from the list",
    "tags": ["tag1", "tag2"],
    "confidence": 0.95
  }},
  ...
]

Rules:
- For UPI transfers to people, use category "Transfer", subcategory "UPI Transfer"
- For salary credits, use "Income > Salary"
- For ATM withdrawals, use "Other > ATM"
- confidence: 1.0 = certain, 0.5 = guessed
"""

# Agent intended for producing structured JSON normalization output.
txn_normalizer_agent = LlmAgent(
    model="gemini-2.5-flash",
    name="txn_normalizer_agent",
    description="Normalizes bank transactions into structured JSON for the expense tracker",
    instruction=INSTRUCTION,
)
