from flask import Blueprint, current_app, request
import asyncio

from ..services.inventory import Inventory
from ..services.policy import is_command_allowed
from ..services.ssh_service import run_command


commands_bp = Blueprint('commands', __name__)


@commands_bp.post('/api/commands/run')
def run_commands():
  data = request.get_json(silent=True) or {}
  device_ids = data.get('device_ids')
  command = data.get('command')
  timeout_sec = data.get('timeout_sec')

  if not isinstance(device_ids, list) or not command:
    return { 'error': 'device_ids (list) and command are required' }, 400

  if not is_command_allowed(command):
    return { 'error': 'Command not allowed by policy' }, 400

  inventory: Inventory = current_app.config['INVENTORY']
  settings = current_app.config['SETTINGS']
  audit = current_app.config['AUDIT']
  runner = current_app.config['ASYNC_RUNNER']

  devices = []
  for device_id in device_ids:
    device = inventory.get(device_id)
    if not device:
      return { 'error': f'Device not found: {device_id}' }, 404
    devices.append(device)

  async def exec_all():
    tasks = [
      run_command(d, command, timeout_sec, settings.ssh_private_key_path, settings.ssh_password)
      for d in devices
    ]
    return await asyncio.gather(*tasks)

  future = runner.run(exec_all())
  results = future.result()
  audit.log_event('command_run', device_ids=device_ids, command=command)

  return { 'results': results }