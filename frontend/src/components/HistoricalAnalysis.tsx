'use client'

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
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{matched}/{total} historical quarters matched</div>
    </div>
  )
}

function DriftBar({ label, values, colors }: { label: string; values: { beat: number | null; miss: number | null; all: number | null }; colors: { beat: string; miss: string } }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '500' }}>{label}</div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {values.beat !== null && (
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: `${colors.beat}15`, color: colors.beat }}>
            Beat: {values.beat > 0 ? '+' : ''}{values.beat}%
          </span>
        )}
        {values.miss !== null && (
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: `${colors.miss}15`, color: colors.miss }}>
            Miss: {values.miss > 0 ? '+' : ''}{values.miss}%
          </span>
        )}
        {values.all !== null && (
          <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            All: {values.all > 0 ? '+' : ''}{values.all}%
          </span>
        )}
      </div>
    </div>
  )
}

export default function HistoricalAnalysis({ historical, stockData }: { historical: any; stockData: any }) {
  if (!historical) return null

  const o = historical.overall
  const b = historical.beat_analysis
  const sm = historical.surprise_magnitude
  const rsi = historical.rsi_analysis
  const trend = historical.trend_analysis
  const drift2 = historical.drift_2d
  const drift5 = historical.drift_5d
  const drift10 = historical.drift_10d

  // Current stock state for scenario match
  const currentRsi = stockData?.technical?.momentum?.rsi_14
  const currentAboveSma20 = stockData?.technical?.trend?.price_above_20_ema
  const currentAboveSma50 = stockData?.technical?.trend?.price_above_50_sma
  const currentPrice = stockData?.price?.current
  const currentChangePct = stockData?.price?.change_pct
  const currentDaysUntil = stockData?.days_until_earnings

  // Scenario match scoring
  const scenarioMatches: { label: string; matched: number; total: number; detail: string; favorability: 'bullish' | 'bearish' | 'neutral' }[] = []

  if (currentRsi !== undefined) {
    let matched = 0, total = 0, detail = '', favorability: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (currentRsi > 70) {
      matched = rsi.overbought_gt70.positive_rate || 0
      total = 100
      detail = `RSI ${currentRsi.toFixed(0)} → overbought zone: ${(rsi.overbought_gt70.avg_day_return || 0) > 0 ? '+' : ''}${rsi.overbought_gt70.avg_day_return || 0}% avg`
      favorability = (rsi.overbought_gt70.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else if (currentRsi < 30) {
      matched = rsi.oversold_lt30.positive_rate || 0
      total = 100
      detail = `RSI ${currentRsi.toFixed(0)} → oversold zone: ${(rsi.oversold_lt30.avg_day_return || 0) > 0 ? '+' : ''}${rsi.oversold_lt30.avg_day_return || 0}% avg`
      favorability = (rsi.oversold_lt30.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else {
      matched = rsi.neutral_30_70.positive_rate || 0
      total = 100
      detail = `RSI ${currentRsi.toFixed(0)} → neutral zone: ${(rsi.neutral_30_70.avg_day_return || 0) > 0 ? '+' : ''}${rsi.neutral_30_70.avg_day_return || 0}% avg`
      favorability = (rsi.neutral_30_70.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    }
    scenarioMatches.push({ label: 'RSI Zone', matched, total, detail, favorability })
  }

  if (currentAboveSma20 !== undefined && currentAboveSma50 !== undefined) {
    let matched = 0, total = 0, detail = '', favorability: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (currentAboveSma20 && currentAboveSma50) {
      matched = trend.uptrend_both_above.positive_rate || 0
      total = 100
      detail = `Uptrend → avg +${trend.uptrend_both_above.avg_day_return || 0}%`
      favorability = (trend.uptrend_both_above.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else if (!currentAboveSma20 && !currentAboveSma50) {
      matched = trend.downtrend_both_below.positive_rate || 0
      total = 100
      detail = `Downtrend → avg ${trend.downtrend_both_below.avg_day_return || 0}%`
      favorability = (trend.downtrend_both_below.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    } else {
      matched = trend.mixed_trend.positive_rate || 0
      total = 100
      detail = `Mixed trend → avg ${trend.mixed_trend.avg_day_return || 0}%`
      favorability = (trend.mixed_trend.avg_day_return || 0) > 0 ? 'bullish' : 'bearish'
    }
    scenarioMatches.push({ label: 'Trend Alignment', matched, total, detail, favorability })
  }

  // Overall favorability
  const bullCount = scenarioMatches.filter(m => m.favorability === 'bullish').length
  const bearCount = scenarioMatches.filter(m => m.favorability === 'bearish').length
  const favorabilityLabel = bullCount > bearCount ? 'HISTORICALLY FAVORABLE' : bearCount > bullCount ? 'HISTORICALLY UNFAVORABLE' : 'MIXED HISTORICAL SIGNAL'
  const favorabilityColor = bullCount > bearCount ? '#22c55e' : bearCount > bullCount ? '#ef4444' : '#eab308'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Overview Stats */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <StatCard label="Beat Rate" value={`${o.beat_rate_pct}%`} color="#22c55e" sub={`${b.beat_count} of ${o.total_quarters} quarters`} />
        <StatCard label="Avg Surprise" value={`${o.avg_surprise_pct > 0 ? '+' : ''}${o.avg_surprise_pct}%`} color="#3b82f6" sub={`Median: ${o.median_surprise_pct}%`} />
        <StatCard label="Avg Day Return" value={`${o.avg_day_return_pct > 0 ? '+' : ''}${o.avg_day_return_pct}%`} color={o.avg_day_return_pct > 0 ? '#22c55e' : '#ef4444'} sub={`${o.positive_day_rate_pct}% positive`} />
        <StatCard label="Avg Absolute Move" value={`${o.avg_abs_day_return_pct}%`} color="#f59e0b" sub={`Range: ${o.worst_day_pct}% to +${o.best_day_pct}%`} />
        <StatCard label="Quarters Analyzed" value={String(o.total_quarters)} color="var(--text-secondary)" sub={historical.date_range} />
      </div>

      {/* Scenario Match — The Key Section */}
      <Card title="Scenario Match — Current State vs Historical Patterns">
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: `${favorabilityColor}10`, border: `1px solid ${favorabilityColor}30` }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: favorabilityColor }}>{favorabilityLabel}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {currentDaysUntil !== undefined && `Earnings in ${currentDaysUntil} days · `}
            {currentPrice && `Price $${currentPrice} · `}
            {currentChangePct !== undefined && `Today ${currentChangePct > 0 ? '+' : ''}${currentChangePct}%`}
          </div>
        </div>
        {scenarioMatches.map((m, i) => (
          <MatchBar key={i} label={m.label} matched={m.matched} total={m.total} detail={m.detail} />
        ))}
        <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {favorabilityColor === '#22c55e' && `Historically, when META has had a similar pre-earnings setup (${scenarioMatches.map(m => m.label.toLowerCase()).join(', ')}), the stock tends to react positively. Based on ${o.total_quarters} past earnings, the average day return in comparable conditions suggests a favorable setup.`}
            {favorabilityColor === '#ef4444' && `Historically, when META has had a similar pre-earnings setup (${scenarioMatches.map(m => m.label.toLowerCase()).join(', ')}), the stock tends to underperform. Based on ${o.total_quarters} past earnings, the average day return in comparable conditions suggests caution.`}
            {favorabilityColor === '#eab308' && `Historically, mixed signals when META has had a similar pre-earnings setup. Based on ${o.total_quarters} past earnings, the historical data is inconclusive for this exact configuration.`}
          </div>
        </div>
      </Card>

      {/* Beat vs Miss */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card title="When META Beats">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <StatCard label="Count" value={String(b.beat_count)} color="#22c55e" />
            <StatCard label="Avg Return" value={`+${b.avg_day_return_when_beat}%`} color="#22c55e" />
            <StatCard label="Positive Rate" value={`${b.beat_positive_rate}%`} color="#22c55e" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', padding: '8px 12px', borderRadius: '8px', background: 'rgba(34,197,94,0.05)' }}>
            When META beats estimates, it averages <strong style={{ color: '#22c55e' }}>+{b.avg_day_return_when_beat}%</strong> on the day. The stock is positive <strong>{b.beat_positive_rate}%</strong> of the time. Post-earnings drift extends gains: +{drift5.avg_return_beat}% at 5 days, +{drift10.avg_return_beat}% at 10 days.
          </div>
        </Card>

        <Card title="When META Misses">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <StatCard label="Count" value={String(b.miss_count)} color="#ef4444" />
            <StatCard label="Avg Return" value={`${b.avg_day_return_when_miss}%`} color="#ef4444" />
            <StatCard label="Positive Rate" value={`${b.miss_positive_rate}%`} color="#ef4444" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.05)' }}>
            When META misses, it averages <strong style={{ color: '#ef4444' }}>{b.avg_day_return_when_miss}%</strong> on the day. Only <strong>{b.miss_positive_rate}%</strong> positive. The pain extends: {drift5.avg_return_miss}% at 5 days, {drift10.avg_return_miss}% at 10 days. <strong>Misses are punished severely and do not recover.</strong>
          </div>
        </Card>
      </div>

      {/* Post-Earnings Drift */}
      <Card title="Post-Earnings Drift — What Happens After">
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Average return at different horizons after earnings, split by beat vs miss. This shows whether to hold or close the position.
        </div>
        <DriftBar label="+2 Days" values={{ beat: drift2.avg_return_beat, miss: drift2.avg_return_miss, all: drift2.avg_return_all }} colors={{ beat: '#22c55e', miss: '#ef4444' }} />
        <DriftBar label="+5 Days" values={{ beat: drift5.avg_return_beat, miss: drift5.avg_return_miss, all: drift5.avg_return_all }} colors={{ beat: '#22c55e', miss: '#ef4444' }} />
        <DriftBar label="+10 Days" values={{ beat: drift10.avg_return_beat, miss: drift10.avg_return_miss, all: drift10.avg_return_all }} colors={{ beat: '#22c55e', miss: '#ef4444' }} />
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Strategy implication:</strong> If you expect a beat, holding for +5 days captures an average +{drift5.avg_return_beat}% drift. If you expect a miss, the damage is immediate and does not recover — close or hedge before earnings.
        </div>
      </Card>

      {/* Pattern Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* RSI Zones */}
        <Card title="RSI Pre-Earnings → Outcomes">
          {[
            { label: 'Overbought (>70)', data: rsi.overbought_gt70, color: '#ef4444' },
            { label: 'Neutral (30-70)', data: rsi.neutral_30_70, color: '#eab308' },
            { label: 'Oversold (<30)', data: rsi.oversold_lt30, color: '#22c55e' },
          ].map(({ label, data, color }) => data.count > 0 ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data.count} quarters</div>
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
            Paradoxically, META performs best when RSI is at extremes. Overbought (+12.4%) and oversold (+17.6%) both outperform the neutral zone (-1.3%).
          </div>
        </Card>

        {/* Trend */}
        <Card title="Trend Pre-Earnings → Outcomes">
          {[
            { label: 'Uptrend (above both SMAs)', data: trend.uptrend_both_above, color: '#22c55e' },
            { label: 'Downtrend (below both)', data: trend.downtrend_both_below, color: '#ef4444' },
            { label: 'Mixed trend', data: trend.mixed_trend, color: '#eab308' },
          ].map(({ label, data, color }) => data.count > 0 ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data.count} quarters</div>
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
            Uptrend setups have a +3.0% average return vs -3.4% in downtrends. The trend is your friend for META earnings trades.
          </div>
        </Card>

        {/* Surprise Magnitude */}
        <Card title="Surprise Magnitude → Outcomes">
          {[
            { label: 'Large Beat (>10%)', data: sm.large_beat_gt10, color: '#22c55e' },
            { label: 'Small Beat (0-10%)', data: sm.small_beat_0_10, color: '#86efac' },
            { label: 'Small Miss (-10 to 0%)', data: sm.small_miss_neg10_0, color: '#fca5a5' },
            { label: 'Large Miss (<-10%)', data: sm.large_miss_lt_neg10, color: '#ef4444' },
          ].map(({ label, data, color }) => data.count > 0 ? (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{data.count} quarters</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: (data.avg_day_return || 0) > 0 ? '#22c55e' : '#ef4444' }}>
                  {(data.avg_day_return || 0) > 0 ? '+' : ''}{data.avg_day_return}%
                </div>
              </div>
            </div>
          ) : null)}
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Both large and small beats perform similarly well (+2.3% to +2.6%). Small misses are the most dangerous (-15.8%), worse than large misses (-0.6%) — the market punishes "barely missing" the most.
          </div>
        </Card>

        {/* Gap Analysis */}
        <Card title="Gap Behavior">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <StatCard label="Avg Gap" value={`${o.avg_gap_pct > 0 ? '+' : ''}${o.avg_gap_pct}%`} color="#3b82f6" />
            <StatCard label="Gap Up" value={`${historical.gap_analysis.gap_up_count}×`} color="#22c55e" sub={`${Math.round(historical.gap_analysis.gap_up_count / o.total_quarters * 100)}% of the time`} />
            <StatCard label="Gap Down" value={`${historical.gap_analysis.gap_down_count}×`} color="#ef4444" sub={`${Math.round(historical.gap_analysis.gap_down_count / o.total_quarters * 100)}% of the time`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg gap when beat</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>+{historical.gap_analysis.avg_gap_when_beat}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg gap when miss</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{historical.gap_analysis.avg_gap_when_miss}%</span>
          </div>
        </Card>
      </div>

      {/* Best & Worst Quarters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card title="Best Earnings Days">
          {historical.best_quarters.map((q: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.date}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#22c55e' }}>+{q.day_return_pct}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Surprise: {q.surprise_pct > 0 ? '+' : ''}{q.surprise_pct}% · RSI {q.rsi.toFixed(0)} · {q.trend}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
                20d: {q.momentum_20d > 0 ? '+' : ''}{q.momentum_20d}%
              </div>
            </div>
          ))}
        </Card>

        <Card title="Worst Earnings Days">
          {historical.worst_quarters.map((q: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.date}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>{q.day_return_pct}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Surprise: {q.surprise_pct > 0 ? '+' : ''}{q.surprise_pct}% · RSI {q.rsi.toFixed(0)} · {q.trend}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
                20d: {q.momentum_20d > 0 ? '+' : ''}{q.momentum_20d}%
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Key Insights */}
      <Card title="Key Insights">
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
