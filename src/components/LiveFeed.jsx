import React from 'react'
import { Shield, Trash2, Network, Clock, Percent, Satellite } from 'lucide-react'
import clsx from 'clsx'

const ThreatBadge = ({ ismalicious, threatLevel }) => (
  <div className={clsx(
    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
    ismalicious 
      ? "bg-red-500 text-white" 
      : "bg-green-500 text-white"
  )}>
    {ismalicious ? 'MALICIOUS' : 'SAFE'}
  </div>
)

const ThreatLevelBadge = ({ level }) => (
  <div className={clsx(
    "px-2 py-1 rounded text-xs font-semibold",
    level === 'HIGH' && "bg-red-500 text-white",
    level === 'MEDIUM' && "bg-yellow-500 text-black", 
    level === 'LOW' && "bg-green-500 text-white",
    !level && "bg-gray-500 text-white"
  )}>
    {level || 'LOW'}
  </div>
)

const ThreatItem = ({ threat }) => {
  const threatClass = threat.threat_level?.toLowerCase() || 'minimal'
  
  return (
    <div className={clsx("threat-item", `threat-${threatClass}`)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="font-semibold text-white text-sm">{threat.traffic_type}</h4>
            <ThreatBadge ismalicious={threat.is_malicious} />
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Network className="w-3 h-3" />
              <span>{threat.ports || `${threat.id_orig_p} → ${threat.id_resp_p}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3" />
              <span>{(threat.confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{threat.timestamp.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          <ThreatLevelBadge level={threat.threat_level} />
        </div>
      </div>
    </div>
  )
}

const LiveFeed = ({ threats, onClear }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between p-6 border-b border-dark-700">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Live Threat Detection</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-semibold">MONITORING</span>
          </div>
          <button 
            onClick={onClear}
            className="btn-secondary text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-h-96 overflow-y-auto scrollbar-custom">
          {threats.length > 0 ? (
            threats.map((threat) => (
              <ThreatItem key={threat.id} threat={threat} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary-600 rounded-full flex items-center justify-center">
                <Satellite className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-primary-400 mb-2">
                Initializing Security Monitor
              </h4>
              <p className="text-gray-400 mb-4">Waiting for ESP32 device connection...</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Ready to receive threat data</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LiveFeed