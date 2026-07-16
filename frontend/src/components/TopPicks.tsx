import { StockPick } from '@/lib/types'
import ScoreCard from './ScoreCard'

function DecisionBadge({ decision }: { decision: string }) {
  const colors: Record<string, string> = {
    'STRONG BUY': 'bg-green-600 text-white',
    'BUY': 'bg-green-500 text-white',
    'WATCH': 'bg-yellow-500 text-white',
    'AVOID': 'bg-red-500 text-white',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors[decision] || 'bg-gray-500 text-white'}`}>
      {decision}
    </span>
  )
}

export default function TopPicks({ picks }: { picks: StockPick[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Top {picks.length} Earnings Opportunities</h2>
      <div className="grid gap-4">
        {picks.map((pick) => (
          <a
            key={pick.ticker}
            href={`/stock?ticker=${pick.ticker}`}
            className="block bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{pick.ticker}</h3>
                <p className="text-gray-600">{pick.company}</p>
                <p className="text-sm text-gray-500">
                  {pick.sector} | Earnings: {pick.earnings_date} ({pick.days_until_earnings}d)
                </p>
              </div>
              <div className="text-right">
                <DecisionBadge decision={pick.decision} />
                <div className="mt-2 text-2xl font-bold">${pick.price.current}</div>
                <div className={`text-sm ${pick.price.change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pick.price.change_pct >= 0 ? '+' : ''}{pick.price.change_pct}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
              <ScoreCard label="Overall" score={pick.scores.overall} size="sm" />
              <ScoreCard label="Technical" score={pick.scores.technical} size="sm" />
              <ScoreCard label="Fundamental" score={pick.scores.fundamental} size="sm" />
              <ScoreCard label="Options" score={pick.scores.options} size="sm" />
              <ScoreCard label="Historical" score={pick.scores.historical} size="sm" />
              <ScoreCard label="Sentiment" score={pick.scores.sentiment} size="sm" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Buy Above:</span>
                <span className="ml-2 font-semibold">${pick.trade_parameters.buy_above}</span>
              </div>
              <div>
                <span className="text-gray-500">Stop Loss:</span>
                <span className="ml-2 font-semibold text-red-600">${pick.trade_parameters.stop_loss}</span>
              </div>
              <div>
                <span className="text-gray-500">Take Profit:</span>
                <span className="ml-2 font-semibold text-green-600">${pick.trade_parameters.take_profit}</span>
              </div>
              <div>
                <span className="text-gray-500">Risk/Reward:</span>
                <span className="ml-2 font-semibold">{pick.trade_parameters.risk_reward}:1</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
