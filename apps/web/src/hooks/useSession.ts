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
    try {
      sendWs(wsRef.current, { type: 'close' })
    } catch {
      // ignore
    }
    wsRef.current.close()
    wsRef.current = null
  }, [])

  return { connect, send, close }
}
