# API

## GET /api/devices
Query params: `tag`, `site`, `subnet`, `q`

Response:
```json
[
  {
    "id": "r1",
    "name": "core-router-1",
    "host": "10.0.0.1",
    "port": 22,
    "username": "admin",
    "auth_method": "key",
    "tags": ["core", "router"],
    "subnet": "10.0.0.0/24",
    "site": "nyc"
  }
]
```

## POST /api/sessions
Request:
```json
{ "device_id": "r1", "cols": 120, "rows": 30 }
```

Response:
```json
{ "session_id": "uuid", "ws_url": "ws://localhost:8000/ws/sessions/uuid" }
```

## WebSocket /ws/sessions/<session_id>
Client ? Server:
```json
{ "type": "input", "data": "ls\n" }
```
```json
{ "type": "resize", "cols": 120, "rows": 30 }
```
```json
{ "type": "close" }
```

Server ? Client:
```json
{ "type": "output", "data": "..." }
```
```json
{ "type": "status", "state": "connected" }
```

## POST /api/commands/run
Request:
```json
{ "device_ids": ["r1", "s1"], "command": "show ip interface" }
```

Response:
```json
{
  "results": [
    { "device_id": "r1", "ok": true, "stdout": "...", "stderr": "", "duration_ms": 120 }
  ]
}
```

## GET /health
Response:
```json
{ "ok": true }
```