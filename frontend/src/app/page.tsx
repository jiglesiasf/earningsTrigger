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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent-blue)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading analysis data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Earnings Trigger</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>No analysis data available.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Run the analysis backend to generate data.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Last updated: {data.run_date} at {data.run_time}
        </p>
      </div>

      <MarketSummary summary={data.market_summary} />

      {data.top_picks.length > 0 ? (
        <TopPicks picks={data.top_picks} />
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛡️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--accent-yellow)' }}>
            No trades today
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
            Capital preservation is the best trade. No stock met the conviction threshold for a recommendation.
          </p>
        </div>
      )}

      {data.earnings_universe.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>
              Upcoming Earnings ({data.earnings_universe.length} stocks)
            </h2>
            <a href="/earningsTrigger/earnings/" style={{
              color: 'var(--accent-blue)',
              fontSize: '13px',
              textDecoration: 'none',
            }}>View all →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
            {data.earnings_universe.slice(0, 8).map((stock: any) => (
              <a
                key={stock.ticker}
                href={`/earningsTrigger/stock/?ticker=${stock.ticker}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'background 0.15s',
                }}
              >
                <div>
                  <span style={{ fontWeight: '600', marginRight: '8px' }}>{stock.ticker}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{stock.days_until_earnings}d</span>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: (stock.scores?.overall || 0) >= 70 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                  color: (stock.scores?.overall || 0) >= 70 ? 'var(--accent-green)' : 'var(--text-muted)',
                }}>
                  {Math.round(stock.scores?.overall || 0)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
