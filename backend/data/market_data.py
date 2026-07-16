import yfinance as yf
import numpy as np
import pandas as pd


def get_market_data(ticker, period="1y"):
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        info = stock.info

        if hist.empty:
            return None

        current = hist.iloc[-1]
        avg_volume_20 = hist["Volume"].tail(20).mean()
        atr = calculate_atr(hist, 14)

        prev_close = hist["Close"].iloc[-2] if len(hist) > 1 else current["Close"]
        gap_pct = ((current["Open"] - prev_close) / prev_close) * 100

        return {
            "ticker": ticker,
            "current_price": round(current["Close"], 2),
            "open": round(current["Open"], 2),
            "high": round(current["High"], 2),
            "low": round(current["Low"], 2),
            "previous_close": round(prev_close, 2),
            "change_pct": round(((current["Close"] - prev_close) / prev_close) * 100, 2),
            "volume": int(current["Volume"]),
            "avg_volume_20": int(avg_volume_20),
            "relative_volume": round(current["Volume"] / avg_volume_20, 2) if avg_volume_20 > 0 else 0,
            "atr_14": round(atr, 2),
            "gap_pct": round(gap_pct, 2),
            "market_cap": info.get("marketCap"),
            "beta": info.get("beta"),
            "company_name": info.get("shortName", ticker),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "hist": hist,
            "info": info,
        }
    except Exception as e:
        return None


def calculate_atr(hist, period=14):
    high = hist["High"]
    low = hist["Low"]
    close = hist["Close"].shift(1)

    tr1 = high - low
    tr2 = abs(high - close)
    tr3 = abs(low - close)

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()

    return atr.iloc[-1]


def get_spy_data(period="1y"):
    return get_market_data("SPY", period)


def get_qqq_data(period="1y"):
    return get_market_data("QQQ", period)
