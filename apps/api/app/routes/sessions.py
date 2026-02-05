from flask import Blueprint, current_app, request

from ..services.session_manager import SessionManager
from ..services.inventory import Inventory
from ..services.ssh_service import start_interactive_session


sessions_bp = Blueprint('sessions', __name__)


@sessions_bp.post('/api/sessions')
def create_session():
  data = request.get_json(silent=True) or {}
  device_id = data.get('device_id')
  cols = data.get('cols')
  rows = data.get('rows')

  if not device_id or not isinstance(cols, int) or not isinstance(rows, int):
    return { 'error': 'device_id, cols, and rows are required' }, 400

  inventory: Inventory = current_app.config['INVENTORY']
  device = inventory.get(device_id)
  if not device:
    return { 'error': 'Device not found' }, 404

  sessions: SessionManager = current_app.config['SESSIONS']
  audit = current_app.config['AUDIT']
  runner = current_app.config['ASYNC_RUNNER']
  settings = current_app.config['SETTINGS']

  session = sessions.create_session(device.id, cols, rows)
  audit.log_event('session_create', session_id=session.session_id, device_id=device.id)

  def on_status(state: str) -> None:
    session.status = state

  runner.run(start_interactive_session(session, device, settings.ssh_private_key_path, settings.ssh_password, on_status))

  scheme = 'wss' if request.scheme == 'https' else 'ws'
  ws_url = f"{scheme}://{request.host}/ws/sessions/{session.session_id}"

  return { 'session_id': session.session_id, 'ws_url': ws_url }