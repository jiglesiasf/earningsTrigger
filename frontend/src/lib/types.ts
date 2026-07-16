export interface MarketSummary {
  sp500_trend: string
  sp500_price: number
  sp500_change_pct: number
  nasdaq_trend: string
  nasdaq_price: number
  nasdaq_change_pct: number
  vix: number
  vix_trend: string
  market_regime: string
  risk_level: string
  sector_leadership: string[]
  macro_events: string[]
  breadth: string
}

export interface Scores {
  technical: number
  fundamental: number
  options: number
  sentiment: number
  historical: number
  macro: number
  overall: number
}

export interface TradeParameters {
  buy_above: number
  stop_loss: number
  take_profit: number
  expected_move: string
  expected_move_dollars: string
  risk_reward: number
  support_levels: number[]
  resistance_levels: number[]
  expected_return_pct: number
  max_drawdown_pct: number
}

export interface StockPick {
  ticker: string
  company: string
  sector: string
  earnings_date: string
  days_until_earnings: number
  earnings_time: string
  price: {
    current: number
    open: number
    high: number
    low: number
    previous_close: number
    change_pct: number
    market_cap: number
  }
  trade_parameters: TradeParameters
  scores: Scores
  technical: any
  fundamentals: any
  options: any
  analyst: any
  historical_earnings: any
  news: any
  decision: string
  decision_rationale: string
}

export interface AnalysisOutput {
  run_date: string
  run_time: string
  market_summary: MarketSummary
  earnings_universe: any[]
  top_picks: StockPick[]
  watchlist: StockPick[]
  watchlist_changes: {
    added: { ticker: string; reason: string }[]
    removed: { ticker: string; reason: string }[]
  }
}
