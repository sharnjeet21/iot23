import React from 'react'

const NAV_ITEMS = [
  { icon: '📊', label: 'Dashboard',       page: 'dashboard' },
  { icon: '🎯', label: 'Threat Hunt',     page: 'threat-hunt' },
  { icon: '🔗', label: 'Node Map',        page: 'node-map' },
  { icon: '💻', label: 'System Logs',     page: 'system-logs' },
  { icon: '🛡️', label: 'Security Policy', page: 'security-policy' },
]

const Sidebar = ({ activePage, setActivePage, onDeploy, systemStatus }) => (
  <aside className="bg-surface-dim w-56 flex flex-col py-6 shrink-0 border-r border-outline-variant">
    {/* Admin */}
    <div className="px-6 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-high ring-1 ring-primary/20 flex items-center justify-center text-xl">👤</div>
        <div>
          <p className="text-on-surface font-bold text-sm font-headline">Admin Console</p>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-tighter">Level 4 Clearance</p>
        </div>
      </div>
    </div>

    {/* ESP32 mini status */}
    <div className="mx-6 mb-4 p-3 rounded-lg bg-surface border border-outline-variant">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-headline font-bold uppercase text-on-surface-variant">ESP32</span>
        <div className={`flex items-center gap-1 text-[10px] font-bold ${systemStatus.esp32Connected ? 'text-secondary' : 'text-error'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${systemStatus.esp32Connected ? 'bg-secondary animate-pulse' : 'bg-error'}`}></span>
          {systemStatus.esp32Connected ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>
      <div className="mt-1 text-[10px] text-on-surface-variant font-mono">
        Scans: {systemStatus.totalChecks || 0} | Threats: {systemStatus.threatsDetected || 0}
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-1">
      {NAV_ITEMS.map(({ icon, label, page }) => (
        <button key={page} onClick={() => setActivePage(page)}
          className={`w-full flex items-center px-6 py-3 cursor-pointer transition-all text-xs uppercase font-headline font-bold tracking-widest text-left
            ${activePage === page
              ? 'text-primary bg-primary-container/50 border-r-4 border-primary'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'}`}>
          <span className="mr-3 text-base">{icon}</span>
          {label}
        </button>
      ))}
    </nav>

    {/* Deploy Patch */}
    <div className="px-6 mb-4">
      <button onClick={onDeploy}
        className="w-full py-2.5 bg-primary text-on-primary font-headline text-xs font-bold uppercase tracking-widest rounded shadow-sm hover:brightness-110 active:scale-95 transition-all">
        🔧 Deploy Patch
      </button>
    </div>

    {/* Footer */}
    <div className="border-t border-outline-variant pt-4">
      <button onClick={() => window.open('https://github.com', '_blank')}
        className="w-full flex items-center px-6 py-3 text-on-surface-variant hover:text-primary cursor-pointer text-xs uppercase font-headline font-bold transition-colors">
        <span className="mr-3">❓</span> Support
      </button>
      <button onClick={() => { if (confirm('Logout from CyberShield SOC?')) window.location.reload() }}
        className="w-full flex items-center px-6 py-3 text-tertiary cursor-pointer text-xs uppercase font-headline font-bold hover:bg-red-50 transition-colors">
        <span className="mr-3">🚪</span> Logout
      </button>
    </div>
  </aside>
)

export default Sidebar
