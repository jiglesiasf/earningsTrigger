'use client'

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
    </div>
  )
}

function CalcRow({ label, value, note, impact, impactColor }: { label: string; value: string | number; note?: string; impact: 'positive' | 'negative' | 'neutral'; impactColor?: string }) {
  const dotColor = impact === 'positive' ? '#22c55e' : impact === 'negative' ? '#ef4444' : '#555'
  const impactText = impact === 'positive' ? '+' : impact === 'negative' ? '-' : '~'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{label}</div>
        {note && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{note}</div>}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: impactColor || 'var(--text-primary)', textAlign: 'right' }}>{value}</div>
      <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: `${dotColor}20`, color: dotColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
        {impactText}
      </div>
    </div>
  )
}

function SectionHeader({ title, score, weight, color }: { title: string; score: number; weight: number; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: color }} />
        <span style={{ fontSize: '15px', fontWeight: '600' }}>{title}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>
          Weight: {Math.round(weight * 100)}%
        </span>
      </div>
      <div style={{
        fontSize: '20px', fontWeight: '700', color,
        background: `${color}15`, padding: '4px 12px', borderRadius: '8px',
      }}>
        {Math.round(score)}
      </div>
    </div>
  )
}

export function TechnicalBreakdown({ data, score }: { data: any; score: number }) {
  if (!data) return null
  const trend = data.trend || {}
  const momentum = data.momentum || {}
  const volume = data.volume || {}
  const structure = data.price_structure || {}

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title="Technical Score" score={score} weight={0.30} color="#3b82f6" />
      
      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Trend</div>
      <CalcRow label="Price above 20 EMA" value={trend.price_above_20_ema ? 'Yes' : 'No'} impact={trend.price_above_20_ema ? 'positive' : 'negative'} note="Bullish when price > EMA" />
      <CalcRow label="Price above 50 SMA" value={trend.price_above_50_sma ? 'Yes' : 'No'} impact={trend.price_above_50_sma ? 'positive' : 'negative'} note="Medium-term uptrend" />
      <CalcRow label="Price above 200 SMA" value={trend.price_above_200_sma ? 'Yes' : 'No'} impact={trend.price_above_200_sma ? 'positive' : 'negative'} note="Long-term uptrend" />
      <CalcRow label="Golden Cross" value={trend.golden_cross ? 'Yes' : 'No'} impact={trend.golden_cross ? 'positive' : 'neutral'} note="EMA20 crossed above SMA200" impactColor={trend.golden_cross ? '#22c55e' : undefined} />
      <CalcRow label="Death Cross" value={trend.death_cross ? 'Yes' : 'No'} impact={trend.death_cross ? 'negative' : 'neutral'} note="Bearish signal" impactColor={trend.death_cross ? '#ef4444' : undefined} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Momentum</div>
      <CalcRow label="RSI (14)" value={momentum.rsi_14} note={momentum.rsi_14 > 70 ? 'Overbought' : momentum.rsi_14 < 30 ? 'Oversold' : momentum.rsi_14 >= 50 ? 'Bullish zone (50-70)' : 'Weak'} impact={momentum.rsi_14 >= 50 && momentum.rsi_14 <= 68 ? 'positive' : 'negative'} impactColor={momentum.rsi_14 >= 50 && momentum.rsi_14 <= 68 ? '#22c55e' : '#ef4444'} />
      <CalcRow label="MACD Histogram" value={momentum.macd_histogram?.toFixed(4)} note={momentum.macd_histogram > 0 ? 'Bullish momentum' : 'Bearish momentum'} impact={momentum.macd_histogram > 0 ? 'positive' : 'negative'} />
      <CalcRow label="ADX" value={momentum.adx} note={momentum.adx > 25 ? 'Strong trend' : 'Weak trend'} impact={momentum.adx > 25 ? 'positive' : 'neutral'} />
      <CalcRow label="Momentum Assessment" value={momentum.momentum_score} impact={momentum.momentum_score === 'strong' ? 'positive' : momentum.momentum_score === 'weak' ? 'negative' : 'neutral'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Volume</div>
      <CalcRow label="OBV Trend" value={volume.obv_trend} impact={volume.obv_trend === 'up' ? 'positive' : 'negative'} note="On-Balance Volume direction" />
      <CalcRow label="Volume vs 20d Avg" value={volume.volume_trend} impact={volume.volume_trend === 'above_avg' ? 'positive' : 'negative'} note="Higher volume confirms moves" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Price Structure</div>
      <CalcRow label="Distance to Resistance" value={`${structure.distance_to_resistance_pct}%`} impact={structure.distance_to_resistance_pct > 3 ? 'positive' : 'negative'} note={structure.distance_to_resistance_pct > 3 ? 'Room to run' : 'Close to resistance'} />
      <CalcRow label="Distance to Support" value={`${structure.distance_to_support_pct}%`} impact={structure.distance_to_support_pct > 3 ? 'positive' : 'neutral'} note="Downside buffer" />
    </div>
  )
}

export function FundamentalBreakdown({ data, score }: { data: any; score: number }) {
  if (!data) return null

  const growthScore = (data.revenue_growth_yoy > 20) ? 'strong' : (data.revenue_growth_yoy > 10) ? 'good' : (data.revenue_growth_yoy > 0) ? 'moderate' : 'weak'
  const marginScore = (data.gross_margin > 50) ? 'high' : (data.gross_margin > 30) ? 'decent' : 'low'
  const pegScore = (data.peg_ratio > 0 && data.peg_ratio < 1) ? 'undervalued' : (data.peg_ratio <= 2) ? 'fair' : 'overvalued'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title="Fundamental Score" score={score} weight={0.20} color="#a855f7" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Growth</div>
      <CalcRow label="Revenue Growth YoY" value={`${data.revenue_growth_yoy}%`} note={growthScore === 'strong' ? 'Excellent growth (>20%)' : growthScore === 'good' ? 'Good growth (>10%)' : growthScore === 'moderate' ? 'Moderate' : 'Negative growth'} impact={data.revenue_growth_yoy > 10 ? 'positive' : data.revenue_growth_yoy > 0 ? 'neutral' : 'negative'} />
      <CalcRow label="EPS Growth YoY" value={`${data.eps_growth_yoy}%`} note={data.eps_growth_yoy > 20 ? 'Strong earnings growth' : data.eps_growth_yoy > 0 ? 'Growing' : 'Declining'} impact={data.eps_growth_yoy > 10 ? 'positive' : data.eps_growth_yoy > 0 ? 'neutral' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Profitability</div>
      <CalcRow label="Gross Margin" value={`${data.gross_margin}%`} note={marginScore === 'high' ? 'High margin business' : marginScore === 'decent' ? 'Healthy margins' : 'Low margins'} impact={data.gross_margin > 40 ? 'positive' : data.gross_margin > 25 ? 'neutral' : 'negative'} />
      <CalcRow label="Operating Margin" value={`${data.operating_margin}%`} note={data.operating_margin > 25 ? 'Excellent operational efficiency' : data.operating_margin > 15 ? 'Good' : 'Low'} impact={data.operating_margin > 20 ? 'positive' : data.operating_margin > 10 ? 'neutral' : 'negative'} />
      <CalcRow label="Net Margin" value={`${data.net_margin}%`} impact={data.net_margin > 15 ? 'positive' : data.net_margin > 5 ? 'neutral' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Valuation</div>
      <CalcRow label="PEG Ratio" value={data.peg_ratio} note={pegScore === 'undervalued' ? 'Undervalued (PEG < 1)' : pegScore === 'fair' ? 'Fairly valued' : 'Expensive (PEG > 3)'} impact={data.peg_ratio > 0 && data.peg_ratio < 1.5 ? 'positive' : data.peg_ratio < 3 ? 'neutral' : 'negative'} />
      <CalcRow label="Forward P/E" value={data.forward_pe} note={data.forward_pe < 20 ? 'Reasonable' : data.forward_pe < 35 ? 'Growth priced in' : 'Expensive'} impact={data.forward_pe < 25 ? 'positive' : data.forward_pe < 40 ? 'neutral' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Balance Sheet</div>
      <CalcRow label="Debt/Equity" value={data.debt_to_equity} note={data.debt_to_equity < 0.5 ? 'Conservative leverage' : data.debt_to_equity < 1 ? 'Moderate' : 'High leverage'} impact={data.debt_to_equity < 0.8 ? 'positive' : data.debt_to_equity < 1.5 ? 'neutral' : 'negative'} />
      <CalcRow label="Current Ratio" value={data.current_ratio} note={data.current_ratio > 1.5 ? 'Strong liquidity' : data.current_ratio > 1 ? 'Adequate' : 'Weak'} impact={data.current_ratio > 1.2 ? 'positive' : data.current_ratio > 0.8 ? 'neutral' : 'negative'} />
    </div>
  )
}

export function OptionsBreakdown({ data, score }: { data: any; score: number }) {
  if (!data) return null

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title="Options Score" score={score} weight={0.20} color="#f59e0b" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Sentiment</div>
      <CalcRow label="Put/Call Ratio" value={data.put_call_ratio} note={data.put_call_ratio < 0.7 ? 'Very bullish (heavy call buying)' : data.put_call_ratio < 0.9 ? 'Bullish bias' : data.put_call_ratio > 1.3 ? 'Very bearish (heavy put buying)' : data.put_call_ratio > 1.1 ? 'Bearish bias' : 'Neutral'} impact={data.put_call_ratio < 0.8 ? 'positive' : data.put_call_ratio > 1.2 ? 'negative' : 'neutral'} />
      <CalcRow label="Unusual Activity" value={data.unusual_activity ? 'Detected' : 'None'} impact={data.unusual_activity ? 'positive' : 'neutral'} note="Abnormal options volume detected" impactColor={data.unusual_activity ? '#22c55e' : undefined} />
      <CalcRow label="Skew" value={data.skew} note={data.skew === 'mild_call_skew' ? 'More call buying than puts' : 'More put buying than calls'} impact={data.skew === 'mild_call_skew' ? 'positive' : 'negative'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Volatility</div>
      <CalcRow label="Implied Volatility" value={`${(data.implied_volatility * 100).toFixed(1)}%`} note={data.implied_volatility < 0.3 ? 'Low IV - cheap options' : data.implied_volatility < 0.6 ? 'Normal IV range' : data.implied_volatility < 0.8 ? 'Elevated IV' : 'Very high IV - expensive options'} impact={data.implied_volatility >= 0.3 && data.implied_volatility <= 0.6 ? 'positive' : data.implied_volatility > 0.8 ? 'negative' : 'neutral'} />
      <CalcRow label="Expected Move" value={`±${data.expected_move_pct}%`} note={data.expected_move_pct >= 5 && data.expected_move_pct <= 10 ? 'Good expected move for earnings' : data.expected_move_pct > 15 ? 'Very large expected move' : 'Small expected move'} impact={data.expected_move_pct >= 5 && data.expected_move_pct <= 10 ? 'positive' : data.expected_move_pct > 15 ? 'negative' : 'neutral'} />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Volume</div>
      <CalcRow label="Call Volume" value={data.call_volume?.toLocaleString()} impact="neutral" />
      <CalcRow label="Put Volume" value={data.put_volume?.toLocaleString()} impact="neutral" />
    </div>
  )
}

export function SentimentBreakdown({ analyst, news, score }: { analyst: any; news: any; score: number }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title="Sentiment Score" score={score} weight={0.10} color="#06b6d4" />

      {analyst && (
        <>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Analyst Ratings</div>
          <CalcRow label="Buy / Hold / Sell" value={`${analyst.buy_ratings} / ${analyst.hold_ratings} / ${analyst.sell_ratings}`} impact={analyst.buy_ratings > analyst.sell_ratings * 3 ? 'positive' : 'neutral'} note={`${analyst.number_of_analysts} analysts covering`} />
          <CalcRow label="Avg Price Target" value={`$${analyst.avg_price_target}`} impact="positive" note="Consensus target from analysts" impactColor="#22c55e" />
          <CalcRow label="Consensus" value={analyst.consensus_trend} impact={analyst.consensus_trend === 'buy' || analyst.consensus_trend === 'strong-buy' ? 'positive' : 'neutral'} />
          {analyst.recent_upgrades?.length > 0 && <CalcRow label="Recent Upgrades" value={analyst.recent_upgrades.join(', ')} impact="positive" note={`${analyst.recent_upgrades.length} upgrade(s)`} />}
          {analyst.recent_downgrades?.length > 0 && <CalcRow label="Recent Downgrades" value={analyst.recent_downgrades.join(', ')} impact="negative" note={`${analyst.recent_downgrades.length} downgrade(s)`} />}
        </>
      )}

      {news && (
        <>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>News Sentiment</div>
          <CalcRow label="Sentiment Score" value={`${news.sentiment_score}`} note={news.sentiment_score > 0.6 ? 'Positive news flow' : news.sentiment_score < 0.4 ? 'Negative news flow' : 'Neutral'} impact={news.sentiment_score > 0.6 ? 'positive' : news.sentiment_score < 0.4 ? 'negative' : 'neutral'} />
          <CalcRow label="Headlines Analyzed" value={news.headline_count} impact="neutral" />
          {news.bullish_signals > 0 && <CalcRow label="Bullish Signals" value={news.bullish_signals} impact="positive" />}
          {news.bearish_signals > 0 && <CalcRow label="Bearish Signals" value={news.bearish_signals} impact="negative" />}
        </>
      )}
    </div>
  )
}

export function HistoricalBreakdown({ data, score }: { data: any; score: number }) {
  if (!data) return null

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title="Historical Earnings Score" score={score} weight={0.15} color="#ec4899" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Move Statistics</div>
      <CalcRow label="Avg Move After Earnings" value={`±${data.avg_move_pct}%`} note={data.avg_move_pct > 8 ? 'Large historical moves' : data.avg_move_pct > 5 ? 'Moderate moves' : 'Small moves'} impact={data.avg_move_pct > 5 ? 'positive' : 'neutral'} />
      <CalcRow label="Median Move" value={`±${data.median_move_pct}%`} impact="neutral" note="Less sensitive to outliers" />
      <CalcRow label="Largest Upside" value={`+${data.largest_upside_pct}%`} impact="positive" impactColor="#22c55e" />
      <CalcRow label="Largest Downside" value={`${data.largest_downside_pct}%`} impact="negative" impactColor="#ef4444" />

      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Directional Bias</div>
      <CalcRow label="Avg 1-Day Return" value={`${data.avg_1d_return}%`} note={data.avg_1d_return > 2 ? 'Strong positive bias' : data.avg_1d_return > 0 ? 'Slight positive bias' : 'Negative bias'} impact={data.avg_1d_return > 0 ? 'positive' : 'negative'} impactColor={data.avg_1d_return > 0 ? '#22c55e' : '#ef4444'} />
      <CalcRow label="Gap Up Rate" value={`${data.gap_up_pct}%`} note={data.gap_up_pct > 60 ? 'Usually gaps up' : 'Mixed gaps'} impact={data.gap_up_pct > 60 ? 'positive' : 'neutral'} />
      <CalcRow label="Gap Down Rate" value={`${data.gap_down_pct}%`} impact={data.gap_down_pct > 60 ? 'negative' : 'neutral'} />

      {data.recent_moves?.length > 0 && (
        <>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '16px' }}>Recent Moves</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {data.recent_moves.map((m: any, i: number) => (
              <span key={i} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                background: m.day_return_pct > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: m.day_return_pct > 0 ? '#22c55e' : '#ef4444',
              }}>
                {m.day_return_pct > 0 ? '+' : ''}{m.day_return_pct}%
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function MacroBreakdown({ data, score }: { data: any; score: number }) {
  if (!data) return null

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <SectionHeader title="Macro Score" score={score} weight={0.05} color="#64748b" />

      <CalcRow label="S&P 500 Trend" value={data.sp500_trend} impact={data.sp500_trend === 'bullish' ? 'positive' : data.sp500_trend === 'bearish' ? 'negative' : 'neutral'} note="Overall market direction" />
      <CalcRow label="Nasdaq Trend" value={data.nasdaq_trend} impact={data.nasdaq_trend === 'bullish' ? 'positive' : data.nasdaq_trend === 'bearish' ? 'negative' : 'neutral'} note="Tech sector direction" />
      <CalcRow label="Market Regime" value={data.market_regime?.replace('_', ' ')} impact={data.market_regime === 'risk_on' ? 'positive' : data.market_regime === 'risk_off' ? 'negative' : 'neutral'} note={data.market_regime === 'risk_on' ? 'Favorable for earnings trades' : data.market_regime === 'risk_off' ? 'Caution warranted' : 'Mixed signals'} />
      <CalcRow label="VIX" value={data.vix} impact={data.vix < 15 ? 'positive' : data.vix > 30 ? 'negative' : 'neutral'} note={data.vix < 15 ? 'Low fear - favorable' : data.vix < 20 ? 'Normal' : data.vix > 30 ? 'High fear - caution' : 'Elevated'} />
      <CalcRow label="Market Breadth" value={data.breadth} impact={data.breadth === 'healthy' ? 'positive' : 'negative'} note={data.breadth === 'healthy' ? 'Broad participation' : 'Narrow market'} />
    </div>
  )
}

export function OverallBreakdown({ scores }: { scores: any }) {
  const weights: Record<string, number> = {
    technical: 0.30, fundamental: 0.20, options: 0.20,
    historical: 0.15, sentiment: 0.10, macro: 0.05,
  }
  const colors: Record<string, string> = {
    technical: '#3b82f6', fundamental: '#a855f7', options: '#f59e0b',
    historical: '#ec4899', sentiment: '#06b6d4', macro: '#64748b',
  }

  const overall = Object.entries(weights).reduce((sum, [k, w]) => sum + (scores[k] || 0) * w, 0)

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Overall Score Calculation</h3>
        <div style={{ fontSize: '28px', fontWeight: '700', color: overall >= 80 ? '#22c55e' : overall >= 60 ? '#eab308' : '#ef4444' }}>
          {overall.toFixed(1)}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Weighted average: Σ (category_score × weight)
      </div>

      {Object.entries(weights).map(([category, weight]) => (
        <div key={category} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: colors[category] }} />
              <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{category}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>× {Math.round(weight * 100)}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>{scores[category] || 0}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>= {((scores[category] || 0) * weight).toFixed(1)}</span>
            </div>
          </div>
          <Bar value={scores[category] || 0} color={colors[category]} />
        </div>
      ))}

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>Final Score</span>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>
          {Object.entries(weights).map(([k, w]) => `${(scores[k] || 0)}×${Math.round(w * 100)}%`).join(' + ')} = <strong>{overall.toFixed(1)}</strong>
        </span>
      </div>
    </div>
  )
}
