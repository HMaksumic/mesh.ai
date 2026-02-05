import re

ALLOW_PATTERNS = [
  re.compile(r'^(show|ping|traceroute|ip|arp|route)\b', re.IGNORECASE)
]

DENY_PATTERNS = [
  re.compile(r'\b(conf t|configure|write|copy|reload|erase|delete)\b', re.IGNORECASE)
]


def is_command_allowed(command: str) -> bool:
  if any(p.search(command) for p in DENY_PATTERNS):
    return False
  return any(p.search(command) for p in ALLOW_PATTERNS)