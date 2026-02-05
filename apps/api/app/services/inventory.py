from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable
from pathlib import Path
import yaml


@dataclass
class Device:
  id: str
  name: str
  host: str
  port: int
  username: str
  auth_method: str
  tags: list[str]
  subnet: str | None = None
  site: str | None = None


class Inventory:
  def __init__(self, path: Path) -> None:
    self._path = path
    self._devices = self._load()

  def _load(self) -> list[Device]:
    if not self._path.exists():
      return []
    data = yaml.safe_load(self._path.read_text()) or []
    devices: list[Device] = []
    for item in data:
      self._validate(item)
      devices.append(Device(**item))
    return devices

  def _validate(self, item: dict) -> None:
    required = ['id', 'name', 'host', 'port', 'username', 'auth_method', 'tags']
    for key in required:
      if key not in item:
        raise ValueError(f'Missing device field: {key}')

  def list_devices(
    self,
    tag: str | None = None,
    site: str | None = None,
    subnet: str | None = None,
    q: str | None = None
  ) -> list[Device]:
    results = self._devices
    if tag:
      results = [d for d in results if tag in d.tags]
    if site:
      results = [d for d in results if d.site == site]
    if subnet:
      results = [d for d in results if d.subnet == subnet]
    if q:
      q_lower = q.lower()
      results = [d for d in results if q_lower in d.name.lower() or q_lower in d.host.lower()]
    return results

  def get(self, device_id: str) -> Device | None:
    for d in self._devices:
      if d.id == device_id:
        return d
    return None