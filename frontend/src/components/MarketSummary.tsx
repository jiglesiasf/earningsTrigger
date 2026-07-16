'use client'
import { MarketSummary as MarketSummaryType } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'

function TrendPill({ trend }: { trend: string }) {
  const { t } = useTranslation()
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }
  if (trend === 'bullish') return <span style={{ ...style, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>{t('score.technical')}</span>
  if (trend === 'bearish') return <span style={{ ...style, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>{t('score.sentiment')}</span>
  return <span style={{ ...style, background: 'rgba(255,255,255,0.05)', color: '#888' }}>Neutral</span>
}

function Stat({ label, value, change, children }: { label: string; value: string | number; change?: number; children?: React.ReactNode }) {
  return (
    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{value}</div>
      {change !== undefined && (
        <div style={{ fontSize: '13px', color: change >= 0 ? '#22c55e' : '#ef4444', marginBottom: '6px' }}>
          {change >= 0 ? '+' : ''}{change}%
        </div>
      )}
      {children}
    </div>
  )
}

export default function MarketSummary({ summary }: { summary: MarketSummaryType }) {
  const { t } = useTranslation()
  const vixColor = summary.vix < 15 ? '#22c55e' : summary.vix < 25 ? '#eab308' : '#ef4444'

  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('macro.title')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <Stat label="S&P 500" value={summary.sp500_price?.toLocaleString() || '-'} change={summary.sp500_change_pct}>
          <TrendPill trend={summary.sp500_trend} />
        </Stat>
        <Stat label="Nasdaq" value={summary.nasdaq_price?.toLocaleString() || '-'} change={summary.nasdaq_change_pct}>
          <TrendPill trend={summary.nasdaq_trend} />
        </Stat>
        <Stat label="VIX" value={summary.vix || '-'}>
          <span style={{ fontSize: '12px', color: vixColor, fontWeight: '600' }}>{summary.vix_trend}</span>
        </Stat>
        <Stat label={t('macro.regime')} value={summary.market_regime?.replace('_', ' ') || '-'}>
          <span style={{ fontSize: '12px', color: summary.risk_level === 'low' ? '#22c55e' : summary.risk_level === 'moderate' ? '#eab308' : '#ef4444', fontWeight: '600' }}>
            {summary.risk_level} risk
          </span>
        </Stat>
      </div>
    </div>
  )
}
