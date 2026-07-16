import yfinance as yf


def get_market_regime():
    try:
        spy = yf.Ticker("SPY")
        qqq = yf.Ticker("QQQ")
        vix = yf.Ticker("^VIX")

        spy_hist = spy.history(period="3mo")
        qqq_hist = qqq.history(period="3mo")
        vix_hist = vix.history(period="1d")

        if spy_hist.empty or qqq_hist.empty:
            return {}

        spy_ema20 = spy_hist["Close"].ewm(span=20).mean().iloc[-1]
        spy_ema50 = spy_hist["Close"].ewm(span=50).mean().iloc[-1]
        spy_price = spy_hist["Close"].iloc[-1]

        qqq_ema20 = qqq_hist["Close"].ewm(span=20).mean().iloc[-1]
        qqq_ema50 = qqq_hist["Close"].ewm(span=50).mean().iloc[-1]
        qqq_price = qqq_hist["Close"].iloc[-1]

        vix_value = vix_hist["Close"].iloc[-1] if not vix_hist.empty else 20.0

        sp500_trend = "bullish" if spy_price > spy_ema20 > spy_ema50 else ("bearish" if spy_price < spy_ema20 < spy_ema50 else "neutral")
        nasdaq_trend = "bullish" if qqq_price > qqq_ema20 > qqq_ema50 else ("bearish" if qqq_price < qqq_ema20 < qqq_ema50 else "neutral")

        if vix_value < 15:
            risk_level = "low"
            market_regime = "risk_on"
        elif vix_value < 25:
            risk_level = "moderate"
            market_regime = "neutral"
        else:
            risk_level = "high"
            market_regime = "risk_off"

        return {
            "sp500_trend": sp500_trend,
            "sp500_price": round(spy_price, 2),
            "sp500_change_pct": round(((spy_price - spy_hist["Close"].iloc[-2]) / spy_hist["Close"].iloc[-2]) * 100, 2),
            "nasdaq_trend": nasdaq_trend,
            "nasdaq_price": round(qqq_price, 2),
            "nasdaq_change_pct": round(((qqq_price - qqq_hist["Close"].iloc[-2]) / qqq_hist["Close"].iloc[-2]) * 100, 2),
            "vix": round(float(vix_value), 2),
            "vix_trend": "declining" if len(vix_hist) > 5 and vix_hist["Close"].iloc[-1] < vix_hist["Close"].iloc[-5] else "rising",
            "market_regime": market_regime,
            "risk_level": risk_level,
            "sector_leadership": [],
            "macro_events": [],
            "breadth": "healthy" if sp500_trend != "bearish" else "weak",
        }
    except Exception:
        return {}
