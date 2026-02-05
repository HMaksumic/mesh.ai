import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import type { WsServerMessage, WsClientMessage } from '@mesh/shared'
import { useSessionSocket } from '../hooks/useSession'
import Badge from './ui/Badge'
import Card from './ui/Card'

const termOpts = {
  fontFamily:
    'Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 13,
  cursorBlink: true,
  theme: {
    background: '#0b0f14',
    foreground: '#e6edf3'
  }
}

type Status = 'connected' | 'disconnected' | 'error'

type Props = {
  sessionId: string
  title: string
  status: Status
  wsUrl: string
  onStatus: (state: Status, message?: string) => void
  onRegister: (sessionId: string, send: (msg: WsClientMessage) => void) => void
  onUnregister: (sessionId: string) => void
}

export default function TerminalPane({
  sessionId,
  title,
  status,
  wsUrl,
  onStatus,
  onRegister,
  onUnregister
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const terminalRef = useRef<Terminal | null>(null)

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
    let disposed = false
    let connected = false

    let fitTimeout: number | null = null
    if (containerRef.current) {
      term.open(containerRef.current)
      // Wait for DOM to settle before fitting
      fitTimeout = window.setTimeout(() => {
        if (disposed) return
        try {
          fit.fit()
        } catch (e) {
          console.warn('Failed to fit terminal:', e)
        }
      }, 50)
    }

    term.onData((data) => {
      if (connected) {
        send({ type: 'input', data })
      }
    })

    const connectTimeout = setTimeout(() => {
      if (disposed) return
      connect()
      connected = true
      
      // Wait for connection before sending resize
      setTimeout(() => {
        if (disposed || !term.element) return
        send({ type: 'resize', cols: term.cols, rows: term.rows })
      }, 200)
    }, 100)

    onRegister(sessionId, send)

    function handleResize() {
      if (disposed) return
      try {
        fit.fit()
        send({ type: 'resize', cols: term.cols, rows: term.rows })
      } catch (e) {
        console.warn('Failed to resize terminal:', e)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      disposed = true
      if (fitTimeout !== null) window.clearTimeout(fitTimeout)
      clearTimeout(connectTimeout)
      window.removeEventListener('resize', handleResize)
      onUnregister(sessionId)
      
      close()
      
      setTimeout(() => {
        if (terminalRef.current === term) {
          term.dispose()
          terminalRef.current = null
        }
      }, 10)
    }
  }, [sessionId])

  const tone = status === 'connected' ? 'success' : status === 'error' ? 'error' : 'neutral'

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden max-h-[600px]">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-2">
        <div className="text-sm font-medium text-neutral-900">{title}</div>
        <Badge tone={tone}>{status}</Badge>
      </div>
      <div className="flex-1 min-h-0 bg-neutral-900">
        <div className="h-full w-full" ref={containerRef} />
      </div>
    </Card>
  )
}
