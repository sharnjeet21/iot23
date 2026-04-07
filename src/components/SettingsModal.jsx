import React, { useState } from 'react'

const SettingsModal = ({ serverIp, onSave, onClose }) => {
  const [ip, setIp] = useState(serverIp)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [interval, setIntervalVal] = useState(5)
  const [darkMode, setDarkMode] = useState(false)

  const testConnection = async () => {
    setTesting(true); setTestResult(null)
    try {
      const start = Date.now()
      const res = await fetch(`http://${ip}:8080/health`, { signal: AbortSignal.timeout(5000) })
      const data = await res.json()
      setTestResult({ ok: true, msg: `✅ Connected in ${Date.now() - start}ms — Models: ${data.available_models?.join(', ')}` })
    } catch (e) {
      setTestResult({ ok: false, msg: `❌ Failed: ${e.message}` })
    }
    setTesting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface rounded-xl border border-outline-variant shadow-2xl p-6 w-[480px] max-w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-bold text-on-surface uppercase tracking-widest">⚙️ Settings</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-tertiary text-xl transition-colors">✕</button>
        </div>

        <div className="space-y-5">
          {/* Server IP */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2 tracking-widest">Backend Server IP</label>
            <div className="flex gap-2">
              <input value={ip} onChange={e => setIp(e.target.value)}
                className="flex-1 bg-surface-dim border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary text-on-surface" />
              <button onClick={testConnection} disabled={testing}
                className="px-4 py-2 bg-primary-container text-on-primary-container font-bold text-xs uppercase rounded-lg hover:brightness-95 transition-all disabled:opacity-50">
                {testing ? '⏳' : '🔍 Test'}
              </button>
            </div>
            {testResult && (
              <p className={`text-[11px] mt-2 font-mono ${testResult.ok ? 'text-secondary' : 'text-tertiary'}`}>{testResult.msg}</p>
            )}
          </div>

          {/* Poll interval */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2 tracking-widest">Status Poll Interval</label>
            <div className="flex items-center gap-3">
              <input type="range" min="2" max="30" value={interval} onChange={e => setIntervalVal(Number(e.target.value))}
                className="flex-1 accent-primary" />
              <span className="text-sm font-bold font-mono text-primary w-16">{interval}s</span>
            </div>
          </div>

          {/* Dark mode toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Dark Mode</label>
              <p className="text-[10px] text-on-surface-variant mt-0.5">Toggle dark/light theme</p>
            </div>
            <button onClick={() => setDarkMode(d => !d)}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-primary' : 'bg-outline'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${darkMode ? 'left-6' : 'left-0.5'}`}></span>
            </button>
          </div>

          {/* Version info */}
          <div className="bg-surface-dim rounded-lg p-3 text-[11px] font-mono text-on-surface-variant">
            <div>CyberShield SOC v2.0.0</div>
            <div>ESP32 IoT Malware Detection System</div>
            <div>ML Models: Random Forest, Isolation Forest, Multiclass</div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-outline-variant rounded-lg text-xs font-bold uppercase text-on-surface-variant hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(ip)}
            className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold uppercase hover:brightness-110 active:scale-95 transition-all">
            Save & Reconnect
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
