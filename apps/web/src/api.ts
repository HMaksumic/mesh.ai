import type {
  CommandRunRequest,
  CommandRunResponse,
  SessionCreateRequest,
  SessionCreateResponse,
  ConnectionDetails
} from '@mesh/shared'

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

export async function createSession(
  connection: ConnectionDetails,
  cols: number,
  rows: number
): Promise<SessionCreateResponse> {
  return fetchJson<SessionCreateResponse>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ connection, cols, rows })
  })
}

export async function runCommand(body: CommandRunRequest): Promise<CommandRunResponse> {
  return fetchJson<CommandRunResponse>('/api/commands/run', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}