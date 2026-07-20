'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getStockData, getHistoricalData } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { TechnicalBreakdown, FundamentalBreakdown, OptionsBreakdown, SentimentBreakdown, HistoricalBreakdown, MacroBreakdown, OverallBreakdown } from '@/components/ScoreBreakdown'
import HistoricalAnalysis from '@/components/HistoricalAnalysis'

function ScoreBox({ label, score, color, noData, noDataLabel }: { label: string; score: number; color: string; noData?: boolean; noDataLabel?: string }) {
  const bg = `${color}12`
  return (
    <div style={{ flex: '1 1 0', background: bg, borderRadius: '12px', padding: '16px', textAlign: 'center', border: `1px solid ${color}20` }}>
      <div style={{ fontSize: noData ? '16px' : '28px', fontWeight: '700', color: noData ? 'var(--text-muted)' : color }}>{noData ? '—' : Math.round(score)}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>{label}</div>
      {noData && noDataLabel && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', opacity: 0.7 }}>{noDataLabel}</div>}
    </div>
  )
}

function StockDetailContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const ticker = searchParams.get('ticker')
  const [data, setData] = useState<any>(null)
  const [historical, setHistorical] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'history'>('overview')

  useEffect(() => {
    if (ticker) {
      Promise.all([
        getStockData(ticker),
        getHistoricalData(ticker),
      ]).then(([stockResult, histResult]) => {
        setData(stockResult)
        setHistorical(histResult)
        setLoading(false)
      })
    }
  }, [ticker])

  if (!ticker) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('stock.no_ticker')} <a href="/earningsTrigger/earnings/" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>{t('stock.browse_calendar')}</a></p>
      </div>
    )
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><p style={{ color: 'var(--text-secondary)' }}>{t('stock.loading', { ticker })}</p></div>
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{ticker}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('stock.no_data')}</p>
      </div>
    )
  }

  const decisionColor = data.decision === 'STRONG BUY' || data.decision === 'BUY' ? '#22c55e' : data.decision === 'WATCH' ? '#eab308' : '#ef4444'

  return (
    <div>
      <a href="/earningsTrigger/earnings/" style={{ color: 'var(--accent-blue)', fontSize: '13px', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>{t('stock.back')}</a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>{data.ticker}</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{data.company}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{data.sector} &middot; {t('stock.earnings_label', { date: data.earnings_date })}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '700',
            background: `${decisionColor}15`, color: decisionColor, marginBottom: '8px',
          }}>{data.decision}</div>
          <div style={{ fontSize: '36px', fontWeight: '700' }}>${data.price.current}</div>
          <div style={{ fontSize: '16px', color: data.price.change_pct >= 0 ? '#22c55e' : '#ef4444', fontWeight: '500' }}>
            {data.price.change_pct >= 0 ? '+' : ''}{data.price.change_pct}%
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', fontStyle: 'italic' }}>{data.decision_rationale}</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <ScoreBox label={t('score.overall')} score={data.scores.overall} color="#e8e8f0" />
        <ScoreBox label={t('score.technical')} score={data.scores.technical} color="#3b82f6" />
        <ScoreBox label={t('score.fundamental')} score={data.scores.fundamental} color="#a855f7" />
        <ScoreBox label={t('score.options')} score={data.scores.options} color="#f59e0b" />
        <ScoreBox label={t('score.historical')} score={data.scores.historical} color="#ec4899" noData={!data.historical_earnings || Object.keys(data.historical_earnings).length === 0} noDataLabel={t('stock.no_data')} />
        <ScoreBox label={t('score.sentiment')} score={data.scores.sentiment} color="#06b6d4" />
      </div>

      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            background: activeTab === 'overview' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {t('stock.tabs.overview')}
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          style={{
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            background: activeTab === 'breakdown' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'breakdown' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'breakdown' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {t('stock.tabs.breakdown')}
        </button>
        {historical && (
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              background: activeTab === 'history' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'history' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {t('stock.tabs.history')}
          </button>
        )}
      </div>

      {activeTab === 'overview' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('stock.params.title')}</h3>
              {[
                [t('stock.params.buy_above'), `$${data.trade_parameters.buy_above}`, undefined],
                [t('stock.params.stop_loss'), `$${data.trade_parameters.stop_loss}`, '#ef4444'],
                [t('stock.params.take_profit'), `$${data.trade_parameters.take_profit}`, '#22c55e'],
                [t('stock.params.risk_reward'), `${data.trade_parameters.risk_reward}:1`, undefined],
                [t('stock.params.expected_move'), data.trade_parameters.expected_move, undefined],
                [t('stock.params.expected_return'), `+${data.trade_parameters.expected_return_pct}%`, '#22c55e'],
                [t('stock.params.max_drawdown'), `${data.trade_parameters.max_drawdown_pct}%`, '#ef4444'],
              ].map(([label, value, color]) => (
                <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: color || 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('stock.levels.title')}</h3>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>{t('stock.levels.support')}</div>
              {data.trade_parameters.support_levels?.map((s: number, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('stock.levels.support_n', { n: i + 1 })}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>${s}</span>
                </div>
              ))}
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '12px', marginBottom: '8px' }}>{t('stock.levels.resistance')}</div>
              {data.trade_parameters.resistance_levels?.map((r: number, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('stock.levels.resistance_n', { n: i + 1 })}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>${r}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : activeTab === 'breakdown' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <OverallBreakdown scores={data.scores} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TechnicalBreakdown data={data.technical} score={data.scores.technical} />
            <FundamentalBreakdown data={data.fundamentals} score={data.scores.fundamental} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <OptionsBreakdown data={data.options} score={data.scores.options} />
            <HistoricalBreakdown data={data.historical_earnings} score={data.scores.historical} deepAnalysis={data.historical_analysis} scoreBreakdown={data.historical_score_breakdown} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <SentimentBreakdown analyst={data.analyst} news={data.news} score={data.scores.sentiment} />
            <MacroBreakdown data={data.market_regime} score={data.scores.macro} />
          </div>
        </div>
      ) : (
        <HistoricalAnalysis historical={historical} stockData={data} />
      )}
    </div>
  )
}

export default function StockDetail() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><p style={{ color: 'var(--text-secondary)' }}>Loading...</p></div>}>
      <StockDetailContent />
    </Suspense>
  )
}
