import React, { useState } from 'react'

const DEFAULT_RULES = [
  { id: 1, name: 'Block Botnet C&C',        enabled: true,  action: 'BLOCK',   severity: 'HIGH',   pattern: 'Ports 6660-6669' },
  { id: 2, name: 'Alert on Port Scan',       enabled: true,  action: 'ALERT',   severity: 'MEDIUM', pattern: 'Duration < 0.001s' },
  { id: 3, name: 'Block DDoS Floods',        enabled: true,  action: 'BLOCK',   severity: 'HIGH',   pattern: 'Port 80, bytes < 100' },
  { id: 4, name: 'Monitor Cryptomining',     enabled: false, action: 'MONITOR', severity: 'MEDIUM', pattern: 'Ports 4444-8888' },
  { id: 5, name: 'Block Data Exfiltration',  enabled: true,  action: 'BLOCK',   severity: 'HIGH',   pattern: 'Ports 21-25, bytes > 5000' },
  { id: 6, name: 'Alert on DNS Tunneling',   enabled: true,  action: 'ALERT',   severity: 'MEDIUM', pattern: 'Port 53, high freq' },
  { id: 7, name: 'Block Ransomware C&C',     enabled: true,  action: 'BLOCK',   severity: 'HIGH',   pattern: 'Ports 50000-60000' },
  { id: 8, name: 'Monitor IoT Malware',      enabled: true,  action: 'MONITOR', severity: 'HIGH',   pattern: 'Telnet ports 23/2323' },
]

const SecurityPolicy = ({ addLog }) => {
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [threshold, setThreshold] = useState(70)
  const [autoBlock, setAutoBlock] = useState(true)
  const [alertEmail, setAlertEmail] = useState('admin@cybershield.local')
  const [saved, setSaved] = useState(false)

  const toggleRule = (id) => {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
  }

  const handleSave = () => {
    addLog('🛡️ Security policy saved successfully', 'success')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setRules(DEFAULT_RULES)
    setThreshold(70)
    setAutoBlock(true)
    addLog('Security policy reset to defaults', 'info')
  }

  const actionColor = { BLOCK: 'bg-tertiary-container text-on-tertiary', ALERT: 'bg-yellow-100 text-yellow-800', MONITOR: 'bg-secondary-container text-on-secondary' }
  const severityColor = { HIGH: 'text-tertiary', MEDIUM: 'text-warn', LOW: 'text-secondary' }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-auto">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="font-headline font-bold text-lg text-on-surface uppercase tracking-widest">🛡️ Security Policy</h2>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="px-4 py-2 text-xs font-bold uppercase border border-outline-variant rounded-lg text-on-surface-variant hover:text-tertiary hover:border-tertiary transition-colors">
            Reset Defaults
          </button>
          <button onClick={handleSave}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${saved ? 'bg-secondary text-on-primary' : 'bg-primary text-on-primary hover:brightness-110'}`}>
            {saved ? '✅ Saved!' : 'Save Policy'}
          </button>
        </div>
      </div>

      {/* Global Settings */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-4 shrink-0">
        <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-4">Global Settings</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Confidence Threshold</label>
            <div className="flex items-center gap-3">
              <input type="range" min="0" max="100" value={threshold} onChange={e => setThreshold(Number(e.target.value))}
                className="flex-1 accent-primary" />
              <span className="text-sm font-bold font-mono text-primary w-10">{threshold}%</span>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">Block threats above this confidence</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Auto-Block Mode</label>
            <button onClick={() => { setAutoBlock(a => !a); addLog(`Auto-block ${!autoBlock ? 'enabled' : 'disabled'}`, 'info') }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-xs uppercase transition-all
                ${autoBlock ? 'bg-secondary-container border-secondary text-on-secondary' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
              <span className={`w-3 h-3 rounded-full ${autoBlock ? 'bg-secondary' : 'bg-outline'}`}></span>
              {autoBlock ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-2">Alert Email</label>
            <input value={alertEmail} onChange={e => setAlertEmail(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-primary text-on-surface" />
          </div>
        </div>
      </div>

      {/* Detection Rules */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex-1">
        <div className="p-4 border-b border-outline-variant bg-surface-dim">
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">
            Detection Rules ({rules.filter(r => r.enabled).length}/{rules.length} active)
          </h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-dim border-b border-outline-variant">
              <tr>
                {['Status', 'Rule Name', 'Pattern', 'Action', 'Severity', 'Toggle'].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-headline font-bold uppercase tracking-widest text-on-surface-variant text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3">
                    <span className={`w-2 h-2 rounded-full inline-block ${rule.enabled ? 'bg-secondary' : 'bg-outline'}`}></span>
                  </td>
                  <td className="px-4 py-3 font-bold text-on-surface">{rule.name}</td>
                  <td className="px-4 py-3 font-mono text-on-surface-variant">{rule.pattern}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${actionColor[rule.action]}`}>{rule.action}</span>
                  </td>
                  <td className={`px-4 py-3 font-bold ${severityColor[rule.severity]}`}>{rule.severity}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { toggleRule(rule.id); addLog(`Rule "${rule.name}" ${rule.enabled ? 'disabled' : 'enabled'}`, 'info') }}
                      className={`text-[9px] font-bold uppercase px-3 py-1 rounded border transition-colors
                        ${rule.enabled
                          ? 'border-tertiary text-on-tertiary bg-tertiary-container hover:bg-tertiary hover:text-on-primary'
                          : 'border-secondary text-on-secondary bg-secondary-container hover:bg-secondary hover:text-on-primary'}`}>
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SecurityPolicy
