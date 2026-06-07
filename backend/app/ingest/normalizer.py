import os
import json
import time
from dataclasses import dataclass
from typing import Optional
from .pii import CleanTransaction
from dotenv import load_dotenv, find_dotenv
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
import asyncio

load_dotenv(find_dotenv())


@dataclass
class NormalizedTransaction:
    date: str
    description: str
    merchant: str
    category: str
    subcategory: str
    amount: float
    txn_type: str
    bank: str
    tags: list[str]
    confidence: float
    balance: Optional[float] = None


from ..agents.categories import CATEGORIES_PROMPT as CATEGORIES


def build_prompt(transactions: list[CleanTransaction]) -> str:
    txn_list = "\n".join(
        f"{i+1}. [{t.date}] {t.description} | ₹{t.amount} | {t.txn_type}"
        for i, t in enumerate(transactions)
    )

    return f"""You are a financial data normalizer for an Indian expense tracker.
Given a list of bank transaction descriptions, extract structured information.

Available categories and subcategories:
{CATEGORIES}

Transactions:
{txn_list}

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
- Always return exactly {len(transactions)} objects in the same order
"""


from ..agents.txn_norm_agent import txn_normalizer_agent
from ..agents.agent_runner import run_agent, session_service


def call_llm(prompt: str) -> str:
    """
    Use the shared txn_normalizer_agent via the centralized agent_runner.run_agent.
    """
    # Reuse the shared session service from agent_runner by creating a session if not present.
    try:
        # Best-effort: create a session ahead of time (noop if already exists)
        try:
            # run_agent may rely on session existing; create a session once
            import asyncio

            async def _ensure_session():
                await session_service.create_session(app_name="expenso_normalizer", user_id="NORMALIZER", session_id="SESSION_NORMALIZE")

            loop = asyncio.new_event_loop()
            try:
                loop.run_until_complete(_ensure_session())
            finally:
                loop.close()
        except Exception:
            # non-fatal; runner will create session on demand
            pass

        return run_agent(txn_normalizer_agent, "NORMALIZER", "SESSION_NORMALIZE", prompt)
    except Exception:
        raise


def normalize_batch(
    transactions: list[CleanTransaction], batch_size: int = 30, retry_attempts: int = 2
) -> list[NormalizedTransaction]:
    results = []

    for batch_start in range(0, len(transactions), batch_size):
        batch = transactions[batch_start : batch_start + batch_size]
        prompt = build_prompt(batch)

        for attempt in range(retry_attempts):
            try:
                raw_text = call_llm(prompt)
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(raw_text)

                for item in parsed:
                    idx = item["index"] - 1
                    orig = batch[idx]
                    results.append(
                        NormalizedTransaction(
                            date=orig.date,
                            description=orig.description,
                            merchant=item.get("merchant", "Unknown"),
                            category=item.get("category", "Other"),
                            subcategory=item.get("subcategory", ""),
                            amount=orig.amount,
                            txn_type=orig.txn_type,
                            bank=orig.bank,
                            tags=item.get("tags", []),
                            confidence=item.get("confidence", 0.5),
                            balance=orig.balance,
                        )
                    )
                break
            except (json.JSONDecodeError, KeyError) as e:
                print(f"[WARN] Batch {batch_start} attempt {attempt+1} failed: {e}")
                if attempt == retry_attempts - 1:
                    for t in batch:
                        results.append(
                            NormalizedTransaction(
                                date=t.date,
                                description=t.description,
                                merchant="Unknown",
                                category="Other",
                                subcategory="",
                                amount=t.amount,
                                txn_type=t.txn_type,
                                bank=t.bank,
                                tags=[],
                                confidence=0.0,
                                balance=t.balance,
                            )
                        )
            except Exception as e:
                print(f"[ERROR] LLM error: {e}")
                time.sleep(2)

    print(f"[NORM] Normalized {len(results)} transactions")
    return results
