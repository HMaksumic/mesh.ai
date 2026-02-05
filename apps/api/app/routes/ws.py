from flask import current_app
from flask_sock import Sock
import json
import threading

from ..services.session_manager import SessionManager


sock = Sock()


def init_ws(app):
  sock.init_app(app)

  @sock.route('/ws/sessions/<session_id>')
  def ws_session(ws, session_id):
    sessions: SessionManager = current_app.config['SESSIONS']
    session = sessions.get_session(session_id)
    audit = current_app.config['AUDIT']

    if not session:
      ws.send(json.dumps({ 'type': 'status', 'state': 'error', 'message': 'Session not found' }))
      return

    ws.send(json.dumps({ 'type': 'status', 'state': 'connected' }))

    def sender():
      while True:
        data = session.out_q.get()
        if data is None:
          break
        ws.send(json.dumps({ 'type': 'output', 'data': data }))

    t = threading.Thread(target=sender, daemon=True)
    t.start()

    try:
      while True:
        raw = ws.receive()
        if raw is None:
          break
        msg = json.loads(raw)
        if msg.get('type') == 'input':
          session.in_q.put(msg.get('data', ''))
          sessions.touch(session_id)
        elif msg.get('type') == 'resize':
          cols = int(msg.get('cols', session.cols))
          rows = int(msg.get('rows', session.rows))
          session.cols = cols
          session.rows = rows
          session.resize_q.put((cols, rows))
          sessions.touch(session_id)
        elif msg.get('type') == 'close':
          break
    except Exception as exc:
      ws.send(json.dumps({ 'type': 'status', 'state': 'error', 'message': str(exc) }))
    finally:
      audit.log_event('session_close', session_id=session_id)
      sessions.close_session(session_id, 'client_close')
      session.in_q.put(None)
      session.resize_q.put((None, None))
      ws.send(json.dumps({ 'type': 'status', 'state': 'disconnected' }))