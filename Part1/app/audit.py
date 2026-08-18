import json
from datetime import datetime
from pathlib import Path
from typing import Any


class AuditLogger:
    """Append-only JSON Lines audit log."""

    def __init__(self, path: str | Path = "logs/audit.jsonl"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def write(self, event: str, *, run_id: str, user: str, **data: Any) -> None:
        record = {
            "timestamp": datetime.now().astimezone().isoformat(),
            "event": event,
            "run_id": run_id,
            "user": user,
            **data,
        }

        with self.path.open("a", encoding="utf-8") as file:
            file.write(json.dumps(record, ensure_ascii=False) + "\n")
