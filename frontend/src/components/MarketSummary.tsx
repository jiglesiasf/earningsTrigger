import { MarketSummary as MarketSummaryType } from '@/lib/types'

function TrendBadge({ trend }: { trend: string }) {
  const colors = {
    bullish: 'bg-green-100 text-green-800',
    bearish: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${colors[trend as keyof typeof colors] || colors.neutral}`}>
      {trend}
    </span>
  )
}

export default function MarketSummary({ summary }: { summary: MarketSummaryType }) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Market Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-sm text-gray-500">S&P 500</div>
          <div className="text-lg font-semibold">{summary.sp500_price}</div>
          <div className={`text-sm ${summary.sp500_change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.sp500_change_pct >= 0 ? '+' : ''}{summary.sp500_change_pct}%
          </div>
          <TrendBadge trend={summary.sp500_trend} />
        </div>
        <div>
          <div className="text-sm text-gray-500">Nasdaq</div>
          <div className="text-lg font-semibold">{summary.nasdaq_price}</div>
          <div className={`text-sm ${summary.nasdaq_change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.nasdaq_change_pct >= 0 ? '+' : ''}{summary.nasdaq_change_pct}%
          </div>
          <TrendBadge trend={summary.nasdaq_trend} />
        </div>
        <div>
          <div className="text-sm text-gray-500">VIX</div>
          <div className="text-lg font-semibold">{summary.vix}</div>
          <div className="text-sm text-gray-600">{summary.vix_trend}</div>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
            summary.risk_level === 'low' ? 'bg-green-100 text-green-800' :
            summary.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {summary.risk_level} risk
          </span>
        </div>
        <div>
          <div className="text-sm text-gray-500">Regime</div>
          <div className="text-lg font-semibold capitalize">{summary.market_regime.replace('_', ' ')}</div>
          <div className="text-sm text-gray-600">Breadth: {summary.breadth}</div>
        </div>
      </div>
      {summary.macro_events.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-500 mb-2">Key Events</div>
          <div className="flex flex-wrap gap-2">
            {summary.macro_events.map((event, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                {event}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
