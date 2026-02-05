import { useEffect, useMemo, useRef, useState } from 'react'
import type { CommandResult } from '@mesh/shared'
import { createSession, listDevices, runCommand } from './api'
import DeviceSidebar from './components/DeviceSidebar'
import SessionTabs from './components/SessionTabs'
import SplitView from './components/SplitView'
import CommandPanel from './components/CommandPanel'
import type { SessionState } from './types'
import type { WsClientMessage } from '@mesh/shared'

const defaultFilters = { tag: '', site: '', subnet: '', q: '' }

export default function App() {
  const [devices, setDevices] = useState([] as SessionState['device'][])
  const [filters, setFilters] = useState(defaultFilters)
  const [sessions, setSessions] = useState<SessionState[]>([])
  const [activeTabId, setActiveTabId] = useState<string>('')
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([])
  const [splitMode, setSplitMode] = useState(false)
  const [leftPaneId, setLeftPaneId] = useState<string>('')
  const [rightPaneId, setRightPaneId] = useState<string>('')
  const [commandInput, setCommandInput] = useState('')
  const [broadcastInput, setBroadcastInput] = useState('')
  const [commandResults, setCommandResults] = useState<CommandResult[]>([])
  const sendersRef = useRef<Map<string, (msg: WsClientMessage) => void>>(new Map())

  const selectedDevices = useMemo(
    () => sessions.filter((s) => selectedSessionIds.includes(s.sessionId)).map((s) => s.device),
    [sessions, selectedSessionIds]
  )

  useEffect(() => {
    listDevices(filters)
      .then(setDevices)
      .catch((err) => console.error(err))
  }, [filters])

  function openSession(device: SessionState['device'], cols: number, rows: number) {
    return createSession({ device_id: device.id, cols, rows }).then((res) => {
      const session: SessionState = {
        sessionId: res.session_id,
        device,
        status: 'disconnected'
      }
      setSessions((prev) => [...prev, session])
      setActiveTabId(res.session_id)
      if (!leftPaneId) setLeftPaneId(res.session_id)
      else if (!rightPaneId) setRightPaneId(res.session_id)
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
    if (!commandInput.trim() || selectedDevices.length === 0) return
    const res = await runCommand({
      device_ids: selectedDevices.map((d) => d.id),
      command: commandInput
    })
    setCommandResults(res.results)
  }

  return (
    <div className="app">
      <DeviceSidebar
        devices={devices}
        filters={filters}
        onFilters={setFilters}
        onConnect={openSession}
      />
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Mesh SSH Gateway</h1>
            <span className="pill">V1</span>
          </div>
          <div className="topbar-actions">
            <button onClick={() => setSplitMode((v) => !v)}>
              {splitMode ? 'Single View' : 'Split View'}
            </button>
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