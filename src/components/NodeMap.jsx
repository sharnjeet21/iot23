import React, { useState } from 'react'

const NodeMap = ({ systemStatus, serverIp }) => {
  const [pingResult, setPingResult] = useState({})
  const [pinging, setPinging] = useState({})

  const nodes = [
    { id: 'esp32',     label: 'ESP32 Device',    icon: '🔌', ip: 'Dynamic (DHCP)', role: 'IoT Sensor',      status: systemStatus.esp32Connected ? 'online' : 'offline' },
    { id: 'ml-api',    label: 'ML API Server',   icon: '🤖', ip: `${serverIp}:8080`, role: 'ML Inference',  status: 'online' },
    { id: 'dashboard', label: 'Dashboard Backend', icon: '📊', ip: `${serverIp}:5002`, role: 'WebSocket Hub', status: 'online' },
    { id: 'react',     label: 'React Frontend',  icon: '🌐', ip: `${serverIp}:5001`, role: 'UI Layer',       status: 'online' },
    { id: 'mobile',    label: 'Mobile Scanner',  icon: '📱', ip: 'Mobile Browser',  role: 'Traffic Sender', status: 'unknown' },
  ]

  const connections = [
    { from: 'esp32', to: 'ml-api',    label: 'POST /predict/simple' },
    { from: 'ml-api', to: 'dashboard', label: 'POST /api/esp32_data' },
    { from: 'dashboard', to: 'react',  label: 'WebSocket events' },
    { from: 'mobile', to: 'esp32',    label: 'POST /scan' },
  ]

  const pingNode = async (node) => {
    setPinging(p => ({ ...p, [node.id]: true }))
    const url = node.ip.startsWith('Dynamic') ? null : `http://${node.ip.replace(':8080', ':8080').replace(':5002', ':5002').replace(':5001', ':5001')}/health`
    try {
      if (!url) throw new Error('Dynamic IP')
      const start = Date.now()
      await fetch(url, { signal: AbortSignal.timeout(3000) })
      const ms = Date.now() - start
      setPingResult(p => ({ ...p, [node.id]: `${ms}ms ✅` }))
    } catch {
      setPingResult(p => ({ ...p, [node.id]: 'Unreachable ❌' }))
    }
    setPinging(p => ({ ...p, [node.id]: false }))
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-widest shrink-0">🔗 Node Map</h2>

      {/* Architecture diagram */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-6 shrink-0">
        <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-6">System Architecture</h3>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['📱 Mobile', '→', '🔌 ESP32', '→', '🤖 ML API', '→', '📊 Backend', '→', '🌐 React UI'].map((item, i) => (
            <span key={i} className={`text-sm font-mono font-bold ${item === '→' ? 'text-on-surface-variant' : 'bg-primary-container text-on-primary-container px-3 py-1.5 rounded-lg'}`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Node cards */}
      <div className="grid grid-cols-1 gap-3 overflow-auto">
        {nodes.map(node => (
          <div key={node.id} className="bg-surface rounded-xl border border-outline-variant shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{node.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-sm text-on-surface">{node.label}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase
                    ${node.status === 'online' ? 'bg-secondary-container text-on-secondary'
                      : node.status === 'offline' ? 'bg-tertiary-container text-on-tertiary'
                      : 'bg-surface-container text-on-surface-variant'}`}>
                    {node.status}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">{node.ip}</div>
                <div className="text-[10px] text-on-surface-variant uppercase font-headline font-bold tracking-widest mt-0.5">{node.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {pingResult[node.id] && (
                <span className="text-[11px] font-mono text-on-surface-variant">{pingResult[node.id]}</span>
              )}
              <button onClick={() => pingNode(node)} disabled={pinging[node.id]}
                className="text-[10px] font-bold uppercase px-3 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
                {pinging[node.id] ? '⏳ Pinging...' : '📡 Ping'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connections */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-4 shrink-0">
        <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-3">Data Flow</h3>
        <div className="space-y-2">
          {connections.map(({ from, to, label }) => (
            <div key={`${from}-${to}`} className="flex items-center gap-3 text-xs font-mono">
              <span className="text-on-surface font-bold w-24 text-right">{nodes.find(n => n.id === from)?.label}</span>
              <span className="text-on-surface-variant">──→</span>
              <span className="text-on-surface font-bold w-28">{nodes.find(n => n.id === to)?.label}</span>
              <span className="text-on-surface-variant text-[10px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NodeMap
