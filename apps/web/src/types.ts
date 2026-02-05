import type { Device, WsClientMessage, WsServerMessage } from '@mesh/shared'

export type SessionState = {
  sessionId: string
  device: Device
  status: 'connected' | 'disconnected' | 'error'
  ws?: WebSocket
}

export type SessionMessageHandler = (msg: WsServerMessage) => void

export function openSessionSocket(
  wsUrl: string,
  onMessage: SessionMessageHandler,
  onStatus: (state: SessionState['status'], message?: string) => void
): WebSocket {
  const ws = new WebSocket(wsUrl)
  ws.onopen = () => onStatus('connected')
  ws.onclose = () => onStatus('disconnected')
  ws.onerror = () => onStatus('error', 'WebSocket error')
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WsServerMessage
      onMessage(msg)
    } catch (err) {
      onStatus('error', 'Invalid message')
    }
  }
  return ws
}

export function sendWs(ws: WebSocket, msg: WsClientMessage): void {
  ws.send(JSON.stringify(msg))
}