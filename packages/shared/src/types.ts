export interface Device {
  id: string
  name: string
  host: string
  port: number
  username: string
  auth_method: 'key' | 'password'
  tags: string[]
  subnet?: string
  site?: string
}

export interface SessionCreateRequest {
  device_id: string
  cols: number
  rows: number
}

export interface SessionCreateResponse {
  session_id: string
  ws_url: string
}

export interface CommandRunRequest {
  device_ids: string[]
  command: string
  timeout_sec?: number
}

export interface CommandResult {
  device_id: string
  ok: boolean
  stdout: string
  stderr?: string
  duration_ms: number
}

export interface CommandRunResponse {
  results: CommandResult[]
}

export type WsClientMessage =
  | { type: 'input'; data: string }
  | { type: 'resize'; cols: number; rows: number }
  | { type: 'close' }

export type WsServerMessage =
  | { type: 'output'; data: string }
  | { type: 'status'; state: 'connected' | 'disconnected' | 'error'; message?: string }