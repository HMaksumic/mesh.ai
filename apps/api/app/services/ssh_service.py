from __future__ import annotations

import asyncio
import time
import asyncssh
from typing import Optional

from .session_manager import ConnectionDetails


async def start_interactive_session(session, on_status) -> None:
  try:
    # If no password provided, prompt for it in the terminal with retry logic
    if not session.connection.password and not session.connection.private_key:
      max_attempts = 3
      for attempt in range(max_attempts):
        # Send password prompt to terminal
        if attempt == 0:
          session.out_q.put(f"Connecting to {session.connection.username}@{session.connection.host}...\r\n")
        session.out_q.put(f"{session.connection.username}@{session.connection.host}'s password: ")
        
        # Wait for user to type password
        password_input = await asyncio.to_thread(session.in_q.get)
        if password_input:
          session.connection.password = password_input.rstrip('\r\n')
        session.out_q.put('\r\n')
        
        # Try to connect
        try:
          conn = await _connect(session.connection)
          break  # Success! Exit retry loop
        except asyncssh.PermissionDenied:
          session.out_q.put("Access denied\r\n")
          if attempt < max_attempts - 1:
            # Try again
            continue
          else:
            # Max attempts reached
            raise Exception("Authentication failed after 3 attempts")
        except Exception as e:
          # Other connection errors, don't retry
          raise
    else:
      # Password or key already provided, connect directly
      conn = await _connect(session.connection)
    
    # Create interactive shell process
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
  # Common connection parameters - auto-accept host keys for gateway use
  common_params = {
    'host': connection.host,
    'port': connection.port,
    'username': connection.username,
    'known_hosts': None,  # Auto-accept host keys (similar to SSH -o StrictHostKeyChecking=no)
    'agent_path': None  # Disable SSH agent
  }
  
  # If private key is provided, use it
  if connection.private_key:
    return await asyncssh.connect(
      **common_params,
      client_keys=[connection.private_key]
    )
  # If password is provided, use it
  elif connection.password:
    return await asyncssh.connect(
      **common_params,
      password=connection.password
    )
  # Otherwise, fail
  else:
    raise Exception("No authentication method provided")