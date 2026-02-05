from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


def repo_root() -> Path:
  return Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
  devices_path: Path
  audit_log_path: Path
  ssh_private_key_path: str | None
  ssh_password: str | None
  session_idle_sec: int
  allowed_origins: str

  @staticmethod
  def load() -> 'Settings':
    root = repo_root()
    return Settings(
      devices_path=root / 'apps' / 'api' / 'devices.yml',
      audit_log_path=Path(os.getenv('AUDIT_LOG_PATH', root / 'data' / 'audit.log')),
      ssh_private_key_path=os.getenv('SSH_PRIVATE_KEY_PATH'),
      ssh_password=os.getenv('SSH_PASSWORD'),
      session_idle_sec=int(os.getenv('SESSION_IDLE_SEC', '900')),
      allowed_origins=os.getenv('ALLOWED_ORIGINS', '*')
    )