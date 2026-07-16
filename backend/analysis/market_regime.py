import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def evaluate_market_regime(macro_data):
    if not macro_data:
        return {"regime": "unknown", "confidence": 0}

    sp500_trend = macro_data.get("sp500_trend", "neutral")
    nasdaq_trend = macro_data.get("nasdaq_trend", "neutral")
    vix = macro_data.get("vix", 20)
    regime = macro_data.get("market_regime", "neutral")

    bullish_signals = 0
    total_signals = 0

    if sp500_trend == "bullish":
        bullish_signals += 1
    total_signals += 1

    if nasdaq_trend == "bullish":
        bullish_signals += 1
    total_signals += 1

    if regime == "risk_on":
        bullish_signals += 1
    total_signals += 1

    if vix < 20:
        bullish_signals += 1
    total_signals += 1

    confidence = (bullish_signals / total_signals) * 100 if total_signals > 0 else 50

    if confidence >= 75:
        assessment = "favorable"
    elif confidence >= 50:
        assessment = "neutral"
    else:
        assessment = "unfavorable"

    return {
        "regime": assessment,
        "confidence": round(confidence, 1),
        "sp500_trend": sp500_trend,
        "nasdaq_trend": nasdaq_trend,
        "vix": vix,
        "market_regime": regime,
    }
