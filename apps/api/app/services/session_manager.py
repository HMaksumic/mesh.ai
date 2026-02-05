from __future__ import annotations

from dataclasses import dataclass, field
import queue
import threading
import time
import uuid
from typing import Dict


@dataclass
class ConnectionDetails:
  host: str
  port: int
  username: str
  password: str | None = None
  private_key: str | None = None


@dataclass
class Session:
  session_id: str
  connection: ConnectionDetails
  cols: int
  rows: int
  created_at: float
  last_activity: float
  in_q: queue.Queue[str | None] = field(default_factory=queue.Queue)
  out_q: queue.Queue[str] = field(default_factory=queue.Queue)
  resize_q: queue.Queue[tuple[int | None, int | None]] = field(default_factory=queue.Queue)
  status: str = 'disconnected'


class SessionManager:
  def __init__(self, idle_timeout_sec: int) -> None:
    self._sessions: Dict[str, Session] = {}
    self._lock = threading.Lock()
    self._idle_timeout = idle_timeout_sec
    self._start_sweeper()

  def _start_sweeper(self) -> None:
    def sweep() -> None:
      while True:
        time.sleep(30)
        now = time.time()
        with self._lock:
          to_close = [sid for sid, s in self._sessions.items() if now - s.last_activity > self._idle_timeout]
        for sid in to_close:
          self.close_session(sid, 'idle_timeout')

    t = threading.Thread(target=sweep, daemon=True)
    t.start()

  def create_session(self, connection: ConnectionDetails, cols: int, rows: int) -> Session:
    session_id = str(uuid.uuid4())
    now = time.time()
    session = Session(session_id, connection, cols, rows, now, now)
    with self._lock:
      self._sessions[session_id] = session
    return session

  def get_session(self, session_id: str) -> Session | None:
    with self._lock:
      return self._sessions.get(session_id)

  def touch(self, session_id: str) -> None:
    with self._lock:
      if session_id in self._sessions:
        self._sessions[session_id].last_activity = time.time()

  def close_session(self, session_id: str, reason: str) -> None:
    with self._lock:
      self._sessions.pop(session_id, None)