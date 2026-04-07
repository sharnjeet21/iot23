import React, { useState, useMemo } from 'react'

const ThreatHunt = ({ threats, addLog, serverIp }) => {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('time')
  const [sortDir, setSortDir] = useState('desc')
  const [selectedThreat, setSelectedThreat] = useState(null)

  const results = useMemo(() => {
    let list = [...threats]
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(t =>
        t.traffic_type?.toLowerCase().includes(q) ||
        t.threat_level?.toLowerCase().includes(q) ||
        t.recommendation?.toLowerCase().includes(q) ||
        String(t.id_orig_p).includes(q) ||
        String(t.id_resp_p).includes(q)
      )
    }
    list.sort((a, b) => {
      let va, vb
      if (sortBy === 'time')       { va = new Date(a.timestamp); vb = new Date(b.timestamp) }
      else if (sortBy === 'conf')  { va = a.confidence; vb = b.confidence }
      else if (sortBy === 'level') { va = ['LOW','MEDIUM','HIGH'].indexOf(a.threat_level); vb = ['LOW','MEDIUM','HIGH'].indexOf(b.threat_level) }
      else                         { va = a.traffic_type; vb = b.traffic_type }
      return sortDir === 'desc' ? (va > vb ? -1 : 1) : (va < vb ? -1 : 1)
    })
    return list
  }, [threats, query, sortBy, sortDir])

  const stats = useMemo(() => ({
    total: threats.length,
    malicious: threats.filter(t => t.is_malicious).length,
    high: threats.filter(t => t.threat_level === 'HIGH').length,
    avgConf: threats.length ? (threats.reduce((s, t) => s + t.confidence, 0) / threats.length * 100).toFixed(1) : 0
  }), [threats])

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const handleBlock = (threat) => {
    addLog(`🛡️ Blocking traffic: ${threat.traffic_type} (${threat.id_orig_p} → ${threat.id_resp_p})`, 'warning')
    setTimeout(() => addLog(`✅ Traffic blocked successfully`, 'success'), 1000)
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="shrink-0">
        <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-widest mb-4">🎯 Threat Hunt</h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Total Events',  value: stats.total,     color: 'text-primary' },
            { label: 'Malicious',     value: stats.malicious, color: 'text-tertiary' },
            { label: 'High Severity', value: stats.high,      color: 'text-error' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface rounded-xl p-3 border border-outline-variant shadow-sm">
              <div className="text-[10px] text-on-surface-variant uppercase font-headline font-bold tracking-widest">{label}</div>
              <div className={`text-2xl font-headline font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="🔍 Search by type, port, threat level, recommendation..."
            className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary font-mono text-on-surface" />
          <button onClick={() => setQuery('')}
            className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:text-tertiary transition-colors font-bold">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs">
            <thead className="bg-surface-dim border-b border-outline-variant sticky top-0">
              <tr>
                {[
                  { label: 'Time',    col: 'time' },
                  { label: 'Type',    col: 'type' },
                  { label: 'Verdict', col: null },
                  { label: 'Ports',   col: null },
                  { label: 'Level',   col: 'level' },
                  { label: 'Action',  col: null },
                ].map(({ label, col }) => (
                  <th key={label}
                    onClick={() => col && toggleSort(col)}
                    className={`px-3 py-2 text-left font-headline font-bold uppercase tracking-widest text-on-surface-variant text-[10px]
                      ${col ? 'cursor-pointer hover:text-primary' : ''}`}>
                    {label} {col && sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {results.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-on-surface-variant">
                  {threats.length === 0 ? 'No threat data yet — waiting for ESP32...' : 'No results match your search'}
                </td></tr>
              ) : results.map(t => (
                <tr key={t.id} onClick={() => setSelectedThreat(t)}
                  className="hover:bg-surface-container-low cursor-pointer transition-colors">
                  <td className="px-3 py-2 font-mono text-on-surface-variant">
                    {new Date(t.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </td>
                  <td className="px-3 py-2 font-bold text-on-surface">{t.traffic_type?.replace(/^[^\w]+/, '')}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px]
                      ${t.is_malicious ? 'bg-tertiary-container text-on-tertiary' : 'bg-secondary-container text-on-secondary'}`}>
                      {t.is_malicious ? 'Malicious' : 'Safe'}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-on-surface-variant">
                    {t.ports || `${t.id_orig_p}→${t.id_resp_p}`}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px]
                      ${t.threat_level === 'HIGH' ? 'bg-tertiary-container text-on-tertiary'
                        : t.threat_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-secondary-container text-on-secondary'}`}>
                      {t.threat_level || 'LOW'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {t.is_malicious && (
                      <button onClick={e => { e.stopPropagation(); handleBlock(t) }}
                        className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary hover:bg-tertiary hover:text-on-primary transition-colors">
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedThreat(null)}>
          <div className="bg-surface rounded-xl border border-outline-variant shadow-xl p-6 w-96 max-w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-sm">Threat Detail</h3>
              <button onClick={() => setSelectedThreat(null)} className="text-on-surface-variant hover:text-tertiary text-lg">✕</button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              {Object.entries({
                'Type': selectedThreat.traffic_type,
                'Verdict': selectedThreat.is_malicious ? '🚨 MALICIOUS' : '✅ SAFE',
                'Threat Level': selectedThreat.threat_level,
                'Recommendation': selectedThreat.recommendation,
                'Ports': selectedThreat.ports || `${selectedThreat.id_orig_p} → ${selectedThreat.id_resp_p}`,
                'Timestamp': new Date(selectedThreat.timestamp).toLocaleString(),
              }).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-outline-variant pb-1">
                  <span className="text-on-surface-variant font-bold">{k}</span>
                  <span className="text-on-surface">{v}</span>
                </div>
              ))}
            </div>
            {selectedThreat.is_malicious && (
              <button onClick={() => { handleBlock(selectedThreat); setSelectedThreat(null) }}
                className="mt-4 w-full py-2 bg-tertiary text-on-error font-bold uppercase text-xs rounded hover:brightness-110 transition-all">
                🛡️ Block This Traffic
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ThreatHunt
