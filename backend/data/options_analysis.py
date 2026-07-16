import yfinance as yf
import numpy as np


def get_options_data(ticker):
    try:
        stock = yf.Ticker(ticker)
        expirations = stock.options

        if not expirations:
            return {}

        nearest_exp = expirations[0]
        chain = stock.option_chain(nearest_exp)

        calls = chain.calls
        puts = chain.puts

        current_price = stock.info.get("currentPrice") or stock.info.get("regularMarketPrice")
        if current_price is None:
            hist = stock.history(period="1d")
            if not hist.empty:
                current_price = hist["Close"].iloc[-1]

        call_volume = calls["volume"].sum()
        put_volume = puts["volume"].sum()
        call_oi = calls["openInterest"].sum()
        put_oi = puts["openInterest"].sum()

        put_call_ratio = put_volume / call_volume if call_volume > 0 else 1.0

        iv_calls = calls["impliedVolatility"].dropna()
        iv_puts = puts["impliedVolatility"].dropna()

        avg_iv = iv_calls.mean() if not iv_calls.empty else 0.5
        atm_call = calls.iloc[(calls["strike"] - current_price).abs().argsort()[:1]] if not calls.empty else None
        atm_put = puts.iloc[(puts["strike"] - current_price).abs().argsort()[:1]] if not puts.empty else None

        expected_move = current_price * avg_iv * np.sqrt(30 / 365)

        return {
            "implied_volatility": round(float(avg_iv), 4) if not np.isnan(avg_iv) else 0.5,
            "put_call_ratio": round(float(put_call_ratio), 2),
            "call_volume": int(call_volume) if not np.isnan(call_volume) else 0,
            "put_volume": int(put_volume) if not np.isnan(put_volume) else 0,
            "call_open_interest": int(call_oi) if not np.isnan(call_oi) else 0,
            "put_open_interest": int(put_oi) if not np.isnan(put_oi) else 0,
            "expected_move": round(float(expected_move), 2) if not np.isnan(expected_move) else 0,
            "expected_move_pct": round((float(expected_move) / current_price) * 100, 2) if current_price and not np.isnan(expected_move) else 0,
            "atm_straddle_price": None,
            "skew": "mild_put_skew" if put_call_ratio > 0.8 else "mild_call_skew",
            "gamma_exposure": "positive" if put_call_ratio < 0.8 else "neutral",
            "unusual_activity": call_volume > 2 * calls["volume"].mean() if not calls.empty and "volume" in calls.columns else False,
        }
    except Exception:
        return {}
