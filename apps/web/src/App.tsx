import { useMemo, useRef, useState } from 'react'
import type { CommandResult, ConnectionDetails } from '@mesh/shared'
import { createSession, runCommand } from './api'
import SessionTabs from './components/SessionTabs'
import SplitView from './components/SplitView'
import CommandPanel from './components/CommandPanel'
import ConnectionDialog from './components/ConnectionDialog'
import type { SessionState } from './types'
import type { WsClientMessage } from '@mesh/shared'
import Badge from './components/ui/Badge'
import Button from './components/ui/Button'

export default function App() {
  const [sessions, setSessions] = useState<SessionState[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
  const [splitMode, setSplitMode] = useState(false)
  const [leftPaneId, setLeftPaneId] = useState<string>('')
  const [rightPaneId, setRightPaneId] = useState<string>('')
  const [commandInput, setCommandInput] = useState('')
  const [broadcastInput, setBroadcastInput] = useState('')
  const [commandResults, setCommandResults] = useState<CommandResult[]>([])
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)
  const sendersRef = useRef<Map<string, (msg: WsClientMessage) => void>>(new Map())

  const selectedConnections = useMemo(
    () => sessions.filter((s) => selectedSessionIds.includes(s.sessionId)).map((s) => s.connection),
    [sessions, selectedSessionIds]
  )

  function openSession(connection: ConnectionDetails, cols = 80, rows = 24) {
    const displayName = `${connection.username}@${connection.host}`
    return createSession(connection, cols, rows).then((res) => {
      const session: SessionState = {
        sessionId: res.session_id,
        connection,
        displayName,
        status: 'disconnected'
      }
      setSessions((prev) => [...prev, session])
      setActiveTabId(res.session_id)
      if (!leftPaneId) setLeftPaneId(res.session_id)
      else if (!rightPaneId) setRightPaneId(res.session_id)
      setShowConnectionDialog(false)
      return res
    })
  }

  function closeSession(sessionId: string) {
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
    setSelectedSessionIds((prev) => prev.filter((id) => id !== sessionId))
    if (activeTabId === sessionId) setActiveTabId('')
    if (leftPaneId === sessionId) setLeftPaneId('')
    if (rightPaneId === sessionId) setRightPaneId('')
    sendersRef.current.delete(sessionId)
  }

  function updateSessionStatus(sessionId: string, status: SessionState['status']) {
    setSessions((prev) =>
      prev.map((s) => (s.sessionId === sessionId ? { ...s, status } : s))
    )
  }

  function registerSender(id: string, send: (msg: WsClientMessage) => void) {
    sendersRef.current.set(id, send)
  }

  function unregisterSender(id: string) {
    sendersRef.current.delete(id)
  }

  function broadcast(addNewline: boolean) {
    if (!broadcastInput.trim()) return
    const data = addNewline ? `${broadcastInput}\n` : broadcastInput
    selectedSessionIds.forEach((id) => {
      const send = sendersRef.current.get(id)
      if (send) send({ type: 'input', data })
    })
  }

  async function runCommandAcross() {
    if (!commandInput.trim() || selectedConnections.length === 0) return
    const res = await runCommand({
      connections: selectedConnections,
      command: commandInput
    })
    setCommandResults(res.results)
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50 font-sans text-neutral-900">
      {showConnectionDialog && (
        <ConnectionDialog
          onConnect={openSession}
          onCancel={() => setShowConnectionDialog(false)}
        />
      )}
      
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Mesh SSH Gateway</h1>
            <Badge>V1</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowConnectionDialog(true)}>
              New Connection
            </Button>
            <Button variant="secondary" onClick={() => setSplitMode((v) => !v)}>
              {splitMode ? 'Single View' : 'Split View'}
            </Button>
          </div>
        </header>

        <SessionTabs
          sessions={sessions}
          activeTabId={activeTabId}
          onActivate={setActiveTabId}
          selectedSessionIds={selectedSessionIds}
          onSelectedChange={setSelectedSessionIds}
          onClose={closeSession}
        />

        <SplitView
          sessions={sessions}
          activeTabId={activeTabId}
          splitMode={splitMode}
          leftPaneId={leftPaneId}
          rightPaneId={rightPaneId}
          onLeftChange={setLeftPaneId}
          onRightChange={setRightPaneId}
          onStatus={updateSessionStatus}
          onRegister={registerSender}
          onUnregister={unregisterSender}
        />

        <CommandPanel
          commandInput={commandInput}
          onCommandInput={setCommandInput}
          broadcastInput={broadcastInput}
          onBroadcastInput={setBroadcastInput}
          selectedSessions={selectedSessionIds}
          onBroadcast={broadcast}
          onRunCommand={runCommandAcross}
          results={commandResults}
        />
      </main>
    </div>
  )
}
