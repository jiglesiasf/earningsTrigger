'use client'
import { StockPick } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'

function DecisionBadge({ decision }: { decision: string }) {
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  }
  if (decision === 'STRONG BUY') return <span style={{ ...style, background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>STRONG BUY</span>
  if (decision === 'BUY') return <span style={{ ...style, background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>BUY</span>
  if (decision === 'WATCH') return <span style={{ ...style, background: 'rgba(234,179,8,0.15)', color: '#eab308' }}>WATCH</span>
  return <span style={{ ...style, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>AVOID</span>
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '11px', fontWeight: '600', color }}>{Math.round(score)}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export default function TopPicks({ picks }: { picks: StockPick[] }) {
  const { t } = useTranslation()
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Top {picks.length} {t('dashboard.upcoming_earnings', { count: '' }).split('(')[0].trim()}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {picks.map((pick) => (
          <a
            key={pick.ticker}
            href={`/earningsTrigger/stock/?ticker=${pick.ticker}`}
            style={{
              display: 'block',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px 24px',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700' }}>{pick.ticker}</span>
                  <DecisionBadge decision={pick.decision} />
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{pick.company}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {pick.sector} &middot; {t('stock.earnings_label', { date: pick.earnings_date })} ({pick.days_until_earnings}d)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>${pick.price.current}</div>
                <div style={{ fontSize: '14px', color: pick.price.change_pct >= 0 ? '#22c55e' : '#ef4444', fontWeight: '500' }}>
                  {pick.price.change_pct >= 0 ? '+' : ''}{pick.price.change_pct}%
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <ScoreBar label={t('score.overall')} score={pick.scores.overall} />
              <ScoreBar label={t('score.technical')} score={pick.scores.technical} />
              <ScoreBar label={t('score.fundamental')} score={pick.scores.fundamental} />
              <ScoreBar label={t('score.options')} score={pick.scores.options} />
              <ScoreBar label={t('score.historical')} score={pick.scores.historical} />
              <ScoreBar label={t('score.sentiment')} score={pick.scores.sentiment} />
            </div>

            <div style={{ display: 'flex', gap: '24px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('stock.params.buy_above')} </span>
                <span style={{ fontWeight: '600' }}>${pick.trade_parameters.buy_above}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('stock.params.stop_loss')} </span>
                <span style={{ fontWeight: '600', color: '#ef4444' }}>${pick.trade_parameters.stop_loss}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('stock.params.take_profit')} </span>
                <span style={{ fontWeight: '600', color: '#22c55e' }}>${pick.trade_parameters.take_profit}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('stock.params.risk_reward')} </span>
                <span style={{ fontWeight: '600' }}>{pick.trade_parameters.risk_reward}:1</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>{t('stock.params.expected_move')} </span>
                <span style={{ fontWeight: '600' }}>{pick.trade_parameters.expected_move}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
