import re
from dataclasses import dataclass, field
from typing import Optional
from .parser import RawTransaction

PII_PATTERNS = [
    (r"\b\d{9,18}\b",                          "[ACCT_MASKED]"),
    (r"\b(?:\d[ -]?){15,16}\b",               "[CARD_MASKED]"),
    (r"\b[A-Z]{4}0[A-Z0-9]{6}\b",             "[IFSC_MASKED]"),
    (r"\b[\w.+-]+@[a-z]+\b",                  "[UPI_MASKED]"),
    (r"\b(?:\+91[\-\s]?)?[6-9]\d{9}\b",       "[PHONE_MASKED]"),
    (r"\b[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}\b",    "[EMAIL_MASKED]"),
    (r"\b[A-Z]{5}\d{4}[A-Z]\b",               "[PAN_MASKED]"),
    (r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",      "[AADHAAR_MASKED]"),
    (r"\b(Mr|Mrs|Ms|Dr|Shri|Smt)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+",
                                                "[NAME_MASKED]"),
]

DROP_FIELDS = {"source_file"}


@dataclass
class CleanTransaction:
    date:        str
    description: str
    debit:       Optional[float]
    credit:      Optional[float]
    balance:     Optional[float]
    bank:        str
    amount:      float            = 0.0
    txn_type:    str              = ""
    pii_hits:    list[str]        = field(default_factory=list)


def scrub_text(text: str) -> tuple[str, list[str]]:
    hits = []
    for pattern, replacement in PII_PATTERNS:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        if matches:
            hits.append(f"{replacement}: {matches}")
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text.strip(), hits


def clean_transaction(raw: RawTransaction) -> CleanTransaction:
    clean_desc, hits = scrub_text(raw.description)

    if raw.debit and raw.debit > 0:
        amount = raw.debit
        txn_type = "debit"
    elif raw.credit and raw.credit > 0:
        amount = raw.credit
        txn_type = "credit"
    else:
        amount = 0.0
        txn_type = "unknown"

    return CleanTransaction(
        date=raw.date,
        description=clean_desc,
        debit=raw.debit,
        credit=raw.credit,
        balance=raw.balance,
        bank=raw.bank,
        amount=amount,
        txn_type=txn_type,
        pii_hits=hits,
    )


def filter_batch(transactions: list[RawTransaction]) -> list[CleanTransaction]:
    cleaned = [clean_transaction(t) for t in transactions]
    pii_flagged = [c for c in cleaned if c.pii_hits]
    if pii_flagged:
        print(f"[PII] Masked PII in {len(pii_flagged)} transactions")
        for c in pii_flagged[:3]:
            print(f"  → {c.pii_hits}")
    return cleaned
