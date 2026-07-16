import yfinance as yf
from datetime import datetime, timedelta, date


def get_earnings_calendar(tickers, days_ahead=14):
    today = datetime.now()
    end_date = today + timedelta(days=days_ahead)
    upcoming = []

    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            cal = stock.calendar
            if cal is None:
                continue

            earnings_date = None
            eps_estimate = None
            time = "unknown"

            if isinstance(cal, dict):
                earnings_date = cal.get("Earnings Date")
                if isinstance(earnings_date, list) and len(earnings_date) > 0:
                    earnings_date = earnings_date[0]
                eps_estimate = cal.get("EPS Estimate")
                time = cal.get("Call Time", "unknown")
            elif hasattr(cal, "columns"):
                if not cal.empty:
                    earnings_date = cal.index[0] if len(cal.index) > 0 else None
                    if "EPS Estimate" in cal.columns:
                        eps_estimate = cal["EPS Estimate"].iloc[0]

            if earnings_date is None:
                continue

            if isinstance(earnings_date, str):
                earnings_date = datetime.strptime(earnings_date, "%Y-%m-%d").date()
            elif isinstance(earnings_date, datetime):
                earnings_date = earnings_date.date()
            elif isinstance(earnings_date, date):
                pass
            else:
                continue

            if today.date() <= earnings_date <= end_date.date():
                days_until = (earnings_date - today.date()).days
                upcoming.append({
                    "ticker": ticker,
                    "earnings_date": earnings_date.strftime("%Y-%m-%d"),
                    "days_until_earnings": days_until,
                    "eps_estimate": eps_estimate,
                    "time": time,
                })
        except Exception:
            continue

    return sorted(upcoming, key=lambda x: x["days_until_earnings"])
