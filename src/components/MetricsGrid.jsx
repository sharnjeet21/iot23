import React from 'react'
import { Cpu, Search, AlertTriangle, Percent, Circle } from 'lucide-react'
import clsx from 'clsx'

const MetricCard = ({ icon: Icon, title, value, color, status }) => (
  <div className="metric-card">
    <div className={clsx(
      "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
      color === 'blue' && "bg-primary-600",
      color === 'green' && "bg-green-600", 
      color === 'red' && "bg-red-600",
      color === 'yellow' && "bg-yellow-600"
    )}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    
    <div className="text-3xl font-bold text-primary-400 mb-2">
      {status ? (
        <Circle className={clsx(
          "w-8 h-8 mx-auto",
          status === 'online' ? "text-green-500 fill-current" : "text-red-500 fill-current"
        )} />
      ) : (
        value
      )}
    </div>
    
    <div className="text-gray-300 font-semibold text-sm uppercase tracking-wider">
      {title}
    </div>
  </div>
)

const MetricsGrid = ({ systemStatus }) => {
  console.log('MetricsGrid received systemStatus:', systemStatus)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <MetricCard
        icon={Cpu}
        title="ESP32 Device"
        status={systemStatus.esp32Connected ? 'online' : 'offline'}
        color="blue"
      />
      
      <MetricCard
        icon={Search}
        title="Security Scans"
        value={systemStatus.totalChecks?.toLocaleString() || '0'}
        color="green"
      />
      
      <MetricCard
        icon={AlertTriangle}
        title="Threats Detected"
        value={systemStatus.threatsDetected?.toLocaleString() || '0'}
        color="red"
      />
      
      <MetricCard
        icon={Percent}
        title="Risk Level"
        value={`${systemStatus.threatRate || 0}%`}
        color="yellow"
      />
    </div>
  )
}

export default MetricsGrid