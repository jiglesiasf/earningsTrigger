import yfinance as yf
import pandas as pd

SP500_URL = "https://en.wikipedia.org/wiki/list_of_S%26P_500_companies"
NASDAQ100_URL = "https://en.wikipedia.org/wiki/Nasdaq-100"

def get_sp500_tickers():
    try:
        table = pd.read_html(SP500_URL)
        tickers = table[0]["Symbol"].tolist()
        return [t.replace(".", "-") for t in tickers]
    except Exception:
        return []

def get_nasdaq100_tickers():
    try:
        table = pd.read_html(NASDAQ100_URL)
        tickers = table[0]["Ticker"].tolist()
        return [t.replace(".", "-") for t in tickers]
    except Exception:
        return []

def get_large_cap_universe():
    sp500 = get_sp500_tickers()
    nasdaq100 = get_nasdaq100_tickers()
    combined = list(set(sp500 + nasdaq100))
    return sorted(combined)

def filter_by_volume(tickers, min_avg_volume=2_000_000, period="1mo"):
    liquid = []
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period)
            if hist.empty or len(hist) < 5:
                continue
            avg_vol = hist["Volume"].mean()
            if avg_vol >= min_avg_volume:
                liquid.append(ticker)
        except Exception:
            continue
    return liquid
