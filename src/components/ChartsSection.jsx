import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { TrendingUp, PieChart, RefreshCw } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const ChartsSection = ({ chartData }) => {
  const timelineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb',
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af', font: { size: 11 } },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { color: '#9ca3af', font: { size: 11 } },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        beginAtZero: true
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  const timelineData = {
    labels: chartData.timeline.labels || [],
    datasets: [
      {
        label: 'Threats Detected',
        data: chartData.timeline.threats || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      },
      {
        label: 'Safe Traffic',
        data: chartData.timeline.safe || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  }

  const trafficOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
          font: { size: 11, weight: '600' },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8
      }
    }
  }

  const trafficData = {
    labels: chartData.traffic.labels || [],
    datasets: [
      {
        data: chartData.traffic.data || [],
        backgroundColor: [
          '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981',
          '#f59e0b', '#ef4444', '#6b7280', '#ec4899'
        ],
        borderWidth: 2,
        borderColor: '#1e293b',
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }
    ]
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      {/* Timeline Chart */}
      <div className="xl:col-span-2 card card-hover">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Threat Detection Timeline</h3>
          </div>
          <div className="text-sm text-gray-400">Real-time Analysis</div>
        </div>
        <div className="p-6">
          <div className="h-80">
            <Line data={timelineData} options={timelineOptions} />
          </div>
        </div>
      </div>

      {/* Traffic Analysis */}
      <div className="card card-hover">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <PieChart className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Traffic Analysis</h3>
          </div>
          <button className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <div className="h-80">
            {chartData.traffic.labels?.length > 0 ? (
              <Doughnut data={trafficData} options={trafficOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Waiting for traffic data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartsSection