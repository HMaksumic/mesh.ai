import type { WsClientMessage, WsServerMessage, ConnectionDetails } from '@mesh/shared'

export type SessionState = {
  sessionId: string
  connection: ConnectionDetails
  displayName?: string
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
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  } else if (ws.readyState === WebSocket.CONNECTING) {
    // Queue the message to send once connected
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify(msg))
    }, { once: true })
  }
}