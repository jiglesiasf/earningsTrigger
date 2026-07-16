'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getStockData } from '@/lib/api'

function ScoreBox({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'
  const bg = score >= 80 ? 'rgba(34,197,94,0.08)' : score >= 60 ? 'rgba(234,179,8,0.08)' : 'rgba(239,68,68,0.08)'
  return (
    <div style={{ width: '100px', height: '100px', background: bg, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
      <div style={{ fontSize: '28px', fontWeight: '700', color }}>{Math.round(score)}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: '600', color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function StockDetailContent() {
  const searchParams = useSearchParams()
  const ticker = searchParams.get('ticker')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ticker) {
      getStockData(ticker).then((result) => { setData(result); setLoading(false) })
    }
  }, [ticker])

  if (!ticker) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No ticker specified. <a href="/earningsTrigger/earnings/" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>Browse the calendar →</a></p>
      </div>
    )
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><p style={{ color: 'var(--text-secondary)' }}>Loading {ticker}...</p></div>
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{ticker}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>No data available for this stock.</p>
      </div>
    )
  }

  const decisionColor = data.decision === 'STRONG BUY' || data.decision === 'BUY' ? '#22c55e' : data.decision === 'WATCH' ? '#eab308' : '#ef4444'

  return (
    <div>
      <a href="/earningsTrigger/earnings/" style={{ color: 'var(--accent-blue)', fontSize: '13px', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>← Back to Calendar</a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '4px' }}>{data.ticker}</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{data.company}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{data.sector} &middot; Earnings {data.earnings_date}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            background: `${decisionColor}15`,
            color: decisionColor,
            marginBottom: '8px',
          }}>{data.decision}</div>
          <div style={{ fontSize: '36px', fontWeight: '700' }}>${data.price.current}</div>
          <div style={{ fontSize: '16px', color: data.price.change_pct >= 0 ? '#22c55e' : '#ef4444', fontWeight: '500' }}>
            {data.price.change_pct >= 0 ? '+' : ''}{data.price.change_pct}%
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', fontStyle: 'italic' }}>{data.decision_rationale}</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <ScoreBox label="Overall" score={data.scores.overall} />
        <ScoreBox label="Technical" score={data.scores.technical} />
        <ScoreBox label="Fundamental" score={data.scores.fundamental} />
        <ScoreBox label="Options" score={data.scores.options} />
        <ScoreBox label="Historical" score={data.scores.historical} />
        <ScoreBox label="Sentiment" score={data.scores.sentiment} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <Panel title="Trade Parameters">
          <Row label="Buy Above" value={`$${data.trade_parameters.buy_above}`} />
          <Row label="Stop Loss" value={`$${data.trade_parameters.stop_loss}`} color="#ef4444" />
          <Row label="Take Profit" value={`$${data.trade_parameters.take_profit}`} color="#22c55e" />
          <Row label="Risk/Reward" value={`${data.trade_parameters.risk_reward}:1`} />
          <Row label="Expected Move" value={data.trade_parameters.expected_move} />
          <Row label="Expected Return" value={`+${data.trade_parameters.expected_return_pct}%`} color="#22c55e" />
          <Row label="Max Drawdown" value={`${data.trade_parameters.max_drawdown_pct}%`} color="#ef4444" />
        </Panel>

        <Panel title="Technical Analysis">
          {data.technical?.trend && (
            <>
              <Row label="Price > 20 EMA" value={data.technical.trend.price_above_20_ema ? 'Yes' : 'No'} color={data.technical.trend.price_above_20_ema ? '#22c55e' : '#ef4444'} />
              <Row label="Price > 50 SMA" value={data.technical.trend.price_above_50_sma ? 'Yes' : 'No'} color={data.technical.trend.price_above_50_sma ? '#22c55e' : '#ef4444'} />
              <Row label="Price > 200 SMA" value={data.technical.trend.price_above_200_sma ? 'Yes' : 'No'} color={data.technical.trend.price_above_200_sma ? '#22c55e' : '#ef4444'} />
              <Row label="Golden Cross" value={data.technical.trend.golden_cross ? 'Yes' : 'No'} color={data.technical.trend.golden_cross ? '#22c55e' : 'var(--text-muted)'} />
              <Row label="RSI (14)" value={data.technical.momentum?.rsi_14} color={data.technical.momentum?.rsi_14 > 70 ? '#ef4444' : data.technical.momentum?.rsi_14 < 30 ? '#22c55e' : undefined} />
              <Row label="MACD Histogram" value={data.technical.momentum?.macd_histogram?.toFixed(4)} color={data.technical.momentum?.macd_histogram > 0 ? '#22c55e' : '#ef4444'} />
              <Row label="ADX" value={data.technical.momentum?.adx} />
              <Row label="OBV Trend" value={data.technical.volume?.obv_trend} color={data.technical.volume?.obv_trend === 'up' ? '#22c55e' : '#ef4444'} />
            </>
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <Panel title="Fundamentals">
          {data.fundamentals && (
            <>
              <Row label="Revenue Growth YoY" value={`${data.fundamentals.revenue_growth_yoy}%`} color={data.fundamentals.revenue_growth_yoy > 0 ? '#22c55e' : '#ef4444'} />
              <Row label="EPS Growth YoY" value={`${data.fundamentals.eps_growth_yoy}%`} color={data.fundamentals.eps_growth_yoy > 0 ? '#22c55e' : '#ef4444'} />
              <Row label="Gross Margin" value={`${data.fundamentals.gross_margin}%`} />
              <Row label="Operating Margin" value={`${data.fundamentals.operating_margin}%`} />
              <Row label="Net Margin" value={`${data.fundamentals.net_margin}%`} />
              <Row label="PEG Ratio" value={data.fundamentals.peg_ratio} />
              <Row label="Debt/Equity" value={data.fundamentals.debt_to_equity} />
              <Row label="Current Ratio" value={data.fundamentals.current_ratio} />
              <Row label="Forward P/E" value={data.fundamentals.forward_pe} />
            </>
          )}
        </Panel>

        <Panel title="Options Analysis">
          {data.options && (
            <>
              <Row label="Implied Volatility" value={`${(data.options.implied_volatility * 100).toFixed(1)}%`} />
              <Row label="Put/Call Ratio" value={data.options.put_call_ratio} color={data.options.put_call_ratio < 0.8 ? '#22c55e' : data.options.put_call_ratio > 1.2 ? '#ef4444' : undefined} />
              <Row label="Expected Move" value={`±${data.options.expected_move_pct}%`} />
              <Row label="Call Volume" value={data.options.call_volume?.toLocaleString()} />
              <Row label="Put Volume" value={data.options.put_volume?.toLocaleString()} />
              <Row label="Skew" value={data.options.skew} />
              <Row label="Unusual Activity" value={data.options.unusual_activity ? 'Yes' : 'No'} color={data.options.unusual_activity ? '#22c55e' : 'var(--text-muted)'} />
            </>
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Panel title="Analyst Sentiment">
          {data.analyst && (
            <>
              <Row label="Buy Ratings" value={data.analyst.buy_ratings} color="#22c55e" />
              <Row label="Hold Ratings" value={data.analyst.hold_ratings} />
              <Row label="Sell Ratings" value={data.analyst.sell_ratings} color="#ef4444" />
              <Row label="Avg Price Target" value={`$${data.analyst.avg_price_target}`} />
              <Row label="Consensus" value={data.analyst.consensus_trend} />
              {data.analyst.recent_upgrades?.length > 0 && (
                <Row label="Recent Upgrades" value={data.analyst.recent_upgrades.join(', ')} color="#22c55e" />
              )}
            </>
          )}
        </Panel>

        <Panel title="Historical Earnings Moves">
          {data.historical_earnings && (
            <>
              <Row label="Avg Move" value={`±${data.historical_earnings.avg_move_pct}%`} />
              <Row label="Avg 1-Day Return" value={`${data.historical_earnings.avg_1d_return}%`} color={data.historical_earnings.avg_1d_return > 0 ? '#22c55e' : '#ef4444'} />
              <Row label="Largest Upside" value={`+${data.historical_earnings.largest_upside_pct}%`} color="#22c55e" />
              <Row label="Largest Downside" value={`${data.historical_earnings.largest_downside_pct}%`} color="#ef4444" />
              <Row label="Gap Up %" value={`${data.historical_earnings.gap_up_pct}%`} />
              <Row label="Gap Down %" value={`${data.historical_earnings.gap_down_pct}%`} />
            </>
          )}
        </Panel>
      </div>
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
