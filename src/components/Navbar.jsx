import React, { useState, useEffect } from 'react'
import { Shield, Wifi } from 'lucide-react'

const Navbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-800/95 backdrop-blur-md border-b border-dark-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-400">CyberShield</h1>
              <p className="text-xs text-gray-400">ESP32 Security Platform</p>
            </div>
          </div>

          {/* Status and Time */}
          <div className="flex items-center space-x-6">
            {/* Live Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow"></div>
              <span className="text-green-400 text-sm font-semibold">LIVE</span>
            </div>

            {/* Current Time */}
            <div className="flex items-center space-x-2 text-gray-300">
              <Wifi className="w-4 h-4" />
              <span className="font-mono text-sm">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar