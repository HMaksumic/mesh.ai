import { useCallback, useRef } from 'react'
import type { WsClientMessage, WsServerMessage } from '@mesh/shared'
import { openSessionSocket, sendWs } from '../types'

export function useSessionSocket(
  wsUrl: string,
  onMessage: (msg: WsServerMessage) => void,
  onStatus: (state: 'connected' | 'disconnected' | 'error', message?: string) => void
) {
  const wsRef = useRef<WebSocket | null>(null)

  const connect = useCallback(() => {
    const existing = wsRef.current
    if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
      return
    }

    const ws = openSessionSocket(wsUrl, onMessage, onStatus)
    const handleTerminalClose = () => {
      if (wsRef.current === ws) wsRef.current = null
    }
    ws.addEventListener('close', handleTerminalClose)
    ws.addEventListener('error', handleTerminalClose)
    wsRef.current = ws
  }, [wsUrl, onMessage, onStatus])

  const send = useCallback((msg: WsClientMessage) => {
    if (!wsRef.current) return
    sendWs(wsRef.current, msg)
  }, [])

  const close = useCallback(() => {
    if (!wsRef.current) return
    const ws = wsRef.current
    wsRef.current = null
    
    if (ws.readyState === WebSocket.OPEN) {
      try {
        sendWs(ws, { type: 'close' })
      } catch (err) {
        console.warn('[WS] Error sending close message:', err)
      }
    }
    
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'Client closing')
    }
  }, [])

  return { connect, send, close }
}
