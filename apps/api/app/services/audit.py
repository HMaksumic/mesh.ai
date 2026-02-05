from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any


class AuditLogger:
  def __init__(self, path: Path) -> None:
    self._path = path
    self._path.parent.mkdir(parents=True, exist_ok=True)

  def log_event(self, event_type: str, **fields: Any) -> None:
    payload = {
      'ts': time.time(),
      'type': event_type,
      **fields
    }
    line = json.dumps(payload)
    print(line, file=sys.stdout, flush=True)
    with self._path.open('a', encoding='utf-8') as f:
      f.write(line + '\n')