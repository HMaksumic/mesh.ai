import type { CommandResult } from '@mesh/shared'
import Button from './ui/Button'
import Input from './ui/Input'
import Card from './ui/Card'
import Badge from './ui/Badge'

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
    <section className="border-t border-neutral-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            placeholder="Broadcast typed input to selected sessions"
            value={broadcastInput}
            onChange={(e) => onBroadcastInput(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => onBroadcast(false)}
              disabled={selectedSessions.length === 0}
            >
              Broadcast Input
            </Button>
            <Button
              variant="secondary"
              onClick={() => onBroadcast(true)}
              disabled={selectedSessions.length === 0}
            >
              Broadcast Command
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            placeholder="Run read-only command (show, ping, traceroute, ip...)"
            value={commandInput}
            onChange={(e) => onCommandInput(e.target.value)}
          />
          <Button onClick={onRunCommand} disabled={selectedSessions.length === 0}>
            Run on {selectedSessions.length} device(s)
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {results.length === 0 && (
          <div className="text-sm text-neutral-500">No results yet</div>
        )}
        {results.map((r) => (
          <Card
            key={r.host}
            className={`flex flex-col gap-2 p-3 ${
              r.ok ? 'border-emerald-200' : 'border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">{r.host}</div>
              <Badge>{r.duration_ms}ms</Badge>
            </div>
            <pre className="whitespace-pre-wrap text-xs font-mono text-neutral-700">
              {r.stdout || '(no output)'}
            </pre>
            {r.stderr && (
              <pre className="whitespace-pre-wrap text-xs font-mono text-rose-600">{r.stderr}</pre>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
