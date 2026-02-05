from .services.async_runner import AsyncRunner
from .services.inventory import Inventory
from .services.session_manager import SessionManager
from .services.audit import AuditLogger
from .routes.devices import devices_bp
from .routes.sessions import sessions_bp
from .routes.commands import commands_bp
from .routes.health import health_bp
from .routes.ws import init_ws
from .config import Settings

from flask import Flask
from flask_cors import CORS


def create_app() -> Flask:
  settings = Settings.load()
  app = Flask(__name__)
  app.config['SETTINGS'] = settings

  CORS(app, resources={r"/api/*": {"origins": settings.allowed_origins}})

  runner = AsyncRunner()
  inventory = Inventory(settings.devices_path)
  sessions = SessionManager(settings.session_idle_sec)
  audit = AuditLogger(settings.audit_log_path)

  app.config['ASYNC_RUNNER'] = runner
  app.config['INVENTORY'] = inventory
  app.config['SESSIONS'] = sessions
  app.config['AUDIT'] = audit

  app.register_blueprint(devices_bp)
  app.register_blueprint(sessions_bp)
  app.register_blueprint(commands_bp)
  app.register_blueprint(health_bp)
  init_ws(app)

  return app


app = create_app()