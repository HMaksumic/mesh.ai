from app.services.inventory import Inventory
from app.config import Settings


def test_inventory_load():
  settings = Settings.load()
  inventory = Inventory(settings.devices_path)
  devices = inventory.list_devices()
  assert len(devices) >= 1


def test_inventory_filters():
  settings = Settings.load()
  inventory = Inventory(settings.devices_path)
  assert inventory.list_devices(tag='core')
  assert inventory.list_devices(site='nyc')