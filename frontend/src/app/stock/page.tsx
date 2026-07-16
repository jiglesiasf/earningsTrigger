'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getStockData } from '@/lib/api'
import ScoreCard from '@/components/ScoreCard'

function StockDetailContent() {
  const searchParams = useSearchParams()
  const ticker = searchParams.get('ticker')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ticker) {
      getStockData(ticker).then((result) => {
        setData(result)
        setLoading(false)
      })
    }
  }, [ticker])

  if (!ticker) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Stock Detail</h1>
        <p className="text-gray-500">No ticker specified. Go to the <a href="/earnings" className="text-blue-600 hover:underline">earnings calendar</a> to select a stock.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-xl text-gray-500">Loading {ticker}...</div>
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">{ticker}</h1>
        <p className="text-gray-500">No data available for this stock.</p>
        <a href="/earnings" className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Calendar</a>
      </div>
    )
  }

  return (
    <div>
      <a href="/earnings" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Calendar</a>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold">{data.ticker}</h1>
          <p className="text-xl text-gray-600">{data.company}</p>
          <p className="text-gray-500">{data.sector} | Earnings: {data.earnings_date}</p>
        </div>
        <div className="text-right">
          <div className={`px-4 py-2 rounded-full text-lg font-bold ${
            data.decision === 'STRONG BUY' ? 'bg-green-600 text-white' :
            data.decision === 'BUY' ? 'bg-green-500 text-white' :
            data.decision === 'WATCH' ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {data.decision}
          </div>
          <div className="mt-2 text-3xl font-bold">${data.price.current}</div>
          <div className={`text-lg ${data.price.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.price.change_pct >= 0 ? '+' : ''}{data.price.change_pct}%
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-6 italic">{data.decision_rationale}</p>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
        <ScoreCard label="Overall" score={data.scores.overall} />
        <ScoreCard label="Technical" score={data.scores.technical} />
        <ScoreCard label="Fundamental" score={data.scores.fundamental} />
        <ScoreCard label="Options" score={data.scores.options} />
        <ScoreCard label="Historical" score={data.scores.historical} />
        <ScoreCard label="Sentiment" score={data.scores.sentiment} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Trade Parameters</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Buy Above</span>
              <span className="font-bold text-lg">${data.trade_parameters.buy_above}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stop Loss</span>
              <span className="font-bold text-lg text-red-600">${data.trade_parameters.stop_loss}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Take Profit</span>
              <span className="font-bold text-lg text-green-600">${data.trade_parameters.take_profit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Risk/Reward</span>
              <span className="font-bold text-lg">{data.trade_parameters.risk_reward}:1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Move</span>
              <span className="font-semibold">{data.trade_parameters.expected_move}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Return</span>
              <span className="font-semibold text-green-600">+{data.trade_parameters.expected_return_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Max Drawdown</span>
              <span className="font-semibold text-red-600">{data.trade_parameters.max_drawdown_pct}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Technical Analysis</h2>
          {data.technical?.trend && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price &gt; 20 EMA</span>
                <span className={data.technical.trend.price_above_20_ema ? 'text-green-600' : 'text-red-600'}>
                  {data.technical.trend.price_above_20_ema ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price &gt; 50 SMA</span>
                <span className={data.technical.trend.price_above_50_sma ? 'text-green-600' : 'text-red-600'}>
                  {data.technical.trend.price_above_50_sma ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price &gt; 200 SMA</span>
                <span className={data.technical.trend.price_above_200_sma ? 'text-green-600' : 'text-red-600'}>
                  {data.technical.trend.price_above_200_sma ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Golden Cross</span>
                <span className={data.technical.trend.golden_cross ? 'text-green-600' : 'text-gray-600'}>
                  {data.technical.trend.golden_cross ? 'Yes' : 'No'}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-600">RSI (14)</span>
                <span className={`font-semibold ${data.technical.momentum?.rsi_14 > 70 ? 'text-red-600' : data.technical.momentum?.rsi_14 < 30 ? 'text-green-600' : ''}`}>
                  {data.technical.momentum?.rsi_14}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">MACD Histogram</span>
                <span className={data.technical.momentum?.macd_histogram > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.technical.momentum?.macd_histogram?.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ADX</span>
                <span>{data.technical.momentum?.adx}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">OBV Trend</span>
                <span className={data.technical.volume?.obv_trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {data.technical.volume?.obv_trend}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Fundamentals</h2>
          {data.fundamentals && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Growth YoY</span>
                <span className={data.fundamentals.revenue_growth_yoy > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.fundamentals.revenue_growth_yoy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EPS Growth YoY</span>
                <span className={data.fundamentals.eps_growth_yoy > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.fundamentals.eps_growth_yoy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gross Margin</span>
                <span>{data.fundamentals.gross_margin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Operating Margin</span>
                <span>{data.fundamentals.operating_margin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net Margin</span>
                <span>{data.fundamentals.net_margin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PEG Ratio</span>
                <span>{data.fundamentals.peg_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Debt/Equity</span>
                <span>{data.fundamentals.debt_to_equity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Ratio</span>
                <span>{data.fundamentals.current_ratio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Forward P/E</span>
                <span>{data.fundamentals.forward_pe}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Options Analysis</h2>
          {data.options && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Implied Volatility</span>
                <span>{(data.options.implied_volatility * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Put/Call Ratio</span>
                <span className={data.options.put_call_ratio < 0.8 ? 'text-green-600' : data.options.put_call_ratio > 1.2 ? 'text-red-600' : ''}>
                  {data.options.put_call_ratio}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Move</span>
                <span className="font-semibold">±{data.options.expected_move_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Call Volume</span>
                <span>{data.options.call_volume?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Put Volume</span>
                <span>{data.options.put_volume?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skew</span>
                <span>{data.options.skew}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unusual Activity</span>
                <span className={data.options.unusual_activity ? 'text-green-600 font-bold' : 'text-gray-500'}>
                  {data.options.unusual_activity ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Analyst Sentiment</h2>
          {data.analyst && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Buy Ratings</span>
                <span className="text-green-600 font-semibold">{data.analyst.buy_ratings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hold Ratings</span>
                <span>{data.analyst.hold_ratings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sell Ratings</span>
                <span className="text-red-600">{data.analyst.sell_ratings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Price Target</span>
                <span className="font-semibold">${data.analyst.avg_price_target}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consensus</span>
                <span className="capitalize">{data.analyst.consensus_trend}</span>
              </div>
              {data.analyst.recent_upgrades?.length > 0 && (
                <div>
                  <span className="text-gray-600">Recent Upgrades:</span>
                  <span className="ml-2 text-green-600">{data.analyst.recent_upgrades.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Historical Earnings Moves</h2>
          {data.historical_earnings && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Move</span>
                <span className="font-semibold">±{data.historical_earnings.avg_move_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg 1-Day Return</span>
                <span className={data.historical_earnings.avg_1d_return > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.historical_earnings.avg_1d_return}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Largest Upside</span>
                <span className="text-green-600">+{data.historical_earnings.largest_upside_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Largest Downside</span>
                <span className="text-red-600">{data.historical_earnings.largest_downside_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gap Up %</span>
                <span>{data.historical_earnings.gap_up_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gap Down %</span>
                <span>{data.historical_earnings.gap_down_pct}%</span>
              </div>
              {data.historical_earnings.recent_moves?.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-gray-600 text-xs">Recent Moves:</span>
                  <div className="flex gap-2 mt-1">
                    {data.historical_earnings.recent_moves.map((m: any, i: number) => (
                      <span key={i} className={`px-2 py-1 rounded text-xs ${
                        m.day_return_pct > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {m.day_return_pct > 0 ? '+' : ''}{m.day_return_pct}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {data.trade_parameters.support_levels?.length > 0 && (
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Key Levels</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Support Levels</h3>
              <div className="space-y-1">
                {data.trade_parameters.support_levels.map((s: number, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">Support {i + 1}</span>
                    <span className="font-semibold">${s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Resistance Levels</h3>
              <div className="space-y-1">
                {data.trade_parameters.resistance_levels.map((r: number, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">Resistance {i + 1}</span>
                    <span className="font-semibold">${r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StockDetail() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64 text-xl text-gray-500">Loading...</div>}>
      <StockDetailContent />
    </Suspense>
  )
}
