import time
from typing import List
from dataclasses import dataclass, field
from .parser import parse_statement
from .pii import filter_batch
from .normalizer import normalize_batch
from .deduper import deduplicate_and_insert

@dataclass
class PipelineResult:
    total_parsed: int = 0
    after_pii_filter: int = 0
    after_normalize: int = 0
    new_inserted: int = 0
    duplicates_skipped: int = 0
    errors: list[str] = field(default_factory=list)
    elapsed_seconds: float = 0.0


def run_pipeline(file_paths: List[str], db, user_id: int, dry_run: bool = False) -> PipelineResult:
    result = PipelineResult()
    t0 = time.time()

    # Step 1: parse
    all_raw = []
    for fp in file_paths:
        try:
            txns = parse_statement(fp)
            all_raw.extend(txns)
        except Exception as e:
            result.errors.append(f"Parse error [{fp}]: {e}")

    result.total_parsed = len(all_raw)
    if not all_raw:
        result.elapsed_seconds = round(time.time() - t0, 2)
        return result

    # Step 2: PII filter
    clean = filter_batch(all_raw)
    clean = [c for c in clean if c.amount > 0]
    result.after_pii_filter = len(clean)

    if not clean:
        result.elapsed_seconds = round(time.time() - t0, 2)
        return result

    # Step 3: normalize
    normalized = normalize_batch(clean, batch_size=30)
    result.after_normalize = len(normalized)

    # Step 4: dedup & insert
    if dry_run:
        result.new_inserted = len(normalized)
        result.duplicates_skipped = 0
    else:
        new, dupes = deduplicate_and_insert(normalized, db, user_id)
        result.new_inserted = len(new)
        result.duplicates_skipped = len(dupes)

    result.elapsed_seconds = round(time.time() - t0, 2)
    return result
