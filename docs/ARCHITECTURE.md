# Architecture

## Overview

The backend acts as a pure SSH bastion/gateway. Users provide connection details dynamically through the UI, and the backend establishes SSH connections using user-provided credentials.

## Session Flow (Interactive)

1) UI calls `POST /api/sessions` with `{ connection: { host, port, username, password/private_key }, cols, rows }`
2) API creates session in memory with provided connection details
3) AsyncRunner schedules asyncssh `connect` + `create_process` using user's credentials
4) UI opens WebSocket `ws://<host>/ws/sessions/<session_id>`
5) WebSocket bridges stdin/stdout between xterm.js and asyncssh process
6) Session manager tracks idle timeout and explicit close

## WebSocket Schema
Client → Server:
- `{ "type": "input", "data": "..." }`
- `{ "type": "resize", "cols": 120, "rows": 30 }`
- `{ "type": "close" }`

Server → Client:
- `{ "type": "output", "data": "..." }`
- `{ "type": "status", "state": "connected"|"disconnected"|"error", "message"?: "..." }`

## Run Command Flow

1) UI calls `POST /api/commands/run` with `{ connections: [...], command }`
2) API validates policy allow/deny list
3) AsyncRunner executes `asyncssh.connect` and `conn.run` concurrently using provided credentials
4) API returns per-connection results with stdout/stderr and duration