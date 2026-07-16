'use client'

import { useEffect, useState } from 'react'
import { getLatestAnalysis } from '@/lib/api'
import { AnalysisOutput } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'
import MarketSummary from '@/components/MarketSummary'
import TopPicks from '@/components/TopPicks'

export default function Dashboard() {
  const { t } = useTranslation()
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('dashboard.loading')}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{t('dashboard.empty_title')}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('dashboard.empty_message')}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('dashboard.empty_instruction')}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{t('dashboard.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {t('dashboard.last_updated', { date: data.run_date, time: data.run_time })}
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
            {t('dashboard.no_trades_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
            {t('dashboard.no_trades_desc')}
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
              {t('dashboard.upcoming_earnings', { count: data.earnings_universe.length })}
            </h2>
            <a href="/earningsTrigger/earnings/" style={{
              color: 'var(--accent-blue)',
              fontSize: '13px',
              textDecoration: 'none',
            }}>{t('dashboard.view_all')}</a>
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
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{stock.days_until_earnings}{t('dashboard.days_suffix')}</span>
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
