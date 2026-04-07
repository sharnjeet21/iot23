import React, { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import MetricsGrid from './components/MetricsGrid'
import ChartsSection from './components/ChartsSection'
import LiveFeed from './components/LiveFeed'
import SystemLogs from './components/SystemLogs'
import ThreatHunt from './components/ThreatHunt'
import NodeMap from './components/NodeMap'
import SecurityPolicy from './components/SecurityPolicy'
import SettingsModal from './components/SettingsModal'
import ProfileModal from './components/ProfileModal'

const DEFAULT_IP = import.meta.env.VITE_SERVER_IP || '10.237.20.251'

function App() {
  const [serverIp, setServerIp] = useState(() => localStorage.getItem('serverIp') || DEFAULT_IP)
  const [connected, setConnected] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [paused, setPaused] = useState(false)

  const [systemStatus, setSystemStatus] = useState({
    esp32Connected: false, totalChecks: 0,
    threatsDetected: 0, threatRate: 0, lastUpdate: null
  })
  const [threats, setThreats] = useState([])
  const [logs, setLogs] = useState([
    { id: 1, type: 'info',    message: 'CyberShield SOC platform initialized', timestamp: new Date() },
    { id: 2, type: 'info',    message: `Connecting to backend at ${DEFAULT_IP}:5002`, timestamp: new Date() },
    { id: 3, type: 'warning', message: 'Waiting for ESP32 device connection...', timestamp: new Date() }
  ])
  const [chartData, setChartData] = useState({
    timeline: { labels: [], threats: [], safe: [] },
    traffic:  { labels: [], data: [] }
  })

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), type, message, timestamp: new Date() }, ...prev.slice(0, 49)])
  }, [])

  const updateCharts = useCallback((data) => {
    const time = new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    setChartData(prev => {
      const newTimeline = {
        labels:  [...prev.timeline.labels,  time].slice(-15),
        threats: [...prev.timeline.threats, data.is_malicious ? 1 : 0].slice(-15),
        safe:    [...prev.timeline.safe,    data.is_malicious ? 0 : 1].slice(-15)
      }
      const traffic = { labels: [...(prev.traffic.labels || [])], data: [...(prev.traffic.data || [])] }
      const idx = traffic.labels.indexOf(data.traffic_type)
      if (idx >= 0) traffic.data[idx]++
      else { traffic.labels.push(data.traffic_type); traffic.data.push(1) }
      return { timeline: newTimeline, traffic }
    })
  }, [])

  const handleNewDetection = useCallback((data) => {
    if (paused) return
    setThreats(prev => [{ id: Date.now(), ...data, timestamp: new Date(data.timestamp) }, ...prev.slice(0, 99)])
    updateCharts(data)
    addLog(`${data.traffic_type}: ${data.is_malicious ? '🚨 THREAT' : '✅ SAFE'}`,
      data.is_malicious ? 'danger' : 'success')
  }, [paused, updateCharts, addLog])

  const applyStatus = useCallback((status) => {
    setSystemStatus({
      esp32Connected:  status.esp32_connected  || false,
      totalChecks:     status.total_checks     || 0,
      threatsDetected: status.threats_detected || 0,
      threatRate:      status.threat_rate      || 0,
      lastUpdate:      status.last_update ? new Date(status.last_update) : null
    })
  }, [])

  useEffect(() => {
    const url = `http://${serverIp}:5002`
    const socket = io(url, { transports: ['websocket', 'polling'] })
    socket.on('connect',       () => { setConnected(true);  addLog(`Connected to ${url}`, 'success') })
    socket.on('disconnect',    () => { setConnected(false); addLog('Connection lost — reconnecting...', 'danger') })
    socket.on('new_detection', handleNewDetection)
    socket.on('status_update', applyStatus)

    const poll = setInterval(async () => {
      try { const r = await fetch(`${url}/api/status`); applyStatus(await r.json()) } catch (_) {}
    }, 5000)

    return () => { socket.close(); clearInterval(poll) }
  }, [serverIp])

  const handleSaveSettings = (newIp) => {
    localStorage.setItem('serverIp', newIp)
    setServerIp(newIp)
    addLog(`Server IP updated to ${newIp}`, 'info')
    setShowSettings(false)
  }

  const handleExportLogs = () => {
    const content = logs.map(l =>
      `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.type.toUpperCase()}: ${l.message}`
    ).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `cybershield-logs-${Date.now()}.txt`; a.click()
    addLog('Logs exported successfully', 'success')
  }

  const handleExportThreats = () => {
    const content = JSON.stringify(threats, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `cybershield-threats-${Date.now()}.json`; a.click()
    addLog('Threat data exported successfully', 'success')
  }

  const handleDeployPatch = () => {
    addLog('🔧 Initiating security patch deployment...', 'warning')
    setTimeout(() => addLog('✅ Security patch deployed successfully', 'success'), 2000)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'threat-hunt':   return <ThreatHunt threats={threats} addLog={addLog} serverIp={serverIp} />
      case 'node-map':      return <NodeMap systemStatus={systemStatus} serverIp={serverIp} />
      case 'system-logs':   return <div className="flex-1 p-4 overflow-hidden"><SystemLogs logs={logs} onClear={() => setLogs([{ id: Date.now(), type: 'info', message: 'Logs cleared', timestamp: new Date() }])} onExport={handleExportLogs} fullView /></div>
      case 'security-policy': return <SecurityPolicy addLog={addLog} />
      default: return (
        <>
          <MetricsGrid systemStatus={systemStatus} />
          <div style={{ height: '220px' }} className="shrink-0">
            <ChartsSection chartData={chartData} />
          </div>
          <div className="flex gap-4 flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <LiveFeed threats={threats} paused={paused} onPause={() => setPaused(p => !p)}
                onClear={() => { setThreats([]); addLog('Threat list cleared', 'info') }}
                onExport={handleExportThreats} />
            </div>
            <div className="w-80 shrink-0 min-h-0">
              <SystemLogs logs={logs} onClear={() => setLogs([{ id: Date.now(), type: 'info', message: 'Logs cleared', timestamp: new Date() }])} onExport={handleExportLogs} />
            </div>
          </div>
        </>
      )
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Navbar connected={connected} serverIp={serverIp}
        activePage={activePage} setActivePage={setActivePage}
        onSettings={() => setShowSettings(true)}
        onProfile={() => setShowProfile(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage}
          onDeploy={handleDeployPatch} systemStatus={systemStatus} />

        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {renderPage()}
        </main>
      </div>

      {showSettings && <SettingsModal serverIp={serverIp} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />}
      {showProfile  && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}

export default App
