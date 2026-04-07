import React, { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Operations', page: 'dashboard' },
  { label: 'Network',    page: 'node-map' },
  { label: 'Analytics',  page: 'threat-hunt' },
  { label: 'Archive',    page: 'system-logs' },
]

const Navbar = ({ connected, serverIp, activePage, setActivePage, onSettings, onProfile }) => {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])

  return (
    <header className="bg-surface flex justify-between items-center w-full px-6 py-3 h-16 shrink-0 z-50 border-b border-outline-variant">
      {/* Brand */}
      <button onClick={() => setActivePage('dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <span className="text-3xl">🛡️</span>
        <h1 className="text-xl font-bold uppercase tracking-widest text-primary font-headline">CyberShield SOC</h1>
      </button>

      {/* Live badge */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${connected ? 'bg-secondary-container border-secondary/20' : 'bg-red-50 border-red-200'}`}>
        <span className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-secondary shadow-[0_0_8px_#36B37E]' : 'bg-error'}`}></span>
        <span className={`font-headline text-xs tracking-widest font-bold uppercase ${connected ? 'text-on-secondary' : 'text-error'}`}>
          {connected ? 'Live Monitoring' : 'Reconnecting...'}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
          <span>{serverIp}:5002</span>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-secondary' : 'bg-error'}`}></span>
          <span className="text-[10px]">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>

        <nav className="hidden md:flex gap-5">
          {NAV_LINKS.map(({ label, page }) => (
            <button key={page} onClick={() => setActivePage(page)}
              className={`font-headline text-sm uppercase tracking-wider transition-colors duration-200 pb-1
                ${activePage === page || (activePage === 'dashboard' && page === 'dashboard')
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'}`}>
              {label}
            </button>
          ))}
        </nav>

        <div className="flex gap-3">
          <button onClick={onSettings} title="Settings"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary">
            ⚙️
          </button>
          <button onClick={onProfile} title="Profile"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary">
            👤
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
