# Architecture

## Session Flow (Interactive)
1) UI calls `POST /api/sessions` with `{ device_id, cols, rows }`.
2) API validates device allowlist and creates session in memory.
3) AsyncRunner schedules asyncssh `connect` + `create_process`.
4) UI opens WebSocket `ws://<host>/ws/sessions/<session_id>`.
5) WebSocket bridges stdin/stdout between xterm.js and asyncssh process.
6) Session manager tracks idle timeout and explicit close.

## WebSocket Schema
Client ? Server:
- `{ "type": "input", "data": "..." }`
- `{ "type": "resize", "cols": 120, "rows": 30 }`
- `{ "type": "close" }`

Server ? Client:
- `{ "type": "output", "data": "..." }`
- `{ "type": "status", "state": "connected"|"disconnected"|"error", "message"?: "..." }`

## Run Command Flow
1) UI calls `POST /api/commands/run` with `{ device_ids, command }`.
2) API validates policy allow/deny list.
3) AsyncRunner executes `asyncssh.connect` and `conn.run` concurrently.
4) API returns per-device results with stdout/stderr and duration.