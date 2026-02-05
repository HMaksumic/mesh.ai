import type { CommandResult } from '@mesh/shared'

type Props = {
  commandInput: string
  onCommandInput: (val: string) => void
  broadcastInput: string
  onBroadcastInput: (val: string) => void
  selectedSessions: string[]
  onBroadcast: (addNewline: boolean) => void
  onRunCommand: () => void
  results: CommandResult[]
}

export default function CommandPanel({
  commandInput,
  onCommandInput,
  broadcastInput,
  onBroadcastInput,
  selectedSessions,
  onBroadcast,
  onRunCommand,
  results
}: Props) {
  return (
    <section className="command-panel">
      <div className="command-row">
        <input
          placeholder="Broadcast typed input to selected sessions"
          value={broadcastInput}
          onChange={(e) => onBroadcastInput(e.target.value)}
        />
        <button onClick={() => onBroadcast(false)} disabled={selectedSessions.length === 0}>
          Broadcast Input
        </button>
        <button onClick={() => onBroadcast(true)} disabled={selectedSessions.length === 0}>
          Broadcast Command
        </button>
      </div>
      <div className="command-row">
        <input
          placeholder="Run read-only command (show, ping, traceroute, ip...)"
          value={commandInput}
          onChange={(e) => onCommandInput(e.target.value)}
        />
        <button onClick={onRunCommand} disabled={selectedSessions.length === 0}>
          Run on {selectedSessions.length} device(s)
        </button>
      </div>
      <div className="results">
        {results.length === 0 && <div className="muted">No results yet</div>}
        {results.map((r) => (
          <div key={r.device_id} className={`result ${r.ok ? 'ok' : 'err'}`}>
            <div className="result-header">
              <strong>{r.device_id}</strong>
              <span className="pill">{r.duration_ms}ms</span>
            </div>
            <pre>{r.stdout || '(no output)'}</pre>
            {r.stderr && <pre className="stderr">{r.stderr}</pre>}
          </div>
        ))}
      </div>
    </section>
  )
}