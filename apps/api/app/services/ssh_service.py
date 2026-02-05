from __future__ import annotations

import asyncio
import time
import asyncssh
from typing import Optional

from .session_manager import ConnectionDetails


async def start_interactive_session(session, on_status) -> None:
  try:
    conn = await _connect(session.connection)
    process = await conn.create_process(
      term_type='xterm',
      term_size=(session.cols, session.rows)
    )
    on_status('connected')

    async def stdout_reader() -> None:
      async for data in process.stdout:
        session.out_q.put(data)

    async def stderr_reader() -> None:
      async for data in process.stderr:
        session.out_q.put(data)

    async def writer() -> None:
      while True:
        data = await asyncio.to_thread(session.in_q.get)
        if data is None:
          break
        process.stdin.write(data)
        await process.stdin.drain()

    async def resizer() -> None:
      while True:
        cols, rows = await asyncio.to_thread(session.resize_q.get)
        if cols is None or rows is None:
          break
        process.change_pty_size(cols, rows)

    await asyncio.gather(stdout_reader(), stderr_reader(), writer(), resizer())
  except Exception as exc:
    session.out_q.put(f"\r\n[error] {exc}\r\n")
    on_status('error')


async def run_command(connection: ConnectionDetails, command: str, timeout: Optional[int]) -> dict:
  start = time.time()
  host_identifier = f"{connection.username}@{connection.host}"
  try:
    conn = await _connect(connection)
    result = await conn.run(command, timeout=timeout)
    ok = result.exit_status == 0
    return {
      'host': host_identifier,
      'ok': ok,
      'stdout': result.stdout or '',
      'stderr': result.stderr or '',
      'duration_ms': int((time.time() - start) * 1000)
    }
  except Exception as exc:
    return {
      'host': host_identifier,
      'ok': False,
      'stdout': '',
      'stderr': str(exc),
      'duration_ms': int((time.time() - start) * 1000)
    }


async def _connect(connection: ConnectionDetails):
  # If private key is provided, use it
  if connection.private_key:
    return await asyncssh.connect(
      connection.host,
      port=connection.port,
      username=connection.username,
      client_keys=[connection.private_key]
    )
  # If password is provided, use it
  elif connection.password:
    return await asyncssh.connect(
      connection.host,
      port=connection.port,
      username=connection.username,
      password=connection.password
    )
  # Otherwise, use interactive authentication (prompts shown in terminal)
  else:
    return await asyncssh.connect(
      connection.host,
      port=connection.port,
      username=connection.username,
      password=None,  # Will trigger keyboard-interactive
      client_keys=[]  # Don't try default keys
    )