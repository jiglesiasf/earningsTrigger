import { AnalysisOutput } from './types'

const DATA_BASE = '/earningsTrigger/data'

export async function getLatestAnalysis(): Promise<AnalysisOutput | null> {
  try {
    const res = await fetch(`${DATA_BASE}/latest.json`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getStockData(ticker: string): Promise<any | null> {
  try {
    const res = await fetch(`${DATA_BASE}/stock/${ticker}.json`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getHistoricalData(ticker: string): Promise<any | null> {
  try {
    const res = await fetch(`${DATA_BASE}/historical_${ticker}.json`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
