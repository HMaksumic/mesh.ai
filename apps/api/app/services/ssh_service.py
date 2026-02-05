from __future__ import annotations

import asyncio
import time
import asyncssh
from typing import Optional

from .inventory import Device


async def start_interactive_session(session, device: Device, ssh_private_key_path: str | None, ssh_password: str | None, on_status) -> None:
  try:
    conn = await _connect(device, ssh_private_key_path, ssh_password)
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


async def run_command(device: Device, command: str, timeout: Optional[int], ssh_private_key_path: str | None, ssh_password: str | None) -> dict:
  start = time.time()
  try:
    conn = await _connect(device, ssh_private_key_path, ssh_password)
    result = await conn.run(command, timeout=timeout)
    ok = result.exit_status == 0
    return {
      'device_id': device.id,
      'ok': ok,
      'stdout': result.stdout or '',
      'stderr': result.stderr or '',
      'duration_ms': int((time.time() - start) * 1000)
    }
  except Exception as exc:
    return {
      'device_id': device.id,
      'ok': False,
      'stdout': '',
      'stderr': str(exc),
      'duration_ms': int((time.time() - start) * 1000)
    }


async def _connect(device: Device, ssh_private_key_path: str | None, ssh_password: str | None):
  if device.auth_method == 'key':
    if not ssh_private_key_path:
      raise ValueError('SSH_PRIVATE_KEY_PATH is not set')
    return await asyncssh.connect(
      device.host,
      port=device.port,
      username=device.username,
      client_keys=[ssh_private_key_path]
    )
  if device.auth_method == 'password':
    if not ssh_password:
      raise ValueError('SSH_PASSWORD is not set')
    return await asyncssh.connect(
      device.host,
      port=device.port,
      username=device.username,
      password=ssh_password
    )
  raise ValueError(f'Unknown auth_method: {device.auth_method}')