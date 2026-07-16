'use client'

import { useEffect, useState } from 'react'
import { getLatestAnalysis } from '@/lib/api'
import { AnalysisOutput } from '@/lib/types'
import MarketSummary from '@/components/MarketSummary'
import TopPicks from '@/components/TopPicks'

export default function Dashboard() {
  const [data, setData] = useState<AnalysisOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLatestAnalysis().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading analysis...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Earnings Trigger</h1>
        <p className="text-gray-500">No analysis data available. Run the analysis first.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Earnings Trigger Dashboard</h1>
        <p className="text-gray-500">
          Last updated: {data.run_date} at {data.run_time}
        </p>
      </div>

      <MarketSummary summary={data.market_summary} />

      {data.top_picks.length > 0 ? (
        <TopPicks picks={data.top_picks} />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">No trades today</h2>
          <p className="text-yellow-700">Capital preservation is the best trade.</p>
        </div>
      )}

      {data.watchlist_changes.added.length > 0 && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Added to Watchlist</h3>
          {data.watchlist_changes.added.map((item) => (
            <p key={item.ticker} className="text-green-700">
              <a href={`/stock/${item.ticker}`} className="underline font-medium">{item.ticker}</a> - {item.reason}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
