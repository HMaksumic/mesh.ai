import type { SessionState } from '../types'
import TerminalPane from './TerminalPane'
import type { WsClientMessage } from '@mesh/shared'

function getWsUrl(sessionId: string): string {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${location.host}/ws/sessions/${sessionId}`
}

type Props = {
  sessions: SessionState[]
  activeTabId: string
  splitMode: boolean
  leftPaneId: string
  rightPaneId: string
  onLeftChange: (id: string) => void
  onRightChange: (id: string) => void
  onStatus: (id: string, state: SessionState['status']) => void
  onRegister: (id: string, send: (msg: WsClientMessage) => void) => void
  onUnregister: (id: string) => void
}

export default function SplitView({
  sessions,
  activeTabId,
  splitMode,
  leftPaneId,
  rightPaneId,
  onLeftChange,
  onRightChange,
  onStatus,
  onRegister,
  onUnregister
}: Props) {
  const active = sessions.find((s) => s.sessionId === activeTabId)
  const left = sessions.find((s) => s.sessionId === leftPaneId)
  const right = sessions.find((s) => s.sessionId === rightPaneId)

  if (!splitMode) {
    if (!active) return <div className="empty">No session selected</div>
    return (
      <TerminalPane
        key={active.sessionId}
        sessionId={active.sessionId}
        wsUrl={getWsUrl(active.sessionId)}
        onStatus={(state) => onStatus(active.sessionId, state)}
        onRegister={onRegister}
        onUnregister={onUnregister}
      />
    )
  }

  return (
    <div className="split">
      <div className="pane">
        <select
          value={left?.sessionId || ''}
          onChange={(e) => onLeftChange(e.target.value)}
        >
          <option value="">Select session</option>
          {sessions.map((s) => (
            <option key={s.sessionId} value={s.sessionId}>
              {s.device.name}
            </option>
          ))}
        </select>
        {left ? (
          <TerminalPane
            key={left.sessionId}
            sessionId={left.sessionId}
            wsUrl={getWsUrl(left.sessionId)}
            onStatus={(state) => onStatus(left.sessionId, state)}
            onRegister={onRegister}
            onUnregister={onUnregister}
          />
        ) : (
          <div className="empty">No session selected</div>
        )}
      </div>
      <div className="pane">
        <select
          value={right?.sessionId || ''}
          onChange={(e) => onRightChange(e.target.value)}
        >
          <option value="">Select session</option>
          {sessions.map((s) => (
            <option key={s.sessionId} value={s.sessionId}>
              {s.device.name}
            </option>
          ))}
        </select>
        {right ? (
          <TerminalPane
            key={right.sessionId}
            sessionId={right.sessionId}
            wsUrl={getWsUrl(right.sessionId)}
            onStatus={(state) => onStatus(right.sessionId, state)}
            onRegister={onRegister}
            onUnregister={onUnregister}
          />
        ) : (
          <div className="empty">No session selected</div>
        )}
      </div>
    </div>
  )
}