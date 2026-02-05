from flask import Blueprint, current_app, request
import asyncio

from ..services.policy import is_command_allowed
from ..services.ssh_service import run_command
from ..services.session_manager import ConnectionDetails


commands_bp = Blueprint('commands', __name__)


@commands_bp.post('/api/commands/run')
def run_commands():
  data = request.get_json(silent=True) or {}
  connections_data = data.get('connections')
  command = data.get('command')
  timeout_sec = data.get('timeout_sec')

  if not command:
    return { 'error': 'command is required' }, 400

  if not connections_data or not isinstance(connections_data, list):
    return { 'error': 'connections (list) is required' }, 400

  if not is_command_allowed(command):
    return { 'error': 'Command not allowed by policy' }, 400

  audit = current_app.config['AUDIT']
  runner = current_app.config['ASYNC_RUNNER']

  connections = []
  for conn_data in connections_data:
    required_fields = ['host', 'port', 'username']
    if not all(field in conn_data for field in required_fields):
      return { 'error': 'Each connection must include host, port, username' }, 400

    connections.append(ConnectionDetails(
      host=conn_data['host'],
      port=conn_data['port'],
      username=conn_data['username'],
      password=conn_data.get('password'),
      private_key=conn_data.get('private_key')
    ))

  async def exec_all():
    tasks = [
      run_command(conn, command, timeout_sec)
      for conn in connections
    ]
    return await asyncio.gather(*tasks)

  future = runner.run(exec_all())
  results = future.result()
  audit.log_event('command_run', connections=[f"{c.username}@{c.host}" for c in connections], command=command)

  return { 'results': results }