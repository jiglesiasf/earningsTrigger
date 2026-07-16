import pandas as pd
import numpy as np


def calculate_technicals(hist, current_price=None):
    if hist is None or hist.empty:
        return {}

    close = hist["Close"]
    high = hist["High"]
    low = hist["Low"]
    volume = hist["Volume"]

    if current_price is None:
        current_price = close.iloc[-1]

    ema20 = close.ewm(span=20, adjust=False).mean().iloc[-1]
    sma50 = close.rolling(window=50).mean().iloc[-1]
    sma100 = close.rolling(window=100).mean().iloc[-1]
    sma200 = close.rolling(window=200).mean().iloc[-1]

    price_above_ema20 = current_price > ema20
    price_above_sma50 = current_price > sma50
    price_above_sma200 = current_price > sma200

    ema50 = close.ewm(span=50, adjust=False).mean()
    sma50_series = close.rolling(window=50).mean()
    sma200_series = close.rolling(window=200).mean()

    golden_cross = False
    death_cross = False
    if len(ema50) > 1 and len(sma200_series) > 1:
        if ema50.iloc[-1] > sma200_series.iloc[-1] and ema50.iloc[-2] <= sma200_series.iloc[-2]:
            golden_cross = True
        if ema50.iloc[-1] < sma200_series.iloc[-1] and ema50.iloc[-2] >= sma200_series.iloc[-2]:
            death_cross = True

    rsi = calculate_rsi(close, 14)
    macd, macd_signal, macd_histogram = calculate_macd(close)
    stoch_rsi = calculate_stochastic_rsi(close, 14)
    adx = calculate_adx(high, low, close, 14)

    if rsi < 30:
        momentum = "oversold"
    elif rsi < 50:
        momentum = "weak"
    elif rsi < 70:
        momentum = "strong"
    else:
        momentum = "overbought"

    obv = calculate_obv(close, volume)
    obv_trend = "up" if len(obv) > 5 and obv.iloc[-1] > obv.iloc[-5] else "down"

    hv_20 = close.pct_change().tail(20).std() * np.sqrt(252) * 100
    hv_60 = close.pct_change().tail(60).std() * np.sqrt(252) * 100

    high_20d = high.tail(20).max()
    high_30d = high.tail(30).max()
    high_52w = high.max()
    low_20d = low.tail(20).min()

    support_levels = find_support_levels(low.tail(60))
    resistance_levels = find_resistance_levels(high.tail(60))

    nearest_resistance = min([r for r in resistance_levels if r > current_price], default=high_52w)
    nearest_support = max([s for s in support_levels if s < current_price], default=low_20d)

    dist_to_resistance = ((nearest_resistance - current_price) / current_price) * 100
    dist_to_support = ((current_price - nearest_support) / current_price) * 100

    return {
        "trend": {
            "ema_20": round(ema20, 2),
            "sma_50": round(sma50, 2),
            "sma_100": round(sma100, 2),
            "sma_200": round(sma200, 2),
            "price_above_20_ema": price_above_ema20,
            "price_above_50_sma": price_above_sma50,
            "price_above_200_sma": price_above_sma200,
            "golden_cross": golden_cross,
            "death_cross": death_cross,
        },
        "momentum": {
            "rsi_14": round(rsi, 2),
            "macd": round(macd, 4),
            "macd_signal": round(macd_signal, 4),
            "macd_histogram": round(macd_histogram, 4),
            "stochastic_rsi": round(stoch_rsi, 2),
            "adx": round(adx, 2),
            "momentum_score": momentum,
        },
        "volume": {
            "obv_trend": obv_trend,
            "volume_trend": "above_avg" if volume.iloc[-1] > volume.tail(20).mean() else "below_avg",
        },
        "volatility": {
            "historical_volatility_20": round(hv_20, 2),
            "historical_volatility_60": round(hv_60, 2),
        },
        "price_structure": {
            "resistance": [round(r, 2) for r in resistance_levels],
            "support": [round(s, 2) for s in support_levels],
            "high_20d": round(high_20d, 2),
            "high_30d": round(high_30d, 2),
            "high_52w": round(high_52w, 2),
            "distance_to_resistance_pct": round(dist_to_resistance, 2),
            "distance_to_support_pct": round(dist_to_support, 2),
            "nearest_resistance": round(nearest_resistance, 2),
            "nearest_support": round(nearest_support, 2),
        },
    }


def calculate_rsi(close, period=14):
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.iloc[-1]


def calculate_macd(close, fast=12, slow=26, signal=9):
    ema_fast = close.ewm(span=fast, adjust=False).mean()
    ema_slow = close.ewm(span=slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    macd_signal = macd.ewm(span=signal, adjust=False).mean()
    macd_histogram = macd - macd_signal
    return macd.iloc[-1], macd_signal.iloc[-1], macd_histogram.iloc[-1]


def calculate_stochastic_rsi(close, period=14):
    rsi = calculate_rsi_series(close, period)
    stoch_rsi = (rsi - rsi.rolling(period).min()) / (rsi.rolling(period).max() - rsi.rolling(period).min())
    stoch_rsi = stoch_rsi * 100
    return stoch_rsi.iloc[-1] if not np.isnan(stoch_rsi.iloc[-1]) else 50.0


def calculate_rsi_series(close, period=14):
    delta = close.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def calculate_adx(high, low, close, period=14):
    plus_dm = high.diff()
    minus_dm = -low.diff()

    plus_dm = plus_dm.where((plus_dm > minus_dm) & (plus_dm > 0), 0.0)
    minus_dm = minus_dm.where((minus_dm > plus_dm) & (minus_dm > 0), 0.0)

    tr1 = high - low
    tr2 = abs(high - close.shift(1))
    tr3 = abs(low - close.shift(1))
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

    atr = tr.rolling(window=period).mean()
    plus_di = 100 * (plus_dm.rolling(window=period).mean() / atr)
    minus_di = 100 * (minus_dm.rolling(window=period).mean() / atr)

    dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
    adx = dx.rolling(window=period).mean()

    return adx.iloc[-1] if not np.isnan(adx.iloc[-1]) else 25.0


def calculate_obv(close, volume):
    obv = [0]
    for i in range(1, len(close)):
        if close.iloc[i] > close.iloc[i-1]:
            obv.append(obv[-1] + volume.iloc[i])
        elif close.iloc[i] < close.iloc[i-1]:
            obv.append(obv[-1] - volume.iloc[i])
        else:
            obv.append(obv[-1])
    return pd.Series(obv, index=close.index)


def find_support_levels(low_prices, num_levels=3):
    lows = low_prices.values
    supports = []
    for i in range(2, len(lows) - 2):
        if lows[i] <= lows[i-1] and lows[i] <= lows[i-2] and lows[i] <= lows[i+1] and lows[i] <= lows[i+2]:
            supports.append(lows[i])
    supports = sorted(set([round(s, 2) for s in supports]), reverse=True)
    return supports[:num_levels]


def find_resistance_levels(high_prices, num_levels=3):
    highs = high_prices.values
    resistances = []
    for i in range(2, len(highs) - 2):
        if highs[i] >= highs[i-1] and highs[i] >= highs[i-2] and highs[i] >= highs[i+1] and highs[i] >= highs[i+2]:
            resistances.append(highs[i])
    resistances = sorted(set([round(r, 2) for r in resistances]))
    return resistances[:num_levels]
