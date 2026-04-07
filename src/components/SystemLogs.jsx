import React, { useRef, useEffect, useState } from 'react'

const LOG_STYLE = {
  success: { color: 'text-secondary', prefix: 'OK:  ' },
  danger:  { color: 'text-tertiary',  prefix: 'ALRT:' },
  warning: { color: 'text-warn',      prefix: 'WARN:' },
  info:    { color: 'text-primary',   prefix: 'INFO:' },
}

const SystemLogs = ({ logs, onClear, onExport, fullView }) => {
  const bottomRef = useRef(null)
  const [filter, setFilter] = useState('all')
  const [autoScroll, setAutoScroll] = useState(true)

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, autoScroll])

  return (
    <div className={`bg-surface-dim rounded border border-outline-variant font-mono text-[11px] flex flex-col shadow-inner ${fullView ? 'h-full' : 'h-full'}`}>
      {/* Header */}
      <div className="flex justify-between items-center border-b border-outline-variant px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant font-bold uppercase text-[9px] tracking-widest">System Logs</span>
          <span className="bg-secondary-container text-on-secondary px-2 py-0.5 rounded text-[9px] font-bold uppercase">Live</span>
          <span className="text-[9px] text-on-surface-variant">({filtered.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAutoScroll(a => !a)}
            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded transition-colors ${autoScroll ? 'text-secondary' : 'text-on-surface-variant'}`}
            title="Toggle auto-scroll">
            {autoScroll ? '⬇ Auto' : '⬇ Off'}
          </button>
          {onExport && (
            <button onClick={onExport}
              className="text-[9px] font-bold uppercase text-on-surface-variant hover:text-primary transition-colors">
              Export
            </button>
          )}
          <button onClick={onClear}
            className="text-[9px] font-bold uppercase text-on-surface-variant hover:text-tertiary transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-outline-variant shrink-0">
        {['all', 'info', 'success', 'warning', 'danger'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded transition-colors
              ${filter === f ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 leading-relaxed space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center text-on-surface-variant py-4 text-[10px]">No log entries</div>
        ) : filtered.map(log => {
          const style = LOG_STYLE[log.type] || { color: 'text-on-surface-variant', prefix: 'SYS: ' }
          return (
            <div key={log.id} className="flex gap-2 hover:bg-surface-container rounded px-1 transition-colors">
              <span className="text-on-surface-variant shrink-0">
                [{new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}]
              </span>
              <span className={`shrink-0 ${style.color} font-bold`}>{style.prefix}</span>
              <span className="text-on-surface break-all">{log.message}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default SystemLogs
