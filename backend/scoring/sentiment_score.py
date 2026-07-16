import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utils.helpers import clamp


def calculate_sentiment_score(analyst_data, news_data, insider_data=None):
    score = 50

    if analyst_data:
        buy_ratings = analyst_data.get("buy_ratings", 0)
        hold_ratings = analyst_data.get("hold_ratings", 0)
        sell_ratings = analyst_data.get("sell_ratings", 0)
        total = buy_ratings + hold_ratings + sell_ratings

        if total > 0:
            buy_pct = buy_ratings / total
            if buy_pct > 0.7:
                score += 15
            elif buy_pct > 0.5:
                score += 8
            elif buy_pct < 0.3:
                score -= 8

        upgrades = analyst_data.get("recent_upgrades", [])
        downgrades = analyst_data.get("recent_downgrades", [])
        score += len(upgrades) * 3
        score -= len(downgrades) * 5

        target = analyst_data.get("avg_price_target")
        if target and target > 0:
            score += 5

    if news_data:
        sentiment = news_data.get("sentiment_score", 0.5)
        if sentiment > 0.7:
            score += 10
        elif sentiment > 0.6:
            score += 5
        elif sentiment < 0.3:
            score -= 10
        elif sentiment < 0.4:
            score -= 5

    if insider_data:
        buys = insider_data.get("recent_buys", 0)
        sells = insider_data.get("recent_sells", 0)
        score += buys * 5
        score -= sells * 3

    return clamp(score)
