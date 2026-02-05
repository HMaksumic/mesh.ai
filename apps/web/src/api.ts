import type {
  CommandRunRequest,
  CommandRunResponse,
  Device,
  SessionCreateRequest,
  SessionCreateResponse
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

export async function listDevices(filters: Record<string, string | undefined>): Promise<Device[]> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v)
  })
  return fetchJson<Device[]>(`/api/devices?${params.toString()}`)
}

export async function createSession(body: SessionCreateRequest): Promise<SessionCreateResponse> {
  return fetchJson<SessionCreateResponse>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export async function runCommand(body: CommandRunRequest): Promise<CommandRunResponse> {
  return fetchJson<CommandRunResponse>('/api/commands/run', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}