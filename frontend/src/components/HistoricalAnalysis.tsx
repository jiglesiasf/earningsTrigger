'use client'

import { useTranslation } from '@/lib/i18n'

function StatCard({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{ flex: '1 1 0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '24px', fontWeight: '700', color: color || 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.7 }}>{sub}</div>}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, left, right, leftColor, rightColor }: { label: string; left: string; right: string; leftColor?: string; rightColor?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize: '13px', fontWeight: '600', color: leftColor || 'var(--text-primary)', textAlign: 'right' }}>{left}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', minWidth: '80px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: rightColor || 'var(--text-primary)' }}>{right}</div>
    </div>
  )
}

function MatchBar({ label, matched, total, detail }: { label: string; matched: number; total: number; detail: string }) {
  const { t } = useTranslation()
  const pct = total > 0 ? (matched / total) * 100 : 0
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444'
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{detail}</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{t('hist.quarters_matched', { matched, total })}</div>
    </div>
  )
}

function DriftBar({ label, values, colors }: { label: string; values: { beat: number | null; miss: number | null; all: number | null }; colors: { beat: string; miss: string } }) {
  const { t } = useTranslation()
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500' }}>{label}</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {values.beat !== null && (
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: `${colors.beat}15`, color: colors.beat }}>
            {t('hist.beat_prefix')}{values.beat > 0 ? '+' : ''}{values.beat}%
          </span>
        )}
        {values.miss !== null && (
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: `${colors.miss}15`, color: colors.miss }}>
            {t('hist.miss_prefix')}{values.miss > 0 ? '+' : ''}{values.miss}%
          </span>
        )}
        {values.all !== null && (
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            {t('hist.all_prefix')}{values.all > 0 ? '+' : ''}{values.all}%
          </span>
        )}
      </div>
    </div>
  )
}

export default function HistoricalAnalysis({ historical, stockData }: { historical: any; stockData: any }) {
  const { t } = useTranslation()
  if (!historical) return null

  const ticker = historical.ticker || stockData?.ticker || ''
  const o = historical.overall
  const b = historical.beat_analysis
  const sm = historical.surprise_magnitude
  const rsi = historical.rsi_analysis
  const trend = historical.trend_analysis
  const drift2 = historical.drift_2d
  const drift5 = historical.drift_5d
  const drift10 = historical.drift_10d

  const currentRsi = stockData?.technical?.momentum?.rsi_14
  const currentAboveSma20 = stockData?.technical?.trend?.price_above_20_ema
  const currentAboveSma50 = stockData?.technical?.trend?.price_above_50_sma
  const currentPrice = stockData?.price?.current
  const currentChangePct = stockData?.price?.change_pct
  const currentDaysUntil = stockData?.days_until_earnings

  const scenarioMatches: { label: string; matched: number; total: number; detail: string; favorability: 'bullish' | 'bearish' | 'neutral' }[] = []

  if (currentRsi !== undefined) {
    let matched = 0, total = 0, detail = '', favorability: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (currentRsi > 70) {
      matched = rsi.overbought_gt70.positive_rate || 0
      total = 100
      detail = t('hist.rsi_overbought_detail', { n: currentRsi.toFixed(0), avg: (rsi.overbought_gt70.avg_day_return || 0) > 0 ? `+${rsi.overbought_gt70.avg_day_return || 0}` : String(rsi.overbought_gt70.avg_day_return || 0) })
      favorability = (rsi.overbought_gt70.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else if (currentRsi < 30) {
      matched = rsi.oversold_lt30.positive_rate || 0
      total = 100
      detail = t('hist.rsi_oversold_detail', { n: currentRsi.toFixed(0), avg: (rsi.oversold_lt30.avg_day_return || 0) > 0 ? `+${rsi.oversold_lt30.avg_day_return || 0}` : String(rsi.oversold_lt30.avg_day_return || 0) })
      favorability = (rsi.oversold_lt30.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else {
      matched = rsi.neutral_30_70.positive_rate || 0
      total = 100
      detail = t('hist.rsi_neutral_detail', { n: currentRsi.toFixed(0), avg: String(rsi.neutral_30_70.avg_day_return || 0) })
      favorability = (rsi.neutral_30_70.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    }
    scenarioMatches.push({ label: t('hist.rsi_zone'), matched, total, detail, favorability })
  }

  if (currentAboveSma20 !== undefined && currentAboveSma50 !== undefined) {
    let matched = 0, total = 0, detail = '', favorability: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (currentAboveSma20 && currentAboveSma50) {
      matched = trend.uptrend_both_above.positive_rate || 0
      total = 100
      detail = t('hist.trend_uptrend', { avg: trend.uptrend_both_above.avg_day_return || 0 })
      favorability = (trend.uptrend_both_above.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else if (!currentAboveSma20 && !currentAboveSma50) {
      matched = trend.downtrend_both_below.positive_rate || 0
      total = 100
      detail = t('hist.trend_downtrend', { avg: trend.downtrend_both_below.avg_day_return || 0 })
      favorability = (trend.downtrend_both_below.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else {
      matched = trend.mixed_trend.positive_rate || 0
      total = 100
      detail = t('hist.trend_mixed', { avg: trend.mixed_trend.avg_day_return || 0 })
      favorability = (trend.mixed_trend.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    }
    scenarioMatches.push({ label: t('hist.trend_alignment'), matched, total, detail, favorability })
  }

  const bullCount = scenarioMatches.filter(m => m.favorability === 'bullish').length
  const bearCount = scenarioMatches.filter(m => m.favorability === 'bearish').length
  const favorabilityLabel = bullCount > bearCount ? t('hist.favorable') : bearCount > bullCount ? t('hist.unfavorable') : t('hist.mixed_signal')
  const favorabilityColor = bullCount > bearCount ? '#22c55e' : bearCount > bullCount ? '#ef4444' : '#eab308'
  const scenarioLabels = scenarioMatches.map(m => m.label.toLowerCase()).join(', ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Overview Stats */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <StatCard label={t('hist.beat_rate')} value={`${o.beat_rate_pct}%`} color="#22c55e" sub={t('hist.n_of_total', { n: b.beat_count, total: o.total_quarters })} />
        <StatCard label={t('hist.avg_surprise')} value={`${o.avg_surprise_pct > 0 ? '+' : ''}${o.avg_surprise_pct}%`} color="#3b82f6" sub={t('hist.median', { n: o.median_surprise_pct })} />
        <StatCard label={t('hist.avg_day_return')} value={`${o.avg_day_return_pct > 0 ? '+' : ''}${o.avg_day_return_pct}%`} color={o.avg_day_return_pct > 0 ? '#22c55e' : '#ef4444'} sub={t('hist.positive_rate', { n: o.positive_day_rate_pct })} />
        <StatCard label={t('hist.avg_abs_move')} value={`${o.avg_abs_day_return_pct}%`} color="#f59e0b" sub={t('hist.range', { min: o.worst_day_pct, max: o.best_day_pct })} />
        <StatCard label={t('hist.quarters_analyzed')} value={String(o.total_quarters)} color="var(--text-secondary)" sub={historical.date_range} />
      </div>

      {/* Scenario Match */}
      <Card title={t('hist.scenario_title')}>
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: `${favorabilityColor}10`, border: `1px solid ${favorabilityColor}30` }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: favorabilityColor }}>{favorabilityLabel}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {currentDaysUntil !== undefined && t('hist.earnings_in_n', { n: currentDaysUntil })}
            {currentPrice && `Price $${currentPrice} · `}
            {currentChangePct !== undefined && `Today ${currentChangePct > 0 ? '+' : ''}${currentChangePct}%`}
          </div>
        </div>
        {scenarioMatches.map((m, i) => (
          <MatchBar key={i} label={m.label} matched={m.matched} total={m.total} detail={m.detail} />
        ))}
        <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {favorabilityColor === '#22c55e' && t('hist.scenario_bullish', { ticker, labels: scenarioLabels, n: o.total_quarters })}
            {favorabilityColor === '#ef4444' && t('hist.scenario_bearish', { ticker, labels: scenarioLabels, n: o.total_quarters })}
            {favorabilityColor === '#eab308' && t('hist.scenario_mixed', { ticker, labels: scenarioLabels, n: o.total_quarters })}
          </div>
        </div>
      </Card>

      {/* Beat vs Miss */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card title={t('hist.when_beats', { ticker })}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <StatCard label={t('hist.count')} value={String(b.beat_count)} color="#22c55e" />
            <StatCard label={t('hist.avg_return')} value={`+${b.avg_day_return_when_beat}%`} color="#22c55e" />
            <StatCard label={t('hist.positive_rate_short')} value={`${b.beat_positive_rate}%`} color="#22c55e" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', padding: '8px 12px', borderRadius: '8px', background: 'rgba(34,197,94,0.05)' }}>
            {t('hist.beat_narrative', { ticker, n: b.avg_day_return_when_beat, pct: b.beat_positive_rate, d5: drift5.avg_return_beat, d10: drift10.avg_return_beat })}
          </div>
        </Card>

        <Card title={t('hist.when_misses', { ticker })}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <StatCard label={t('hist.count')} value={String(b.miss_count)} color="#ef4444" />
            <StatCard label={t('hist.avg_return')} value={`${b.avg_day_return_when_miss}%`} color="#ef4444" />
            <StatCard label={t('hist.positive_rate_short')} value={`${b.miss_positive_rate}%`} color="#ef4444" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.05)' }}>
            {t('hist.miss_narrative', { ticker, n: b.avg_day_return_when_miss, pct: b.miss_positive_rate, d5: drift5.avg_return_miss, d10: drift10.avg_return_miss })}
          </div>
        </Card>
      </div>

      {/* Post-Earnings Drift */}
      <Card title={t('hist.drift_title')}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {t('hist.drift_desc')}
        </div>
        <DriftBar label={t('hist.drift_2d')} values={{ beat: drift2.avg_return_beat, miss: drift2.avg_return_miss, all: drift2.avg_return_all }} colors={{ beat: '#22c55e', miss: '#ef4444' }} />
        <DriftBar label={t('hist.drift_5d')} values={{ beat: drift5.avg_return_beat, miss: drift5.avg_return_miss, all: drift5.avg_return_all }} colors={{ beat: '#22c55e', miss: '#ef4444' }} />
        <DriftBar label={t('hist.drift_10d')} values={{ beat: drift10.avg_return_beat, miss: drift10.avg_return_miss, all: drift10.avg_return_all }} colors={{ beat: '#22c55e', miss: '#ef4444' }} />
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{t('hist.strategy_note', { n: drift5.avg_return_beat })}</strong>
        </div>
      </Card>

      {/* Pattern Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* RSI Zones */}
        <Card title={t('hist.rsi_title')}>
          {[
            { label: t('hist.rsi_overbought'), data: rsi.overbought_gt70, color: '#ef4444' },
            { label: t('hist.rsi_neutral'), data: rsi.neutral_30_70, color: '#eab308' },
            { label: t('hist.rsi_oversold'), data: rsi.oversold_lt30, color: '#22c55e' },
          ].map(({ label, data, color }) => data.count > 0 ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('hist.n_quarters', { n: data.count })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: (data.avg_day_return || 0) > 0 ? '#22c55e' : '#ef4444' }}>
                  {(data.avg_day_return || 0) > 0 ? '+' : ''}{data.avg_day_return}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data.positive_rate}% positive</div>
              </div>
            </div>
          ) : null)}
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {t('hist.rsi_insight', { ticker })}
          </div>
        </Card>

        {/* Trend */}
        <Card title={t('hist.trend_title')}>
          {[
            { label: t('hist.trend_uptrend_label'), data: trend.uptrend_both_above, color: '#22c55e' },
            { label: t('hist.trend_downtrend_label'), data: trend.downtrend_both_below, color: '#ef4444' },
            { label: t('hist.trend_mixed_label'), data: trend.mixed_trend, color: '#eab308' },
          ].map(({ label, data, color }) => data.count > 0 ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('hist.n_quarters', { n: data.count })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: (data.avg_day_return || 0) > 0 ? '#22c55e' : '#ef4444' }}>
                  {(data.avg_day_return || 0) > 0 ? '+' : ''}{data.avg_day_return}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data.positive_rate}% positive</div>
              </div>
            </div>
          ) : null)}
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {t('hist.trend_insight', { ticker })}
          </div>
        </Card>

        {/* Surprise Magnitude */}
        <Card title={t('hist.surprise_title')}>
          {[
            { label: t('hist.surprise_large_beat'), data: sm.large_beat_gt10, color: '#22c55e' },
            { label: t('hist.surprise_small_beat'), data: sm.small_beat_0_10, color: '#86efac' },
            { label: t('hist.surprise_small_miss'), data: sm.small_miss_neg10_0, color: '#fca5a5' },
            { label: t('hist.surprise_large_miss'), data: sm.large_miss_lt_neg10, color: '#ef4444' },
          ].map(({ label, data, color }) => data.count > 0 ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('hist.n_quarters', { n: data.count })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: (data.avg_day_return || 0) > 0 ? '#22c55e' : '#ef4444' }}>
                  {(data.avg_day_return || 0) > 0 ? '+' : ''}{data.avg_day_return}%
                </div>
              </div>
            </div>
          ) : null)}
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {t('hist.surprise_insight')}
          </div>
        </Card>

        {/* Gap Analysis */}
        <Card title={t('hist.gap_title')}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <StatCard label={t('hist.avg_gap')} value={`${o.avg_gap_pct > 0 ? '+' : ''}${o.avg_gap_pct}%`} color="#3b82f6" />
            <StatCard label={t('hist.gap_up')} value={`${historical.gap_analysis.gap_up_count}×`} color="#22c55e" sub={t('hist.pct_of_time', { n: Math.round(historical.gap_analysis.gap_up_count / o.total_quarters * 100) })} />
            <StatCard label={t('hist.gap_down')} value={`${historical.gap_analysis.gap_down_count}×`} color="#ef4444" sub={t('hist.pct_of_time', { n: Math.round(historical.gap_analysis.gap_down_count / o.total_quarters * 100) })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('hist.gap_beat')}</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>+{historical.gap_analysis.avg_gap_when_beat}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('hist.gap_miss')}</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{historical.gap_analysis.avg_gap_when_miss}%</span>
          </div>
        </Card>
      </div>

      {/* Best & Worst Quarters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card title={t('hist.best_days')}>
          {historical.best_quarters.map((q: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.date}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>+{q.day_return_pct}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('hist.surprise_prefix')}{q.surprise_pct > 0 ? '+' : ''}{q.surprise_pct}% · RSI {q.rsi.toFixed(0)} · {q.trend}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('hist.momentum_prefix')}{q.momentum_20d > 0 ? '+' : ''}{q.momentum_20d}%
              </div>
            </div>
          ))}
        </Card>

        <Card title={t('hist.worst_days')}>
          {historical.worst_quarters.map((q: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.date}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{q.day_return_pct}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t('hist.surprise_prefix')}{q.surprise_pct > 0 ? '+' : ''}{q.surprise_pct}% · RSI {q.rsi.toFixed(0)} · {q.trend}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
                {t('hist.momentum_prefix')}{q.momentum_20d > 0 ? '+' : ''}{q.momentum_20d}%
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Key Insights */}
      <Card title={t('hist.insights_title')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {historical.key_insights.map((insight: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '14px', color: '#3b82f6' }}>→</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{insight}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
