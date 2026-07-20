import yfinance as yf

SP500_CORE = [
    "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "META", "BRK-B", "LLY", "AVGO", "JPM",
    "TSLA", "V", "UNH", "XOM", "COST", "WMT", "JNJ", "MA", "HD", "PG",
    "ABBV", "CRM", "NFLX", "MRK", "BAC", "AMD", "CVX", "ORCL", "KO", "PEP",
    "LIN", "TMO", "CSCO", "ACN", "WFC", "ABT", "DHR", "ADBE", "NKE", "TXN",
    "PM", "NEE", "BMY", "INTC", "UPS", "MS", "QCOM", "RTX", "HON", "LOW",
    "UNP", "AMGN", "IBM", "CAT", "GE", "BA", "GS", "BLK", "AXP", "ISRG",
    "MDLZ", "GILD", "SYK", "ADP", "CB", "PLD", "CI", "MMC", "SCHW", "SYY",
    "SO", "DUK", "CME", "CL", "ZTS", "REGN", "VRTX", "BSX", "ICE", "EQIX",
    "APD", "SHW", "FDX", "WM", "OXY", "SLB", "PSA", "EMR", "NSC", "FCX",
    "PNC", "USB", "CMG", "MCD", "TJX", "ROST", "ORLY", "AZO", "TTD", "MRVL",
]

NASDAQ100_EXTRA = [
    "PANW", "KLAC", "SNPS", "CDNS", "MCHP", "FTNT", "DDOG", "CRWD", "NET", "ZS",
    "TEAM", "WDAY", "VEEV", "COIN", "SHOP", "MELI", "SE", "CPNG", "ABNB", "DASH",
    "UBER", "LYFT", "SNAP", "PINS", "RBLX", "ROKU", "TTWO", "EA", "NTES", "BILI",
    "LULU", "ONON", "EXPE", "BKNG", "TCOM", "GLW", "STX", "WDC", "HPE", "HPQ",
    "ARM", "SMCI", "ANET", "DELL", "GEHC", "TDG", "HWM", "CEG", "VST", "APP",
]

CUSTOM_WATCHLIST = [
    "WBX",
]


def get_large_cap_universe():
    combined = list(set(SP500_CORE + NASDAQ100_EXTRA + CUSTOM_WATCHLIST))
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
