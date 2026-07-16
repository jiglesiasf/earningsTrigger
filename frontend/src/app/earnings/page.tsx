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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  if (!data || data.earnings_universe.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Earnings Calendar</h1>
        <p style={{ color: 'var(--text-secondary)' }}>No upcoming earnings data available.</p>
      </div>
    )
  }

  const sorted = [...data.earnings_universe].sort((a, b) => {
    if (sortBy === 'days') return a.days_until_earnings - b.days_until_earnings
    return (b.scores?.overall || 0) - (a.scores?.overall || 0)
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>Earnings Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {data.earnings_universe.length} stocks reporting in the next 14 days
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '8px', padding: '4px' }}>
          <button
            onClick={() => setSortBy('days')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: sortBy === 'days' ? 'var(--accent-blue)' : 'transparent',
              color: sortBy === 'days' ? 'white' : 'var(--text-secondary)',
            }}
          >
            By Date
          </button>
          <button
            onClick={() => setSortBy('score')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              background: sortBy === 'score' ? 'var(--accent-blue)' : 'transparent',
              color: sortBy === 'score' ? 'white' : 'var(--text-secondary)',
            }}
          >
            By Score
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {['Ticker', 'Company', 'Sector', 'Date', 'Days', 'Price', 'Score', 'Decision'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((stock, i) => (
              <tr key={stock.ticker} style={{
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                background: 'var(--bg-card)',
              }}>
                <td style={{ padding: '12px 16px' }}>
                  <a href={`/earningsTrigger/stock/?ticker=${stock.ticker}`} style={{
                    color: 'var(--accent-blue)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}>{stock.ticker}</a>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{stock.company}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>{stock.sector}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{stock.earnings_date}</td>
                <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>{stock.days_until_earnings}d</td>
                <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>${stock.price}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: (stock.scores?.overall || 0) >= 80 ? '#22c55e' : (stock.scores?.overall || 0) >= 60 ? '#eab308' : 'var(--text-muted)',
                  }}>
                    {Math.round(stock.scores?.overall || 0)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                    background: stock.decision === 'BUY' ? 'rgba(34,197,94,0.15)' : stock.decision === 'WATCH' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)',
                    color: stock.decision === 'BUY' ? '#22c55e' : stock.decision === 'WATCH' ? '#eab308' : 'var(--text-muted)',
                  }}>
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
