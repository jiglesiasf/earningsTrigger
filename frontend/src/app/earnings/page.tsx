'use client'

import { useEffect, useState } from 'react'
import { getLatestAnalysis } from '@/lib/api'
import { AnalysisOutput } from '@/lib/types'

export default function EarningsCalendar() {
  const [data, setData] = useState<AnalysisOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'days' | 'score'>('days')

  useEffect(() => {
    getLatestAnalysis().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-xl text-gray-500">Loading...</div>
  }

  if (!data || data.earnings_universe.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Earnings Calendar</h1>
        <p className="text-gray-500">No upcoming earnings data available.</p>
      </div>
    )
  }

  const sorted = [...data.earnings_universe].sort((a, b) => {
    if (sortBy === 'days') return a.days_until_earnings - b.days_until_earnings
    return (b.scores?.overall || 0) - (a.scores?.overall || 0)
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Earnings Calendar</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${sortBy === 'days' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            By Date
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${sortBy === 'score' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            By Score
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Ticker</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Company</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sector</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Days</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Score</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((stock) => (
              <tr key={stock.ticker} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={`/stock/${stock.ticker}`} className="text-blue-600 hover:underline font-semibold">
                    {stock.ticker}
                  </a>
                </td>
                <td className="px-4 py-3 text-gray-700">{stock.company}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">{stock.sector}</td>
                <td className="px-4 py-3 text-gray-600">{stock.earnings_date}</td>
                <td className="px-4 py-3 text-center font-semibold">{stock.days_until_earnings}d</td>
                <td className="px-4 py-3 font-semibold">${stock.price}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${
                    (stock.scores?.overall || 0) >= 80 ? 'text-green-600' :
                    (stock.scores?.overall || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(stock.scores?.overall || 0)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    stock.decision === 'STRONG BUY' ? 'bg-green-600 text-white' :
                    stock.decision === 'BUY' ? 'bg-green-500 text-white' :
                    stock.decision === 'WATCH' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {stock.decision}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
