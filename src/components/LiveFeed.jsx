import React, { useState } from 'react'

const LiveFeed = ({ threats, onClear, onExport, paused, onPause }) => {
  const [filter, setFilter] = useState('all') // all | malicious | safe
  const [search, setSearch] = useState('')

  const filtered = threats.filter(t => {
    if (filter === 'malicious' && !t.is_malicious) return false
    if (filter === 'safe' && t.is_malicious) return false
    if (search && !t.traffic_type?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-3 border-b border-outline-variant flex justify-between items-center bg-surface-dim shrink-0">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${paused ? 'bg-warn' : 'bg-tertiary animate-ping'}`}></span>
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface">Live Threat Detection</h3>
          <span className="text-[10px] text-on-surface-variant font-mono">{filtered.length}/{threats.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPause}
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded border transition-colors
              ${paused ? 'border-warn text-warn hover:bg-yellow-50' : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button onClick={onExport}
            className="text-[10px] font-bold uppercase text-on-surface-variant hover:text-primary transition-colors px-2 py-1 rounded border border-outline-variant hover:border-primary">
            ⬇ Export
          </button>
          <button onClick={onClear}
            className="text-[10px] font-bold uppercase text-on-surface-variant hover:text-tertiary transition-colors px-2 py-1 rounded border border-outline-variant hover:border-tertiary">
            🗑 Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 py-2 border-b border-outline-variant flex gap-2 shrink-0 bg-surface-dim">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search traffic type..."
          className="flex-1 text-[11px] bg-surface border border-outline-variant rounded px-2 py-1 outline-none focus:border-primary font-mono" />
        {['all', 'malicious', 'safe'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-colors
              ${filter === f
                ? f === 'malicious' ? 'bg-tertiary-container text-on-tertiary'
                  : f === 'safe' ? 'bg-secondary-container text-on-secondary'
                  : 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:bg-surface-container'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-surface">
        {filtered.length > 0 ? filtered.map(threat => (
          <ThreatItem key={threat.id} threat={threat} />
        )) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-on-surface-variant">
            <div className="text-4xl mb-3">📡</div>
            <p className="font-headline font-bold text-xs uppercase tracking-widest mb-1">
              {threats.length === 0 ? 'Monitoring Active' : 'No Results'}
            </p>
            <p className="text-[11px]">
              {threats.length === 0 ? 'Waiting for ESP32 device data...' : 'Try changing the filter'}
            </p>
            {threats.length === 0 && <div className="mt-3 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
          </div>
        )}
      </div>
    </div>
  )
}

const ThreatItem = ({ threat }) => {
  const [expanded, setExpanded] = useState(false)
  const isMalicious = threat.is_malicious
  const level = threat.threat_level || 'LOW'

  const levelStyle = { HIGH: 'bg-tertiary-container text-on-tertiary', MEDIUM: 'bg-yellow-100 text-yellow-800', LOW: 'bg-secondary-container text-on-secondary' }[level] || 'bg-surface-container text-on-surface-variant'

  return (
    <div className={`bg-surface-container-low rounded border-l-4 shadow-sm cursor-pointer transition-all hover:shadow-md
      ${isMalicious ? 'border-tertiary' : 'border-secondary'}`}
      onClick={() => setExpanded(e => !e)}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xl shrink-0">{getIcon(threat.traffic_type)}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-headline uppercase text-on-surface truncate">{cleanLabel(threat.traffic_type)}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${isMalicious ? 'bg-tertiary-container text-on-tertiary' : 'bg-secondary-container text-on-secondary'}`}>
                {isMalicious ? 'Malicious' : 'Safe'}
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
              {threat.ports || `${threat.id_orig_p} → ${threat.id_resp_p}`}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${levelStyle}`}>{level}</span>
          <p className="text-[9px] text-on-surface-variant mt-0.5">
            {new Date(threat.timestamp).toLocaleTimeString('en-US', { hour12: false })}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-outline-variant pt-2 text-[11px] font-mono text-on-surface-variant space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="font-bold text-on-surface">Recommendation:</span> {threat.recommendation}</div>
            <div><span className="font-bold text-on-surface">Source IP:</span> {threat.source_ip || 'ESP32_Device'}</div>
            <div><span className="font-bold text-on-surface">Orig Bytes:</span> {threat.orig_bytes || 'N/A'}</div>
            <div><span className="font-bold text-on-surface">Resp Bytes:</span> {threat.resp_bytes || 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function getIcon(type = '') {
  if (type.includes('HTTPS') || type.includes('HTTP')) return '🌐'
  if (type.includes('Port Scan') || type.includes('Scanning')) return '🚨'
  if (type.includes('DDoS')) return '⚡'
  if (type.includes('Botnet')) return '🤖'
  if (type.includes('Mining') || type.includes('Crypto')) return '⛏️'
  if (type.includes('Exfil')) return '📤'
  if (type.includes('Ransomware')) return '🔒'
  if (type.includes('Mirai') || type.includes('IoT Malware')) return '🌐'
  if (type.includes('Backdoor') || type.includes('RAT')) return '🚪'
  if (type.includes('DNS')) return '🕳️'
  if (type.includes('Keylogger')) return '⌨️'
  if (type.includes('Normal IoT')) return '🏠'
  return '📡'
}

function cleanLabel(type = '') { return type.replace(/^[^\w]+/, '').trim() }

export default LiveFeed
