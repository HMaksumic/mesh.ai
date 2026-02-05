export interface ConnectionDetails {
  host: string
  port: number
  username: string
  password?: string  // Optional: if not provided, SSH will prompt in terminal
  private_key?: string  // Optional: if not provided, SSH will prompt in terminal
}

export interface SessionCreateRequest {
  connection: ConnectionDetails
  cols: number
  rows: number
}

export interface SessionCreateResponse {
  session_id: string
  ws_url: string
}

export interface CommandRunRequest {
  connections: ConnectionDetails[]
  command: string
  timeout_sec?: number
}

export interface CommandResult {
  host: string
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