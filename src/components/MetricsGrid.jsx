import React from 'react'

const MetricsGrid = ({ systemStatus }) => {
  const threatRate = systemStatus.threatRate || 0
  const rateColor = threatRate > 50 ? 'text-tertiary' : threatRate > 20 ? 'text-warn' : 'text-secondary'
  const rateBarColor = threatRate > 50 ? 'bg-tertiary' : threatRate > 20 ? 'bg-warn' : 'bg-secondary'

  return (
    <div className="grid grid-cols-4 gap-4 shrink-0">

      {/* ESP32 Status */}
      <div className="bg-surface p-4 rounded-xl flex flex-col gap-1 border border-outline-variant shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-on-surface-variant text-[10px] uppercase font-headline font-bold tracking-widest">
            Controller Status
          </span>
          <div className={`w-2.5 h-2.5 rounded-full ${systemStatus.esp32Connected ? 'bg-secondary shadow-[0_0_8px_#36B37E] animate-pulse' : 'bg-error'}`}></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔌</span>
          <div className="text-xl font-headline font-bold text-on-surface">
            ESP32{' '}
            <span className={`text-sm ml-1 font-bold ${systemStatus.esp32Connected ? 'text-secondary' : 'text-error'}`}>
              {systemStatus.esp32Connected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Scans */}
      <div className="bg-surface p-4 rounded-xl flex flex-col gap-1 border border-outline-variant shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-on-surface-variant text-[10px] uppercase font-headline font-bold tracking-widest">
            Active Scans
          </span>
          <span className="text-primary text-lg">🔍</span>
        </div>
        <div className="text-3xl font-headline font-bold text-primary">
          {systemStatus.totalChecks?.toLocaleString() || '0'}
        </div>
        <div className="text-[10px] text-on-surface-variant uppercase tracking-tighter font-medium">
          Total Network Probes
        </div>
      </div>

      {/* Threats Detected */}
      <div className="bg-surface p-4 rounded-xl flex flex-col gap-1 border border-outline-variant shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-on-surface-variant text-[10px] uppercase font-headline font-bold tracking-widest">
            Detected Threats
          </span>
          <span className="text-tertiary text-xs font-bold flex items-center gap-0.5">
            ↑ {threatRate.toFixed(1)}%
          </span>
        </div>
        <div className="text-3xl font-headline font-bold text-tertiary">
          {systemStatus.threatsDetected?.toLocaleString() || '0'}
        </div>
        <div className="text-[10px] text-on-surface-variant uppercase tracking-tighter font-medium">
          High Confidence Matches
        </div>
      </div>

      {/* Risk Level */}
      <div className="bg-surface p-4 rounded-xl flex flex-col gap-1 border border-outline-variant shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-on-surface-variant text-[10px] uppercase font-headline font-bold tracking-widest">
            Exposure Index
          </span>
          <span className="text-warn text-lg">⚠️</span>
        </div>
        <div className={`text-3xl font-headline font-bold ${rateColor}`}>
          {threatRate.toFixed(1)}%
        </div>
        <div className="w-full bg-surface-container-high h-2 rounded-full mt-2 overflow-hidden">
          <div className={`${rateBarColor} h-full transition-all duration-500`} style={{ width: `${Math.min(threatRate, 100)}%` }}></div>
        </div>
      </div>

    </div>
  )
}

export default MetricsGrid
