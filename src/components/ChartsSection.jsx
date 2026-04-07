import React from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler)

const DOUGHNUT_COLORS = [
  '#FF5630','#0052CC','#36B37E','#FFAB00',
  '#6554C0','#00B8D9','#FF8B00','#57D9A3'
]

const ChartsSection = ({ chartData }) => {

  const lineData = {
    labels: chartData.timeline.labels || [],
    datasets: [
      {
        label: 'Safe Traffic',
        data: chartData.timeline.safe || [],
        borderColor: '#36B37E',
        backgroundColor: 'rgba(54,179,126,0.08)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#36B37E',
        pointBorderColor: '#fff', pointBorderWidth: 2,
        pointRadius: 4, pointHoverRadius: 6, borderWidth: 3
      },
      {
        label: 'Malicious',
        data: chartData.timeline.threats || [],
        borderColor: '#FF5630',
        backgroundColor: 'rgba(255,86,48,0.08)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#FF5630',
        pointBorderColor: '#fff', pointBorderWidth: 2,
        pointRadius: 4, pointHoverRadius: 6, borderWidth: 3
      }
    ]
  }

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#42526E', font: { size: 11, weight: '600', family: 'Space Grotesk' }, usePointStyle: true, padding: 16 }
      },
      tooltip: {
        backgroundColor: '#172B4D', titleColor: '#fff', bodyColor: '#DFE1E6',
        borderColor: '#0052CC', borderWidth: 1, cornerRadius: 8
      }
    },
    scales: {
      x: { ticks: { color: '#7A869A', font: { size: 10 } }, grid: { color: 'rgba(122,134,154,0.1)' } },
      y: { ticks: { color: '#7A869A', font: { size: 10 } }, grid: { color: 'rgba(122,134,154,0.1)' }, beginAtZero: true }
    }
  }

  const doughnutData = {
    labels: chartData.traffic.labels || [],
    datasets: [{
      data: chartData.traffic.data || [],
      backgroundColor: DOUGHNUT_COLORS,
      borderWidth: 2, borderColor: '#F4F5F7',
      hoverBorderWidth: 3, hoverBorderColor: '#fff'
    }]
  }

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#42526E', font: { size: 10, weight: '600', family: 'Space Grotesk' }, padding: 10, usePointStyle: true }
      },
      tooltip: {
        backgroundColor: '#172B4D', titleColor: '#fff', bodyColor: '#DFE1E6',
        borderColor: '#0052CC', borderWidth: 1, cornerRadius: 8
      }
    }
  }

  return (
    <div className="flex gap-4 min-h-0" style={{ height: '100%' }}>

      {/* Timeline */}
      <div className="flex-1 bg-surface rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h3 className="font-headline font-bold text-on-surface text-xs uppercase tracking-widest">
            Threat Detection Timeline (Real-time)
          </h3>
          <div className="flex gap-4 text-[10px] uppercase font-headline font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Safe
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> Malicious
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Doughnut */}
      <div className="w-56 bg-surface rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col overflow-hidden">
        <h3 className="font-headline font-bold text-on-surface text-xs uppercase tracking-widest mb-3 shrink-0">
          Traffic Distribution
        </h3>
        <div className="flex-1 min-h-0">
          {chartData.traffic.labels?.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-xs text-center">
              <div>
                <div className="text-3xl mb-2">📊</div>
                <p>Waiting for<br />traffic data...</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default ChartsSection
