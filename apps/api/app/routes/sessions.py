from flask import Blueprint, current_app, request

from ..services.session_manager import SessionManager, ConnectionDetails
from ..services.ssh_service import start_interactive_session


sessions_bp = Blueprint('sessions', __name__)


@sessions_bp.post('/api/sessions')
def create_session():
  data = request.get_json(silent=True) or {}
  connection_data = data.get('connection')
  cols = data.get('cols')
  rows = data.get('rows')

  if not isinstance(cols, int) or not isinstance(rows, int):
    return { 'error': 'cols and rows are required' }, 400

  if not connection_data:
    return { 'error': 'connection details are required' }, 400

  required_fields = ['host', 'port', 'username']
  if not all(field in connection_data for field in required_fields):
    return { 'error': 'connection must include host, port, username' }, 400

  connection = ConnectionDetails(
    host=connection_data['host'],
    port=connection_data['port'],
    username=connection_data['username'],
    password=connection_data.get('password'),
    private_key=connection_data.get('private_key')
  )

  sessions: SessionManager = current_app.config['SESSIONS']
  audit = current_app.config['AUDIT']
  runner = current_app.config['ASYNC_RUNNER']

  session = sessions.create_session(connection, cols, rows)
  audit.log_event('session_create', session_id=session.session_id, host=connection.host)

  def on_status(state: str) -> None:
    session.status = state

  runner.run(start_interactive_session(session, on_status))

  scheme = 'wss' if request.scheme == 'https' else 'ws'
  ws_url = f"{scheme}://{request.host}/ws/sessions/{session.session_id}"

  return { 'session_id': session.session_id, 'ws_url': ws_url }