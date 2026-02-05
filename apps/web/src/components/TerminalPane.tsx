import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import type { WsServerMessage, WsClientMessage } from '@mesh/shared'
import { useSessionSocket } from '../hooks/useSession'

const termOpts = {
  fontFamily: 'Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 13,
  cursorBlink: true,
  theme: {
    background: '#0b0f14',
    foreground: '#e6edf3'
  }
}

type Props = {
  sessionId: string
  wsUrl: string
  onStatus: (state: 'connected' | 'disconnected' | 'error', message?: string) => void
  onRegister: (sessionId: string, send: (msg: WsClientMessage) => void) => void
  onUnregister: (sessionId: string) => void
}

export default function TerminalPane({ sessionId, wsUrl, onStatus, onRegister, onUnregister }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)

  const onMessage = (msg: WsServerMessage) => {
    if (msg.type === 'output') terminalRef.current?.write(msg.data)
    if (msg.type === 'status') onStatus(msg.state, msg.message)
  }

  const { connect, send, close } = useSessionSocket(wsUrl, onMessage, onStatus)

  useEffect(() => {
    const term = new Terminal(termOpts)
    const fit = new FitAddon()
    term.loadAddon(fit)
    terminalRef.current = term
    fitRef.current = fit

    if (containerRef.current) {
      term.open(containerRef.current)
      fit.fit()
    }

    term.onData((data) => {
      send({ type: 'input', data })
    })

    connect()
    send({ type: 'resize', cols: term.cols, rows: term.rows })

    onRegister(sessionId, send)

    function handleResize() {
      fit.fit()
      send({ type: 'resize', cols: term.cols, rows: term.rows })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      onUnregister(sessionId)
      close()
      term.dispose()
    }
  }, [connect, send, close, sessionId, onRegister, onUnregister])

  return <div className="terminal" ref={containerRef} />
}