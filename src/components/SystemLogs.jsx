import React from 'react'
import { Terminal, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import clsx from 'clsx'

const LogIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'danger':
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    default:
      return <Info className="w-4 h-4 text-blue-500" />
  }
}

const LogEntry = ({ log }) => (
  <div className={clsx(
    "p-3 rounded-lg border-l-4 mb-3 font-mono text-sm",
    log.type === 'success' && "bg-green-500/10 border-green-500 text-green-400",
    log.type === 'danger' && "bg-red-500/10 border-red-500 text-red-400",
    log.type === 'warning' && "bg-yellow-500/10 border-yellow-500 text-yellow-400",
    log.type === 'info' && "bg-blue-500/10 border-blue-500 text-blue-400"
  )}>
    <div className="flex items-start gap-2">
      <LogIcon type={log.type} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 text-xs">
            {log.timestamp.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
        <div>{log.message}</div>
      </div>
    </div>
  </div>
)

const SystemLogs = ({ logs, onClear }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between p-6 border-b border-dark-700">
        <div className="flex items-center space-x-3">
          <Terminal className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">System Monitor</h3>
        </div>
        <button 
          onClick={onClear}
          className="btn-secondary text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear
        </button>
      </div>
      
      <div className="p-6">
        <div className="max-h-96 overflow-y-auto scrollbar-custom">
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SystemLogs