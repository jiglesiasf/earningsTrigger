import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utils.helpers import clamp


def calculate_technical_score(technical_data):
    if not technical_data:
        return 0

    score = 50
    trend = technical_data.get("trend", {})
    momentum = technical_data.get("momentum", {})
    volume = technical_data.get("volume", {})
    price_structure = technical_data.get("price_structure", {})

    if trend.get("price_above_20_ema"):
        score += 8
    if trend.get("price_above_50_sma"):
        score += 8
    if trend.get("price_above_200_sma"):
        score += 8
    if trend.get("golden_cross"):
        score += 10
    if trend.get("death_cross"):
        score -= 15

    rsi = momentum.get("rsi_14", 50)
    if 50 <= rsi <= 68:
        score += 12
    elif 40 <= rsi < 50:
        score += 5
    elif rsi > 70:
        score -= 5
    elif rsi < 30:
        score -= 10

    macd_hist = momentum.get("macd_histogram", 0)
    if macd_hist > 0:
        score += 8
    else:
        score -= 8

    adx = momentum.get("adx", 25)
    if adx > 25:
        score += 5
    if adx > 30:
        score += 3

    if volume.get("obv_trend") == "up":
        score += 5
    if volume.get("volume_trend") == "above_avg":
        score += 5

    dist_to_resistance = price_structure.get("distance_to_resistance_pct", 5)
    if dist_to_resistance > 3:
        score += 8
    elif dist_to_resistance > 1:
        score += 3
    else:
        score -= 5

    dist_to_support = price_structure.get("distance_to_support_pct", 5)
    if dist_to_support > 3:
        score += 3

    return clamp(score)
