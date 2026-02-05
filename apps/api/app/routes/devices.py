from flask import Blueprint, current_app, request
from dataclasses import asdict

from ..services.inventory import Inventory


devices_bp = Blueprint('devices', __name__)


@devices_bp.get('/api/devices')
def list_devices():
  inventory: Inventory = current_app.config['INVENTORY']
  tag = request.args.get('tag')
  site = request.args.get('site')
  subnet = request.args.get('subnet')
  q = request.args.get('q')
  devices = inventory.list_devices(tag=tag, site=site, subnet=subnet, q=q)
  return [asdict(d) for d in devices]