import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utils.helpers import clamp


def calculate_macro_score(market_regime):
    if not market_regime:
        return 50

    score = 50

    sp500_trend = market_regime.get("sp500_trend", "neutral")
    if sp500_trend == "bullish":
        score += 15
    elif sp500_trend == "bearish":
        score -= 15

    nasdaq_trend = market_regime.get("nasdaq_trend", "neutral")
    if nasdaq_trend == "bullish":
        score += 10
    elif nasdaq_trend == "bearish":
        score -= 10

    regime = market_regime.get("market_regime", "neutral")
    if regime == "risk_on":
        score += 10
    elif regime == "risk_off":
        score -= 10

    vix = market_regime.get("vix", 20)
    if vix < 15:
        score += 10
    elif vix < 20:
        score += 5
    elif vix > 30:
        score -= 10
    elif vix > 25:
        score -= 5

    breadth = market_regime.get("breadth", "neutral")
    if breadth == "healthy":
        score += 5
    elif breadth == "weak":
        score -= 5

    return clamp(score)
