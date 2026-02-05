import type { SessionState } from '../types'
import TerminalPane from './TerminalPane'
import type { WsClientMessage } from '@mesh/shared'
import Card from './ui/Card'

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

const selectClassName =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300'

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
    return (
      <div className="flex-1 min-h-0 p-4">
        {active ? (
          <TerminalPane
            key={active.sessionId}
            sessionId={active.sessionId}
            title={active.displayName || 'Session'}
            status={active.status}
            wsUrl={getWsUrl(active.sessionId)}
            onStatus={(state) => onStatus(active.sessionId, state)}
            onRegister={onRegister}
            onUnregister={onUnregister}
          />
        ) : (
          <Card className="flex h-full items-center justify-center text-sm text-neutral-500">
            No session selected
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 p-4">
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-3">
          <select
            value={left?.sessionId || ''}
            onChange={(e) => onLeftChange(e.target.value)}
            className={selectClassName}
          >
            <option value="">Select session</option>
            {sessions.map((s) => (
              <option key={s.sessionId} value={s.sessionId}>
                {s.displayName || s.sessionId}
              </option>
            ))}
          </select>
          {left ? (
            <TerminalPane
              key={left.sessionId}
              sessionId={left.sessionId}
              title={left.displayName || 'Session'}
              status={left.status}
              wsUrl={getWsUrl(left.sessionId)}
              onStatus={(state) => onStatus(left.sessionId, state)}
              onRegister={onRegister}
              onUnregister={onUnregister}
            />
          ) : (
            <Card className="flex h-full items-center justify-center text-sm text-neutral-500">
              No session selected
            </Card>
          )}
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <select
            value={right?.sessionId || ''}
            onChange={(e) => onRightChange(e.target.value)}
            className={selectClassName}
          >
            <option value="">Select session</option>
            {sessions.map((s) => (
              <option key={s.sessionId} value={s.sessionId}>
                {s.displayName || s.sessionId}
              </option>
            ))}
          </select>
          {right ? (
            <TerminalPane
              key={right.sessionId}
              sessionId={right.sessionId}
              title={right.displayName || 'Session'}
              status={right.status}
              wsUrl={getWsUrl(right.sessionId)}
              onStatus={(state) => onStatus(right.sessionId, state)}
              onRegister={onRegister}
              onUnregister={onUnregister}
            />
          ) : (
            <Card className="flex h-full items-center justify-center text-sm text-neutral-500">
              No session selected
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
