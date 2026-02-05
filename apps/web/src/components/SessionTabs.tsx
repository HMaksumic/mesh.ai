import type { SessionState } from '../types'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { Tabs } from './ui/Tabs'

type Props = {
  sessions: SessionState[]
  activeTabId: string
  onActivate: (id: string) => void
  selectedSessionIds: string[]
  onSelectedChange: (ids: string[]) => void
  onClose: (id: string) => void
}

export default function SessionTabs({
  sessions,
  activeTabId,
  onActivate,
  selectedSessionIds,
  onSelectedChange,
  onClose
}: Props) {
  function toggleSelect(id: string) {
    if (selectedSessionIds.includes(id)) {
      onSelectedChange(selectedSessionIds.filter((s) => s !== id))
    } else {
      onSelectedChange([...selectedSessionIds, id])
    }
  }

  const statusTone: Record<SessionState['status'], 'neutral' | 'success' | 'warning' | 'error'> = {
    connected: 'success',
    disconnected: 'neutral',
    error: 'error'
  }

  return (
    <Tabs>
      {sessions.map((s) => (
        <div
          key={s.sessionId}
          className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
            activeTabId === s.sessionId
              ? 'border-neutral-300 bg-neutral-50'
              : 'border-neutral-200 bg-white'
          }`}
        >
          <button
            className="font-medium text-neutral-900"
            onClick={() => onActivate(s.sessionId)}
          >
            {s.device.name}
          </button>
          <Badge tone={statusTone[s.status]}>{s.status}</Badge>
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            <input
              type="checkbox"
              checked={selectedSessionIds.includes(s.sessionId)}
              onChange={() => toggleSelect(s.sessionId)}
              className="h-4 w-4 accent-neutral-900"
            />
            Broadcast
          </label>
          <Button variant="ghost" onClick={() => onClose(s.sessionId)} aria-label="Close tab">
            ×
          </Button>
        </div>
      ))}
    </Tabs>
  )
}
