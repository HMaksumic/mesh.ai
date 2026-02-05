import type { SessionState } from '../types'

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

  return (
    <div className="tabs">
      {sessions.map((s) => (
        <div
          key={s.sessionId}
          className={`tab ${activeTabId === s.sessionId ? 'active' : ''}`}
        >
          <button className="tab-title" onClick={() => onActivate(s.sessionId)}>
            {s.device.name}
          </button>
          <span className={`status ${s.status}`}>{s.status}</span>
          <label className="select">
            <input
              type="checkbox"
              checked={selectedSessionIds.includes(s.sessionId)}
              onChange={() => toggleSelect(s.sessionId)}
            />
            Broadcast
          </label>
          <button className="close" onClick={() => onClose(s.sessionId)}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}