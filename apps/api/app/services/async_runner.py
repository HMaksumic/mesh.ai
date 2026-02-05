from __future__ import annotations

import asyncio
import threading
from concurrent.futures import Future
from typing import Callable


class AsyncRunner:
  def __init__(self) -> None:
    self._loop = asyncio.new_event_loop()
    self._thread = threading.Thread(target=self._run, daemon=True)
    self._thread.start()

  def _run(self) -> None:
    asyncio.set_event_loop(self._loop)
    self._loop.run_forever()

  def run(self, coro) -> Future:
    return asyncio.run_coroutine_threadsafe(coro, self._loop)

  def call_soon_threadsafe(self, fn: Callable[[], None]) -> None:
    self._loop.call_soon_threadsafe(fn)