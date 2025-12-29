import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Navbar from './components/Navbar'
import MetricsGrid from './components/MetricsGrid'
import ChartsSection from './components/ChartsSection'
import LiveFeed from './components/LiveFeed'
import SystemLogs from './components/SystemLogs'

function App() {
  const [socket, setSocket] = useState(null)
  const [systemStatus, setSystemStatus] = useState({
    esp32Connected: false,
    totalChecks: 0,
    threatsDetected: 0,
    threatRate: 0,
    lastUpdate: null
  })
  const [threats, setThreats] = useState([])
  const [logs, setLogs] = useState([
    { id: 1, type: 'success', message: 'CyberShield platform initialized', timestamp: new Date() },
    { id: 2, type: 'info', message: 'Database connection established', timestamp: new Date() },
    { id: 3, type: 'warning', message: 'Waiting for ESP32 connection...', timestamp: new Date() }
  ])
  const [chartData, setChartData] = useState({
    timeline: { labels: [], threats: [], safe: [] },
    traffic: { labels: [], data: [] }
  })

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://10.128.138.251:5002', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      addLog('Connected to security server', 'success')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      addLog('Connection lost - attempting reconnect', 'danger')
    })

    newSocket.on('new_detection', (data) => {
      console.log('Received new detection:', data)
      handleNewDetection(data)
    })

    newSocket.on('status_update', (status) => {
      console.log('Received status update:', status)
      setSystemStatus(prev => {
        const newStatus = {
          ...prev,
          esp32Connected: status.esp32_connected || false,
          totalChecks: status.total_checks || 0,
          threatsDetected: status.threats_detected || 0,
          threatRate: status.threat_rate || 0,
          lastUpdate: status.last_update ? new Date(status.last_update) : null
        }
        console.log('Updated system status:', newStatus)
        return newStatus
      })
    })

    setSocket(newSocket)

    // Fallback: Fetch status every 5 seconds if WebSocket fails
    const statusInterval = setInterval(async () => {
      try {
        const response = await fetch('http://10.128.138.251:5002/api/status')
        const status = await response.json()
        console.log('Fetched status via API:', status)
        setSystemStatus(prev => ({
          ...prev,
          esp32Connected: status.esp32_connected || false,
          totalChecks: status.total_checks || 0,
          threatsDetected: status.threats_detected || 0,
          threatRate: status.threat_rate || 0,
          lastUpdate: status.last_update ? new Date(status.last_update) : null
        }))
      } catch (error) {
        console.error('Failed to fetch status:', error)
      }
    }, 5000)

    return () => {
      newSocket.close()
      clearInterval(statusInterval)
    }
  }, [])

  const handleNewDetection = (data) => {
    // Add to threats list
    const newThreat = {
      id: Date.now(),
      ...data,
      timestamp: new Date(data.timestamp)
    }
    
    setThreats(prev => [newThreat, ...prev.slice(0, 49)]) // Keep last 50

    // Update charts
    updateCharts(data)

    // Add log
    addLog(
      `${data.traffic_type}: ${data.is_malicious ? 'THREAT DETECTED' : 'SAFE'}`,
      data.is_malicious ? 'danger' : 'success'
    )
  }

  const updateCharts = (data) => {
    const time = new Date(data.timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    setChartData(prev => {
      const newTimeline = {
        labels: [...prev.timeline.labels, time].slice(-15),
        threats: [...prev.timeline.threats, data.is_malicious ? 1 : 0].slice(-15),
        safe: [...prev.timeline.safe, data.is_malicious ? 0 : 1].slice(-15)
      }

      const trafficTypes = { ...prev.traffic }
      const type = data.traffic_type
      const existingIndex = trafficTypes.labels?.indexOf(type) ?? -1
      
      if (existingIndex >= 0) {
        trafficTypes.data[existingIndex]++
      } else {
        trafficTypes.labels = [...(trafficTypes.labels || []), type]
        trafficTypes.data = [...(trafficTypes.data || []), 1]
      }

      return {
        timeline: newTimeline,
        traffic: trafficTypes
      }
    })
  }

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    }
    setLogs(prev => [newLog, ...prev.slice(0, 19)]) // Keep last 20
  }

  const clearThreats = () => {
    setThreats([])
    addLog('Threat list cleared by user', 'info')
  }

  const clearLogs = () => {
    setLogs([{
      id: Date.now(),
      type: 'info',
      message: 'System logs cleared',
      timestamp: new Date()
    }])
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Metrics Grid */}
        <MetricsGrid systemStatus={systemStatus} />
        
        {/* Charts Section */}
        <ChartsSection chartData={chartData} />
        
        {/* Live Feed and Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <LiveFeed threats={threats} onClear={clearThreats} />
          </div>
          <div>
            <SystemLogs logs={logs} onClear={clearLogs} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App