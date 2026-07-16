# Earnings Trigger

Automated earnings trading analysis system that identifies high-probability earnings trades.

## Architecture

- **Backend**: Python analysis engine (data collection, scoring, recommendations)
- **Frontend**: Next.js static site (dashboard, earnings calendar, stock details)
- **Deployment**: GitHub Actions (daily analysis) + GitHub Pages (static site)

## Setup

### 1. Python Backend

```bash
cd backend
pip install -r requirements.txt
```

### 2. API Keys (Optional)

Free tiers available:
- [Finnhub](https://finnhub.io/) - 60 requests/min
- [Financial Modeling Prep](https://financialmodelingprep.com/) - 250 calls/day

```bash
export FINNHUB_API_KEY=your_key
export FMP_API_KEY=your_key
```

### 3. Run Analysis

```bash
python backend/main.py
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

## GitHub Pages Deployment

1. Push to GitHub
2. Add API keys as repository secrets:
   - `FINNHUB_API_KEY`
   - `FMP_API_KEY`
3. Enable GitHub Pages in Settings > Pages
4. The site will auto-deploy on push to main

## Daily Analysis

The GitHub Actions workflow runs automatically:
- Every trading day at 5:30 AM ET (9:30 UTC)
- Can be triggered manually via Actions tab

## Scoring System

| Category | Weight | Description |
|----------|--------|-------------|
| Technical | 30% | Trend, momentum, volume, price structure |
| Fundamental | 20% | Revenue growth, margins, valuation |
| Options | 20% | IV, put/call ratio, expected move |
| Historical | 15% | Past earnings moves, beat rate |
| Sentiment | 10% | Analyst ratings, news sentiment |
| Macro | 5% | Market regime, VIX, breadth |

## Decision Rules

- **STRONG BUY**: Score >= 90
- **BUY**: Score >= 80
- **WATCH**: Score >= 70
- **AVOID**: Score < 70

## Data Sources

- **yfinance**: Price data, options, fundamentals, analyst ratings
- **pandas_ta**: Technical indicators (computed locally)
- **Finnhub**: Earnings calendar backup
- **FMP**: Deep fundamental data

## Project Structure

```
earningsTrigger/
├── backend/           # Python analysis engine
│   ├── data/          # Data collection modules
│   ├── scoring/       # Scoring algorithms
│   ├── analysis/      # Trade parameters, recommendations
│   └── main.py        # Entry point
├── frontend/          # Next.js application
│   ├── src/app/       # Pages
│   └── src/components/# UI components
├── public/data/       # Analysis output (JSON)
└── .github/workflows/ # CI/CD pipelines
```
