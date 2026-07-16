import yfinance as yf


def get_analyst_sentiment(ticker):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        target_high = info.get("targetHighPrice")
        target_low = info.get("targetLowPrice")
        target_mean = info.get("targetMeanPrice")
        target_median = info.get("targetMedianPrice")
        recommendation = info.get("recommendationMean")
        recommendation_key = info.get("recommendationKey", "hold")

        buy_ratings = info.get("numberOfAnalystOpinions", 0)

        upgrades_downgrades = stock.upgrades_downgrades
        recent_upgrades = []
        recent_downgrades = []

        if upgrades_downgrades is not None and not upgrades_downgrades.empty:
            recent = upgrades_downgrades.head(10)
            for _, row in recent.iterrows():
                action = str(row.get("Action", "")).lower()
                firm = row.get("Firm", "Unknown")
                if "upgrade" in action or "initiated" in action:
                    recent_upgrades.append(firm)
                elif "downgrade" in action:
                    recent_downgrades.append(firm)

        buy_count = 0
        hold_count = 0
        sell_count = 0
        if recommendation:
            if recommendation <= 2.0:
                buy_count = buy_ratings
            elif recommendation <= 3.0:
                hold_count = buy_ratings
            else:
                sell_count = buy_ratings

        return {
            "buy_ratings": buy_count,
            "hold_ratings": hold_count,
            "sell_ratings": sell_count,
            "avg_price_target": round(target_mean, 2) if target_mean else None,
            "target_high": round(target_high, 2) if target_high else None,
            "target_low": round(target_low, 2) if target_low else None,
            "target_median": round(target_median, 2) if target_median else None,
            "consensus_trend": recommendation_key,
            "recent_upgrades": recent_upgrades[:5],
            "recent_downgrades": recent_downgrades[:5],
            "number_of_analysts": buy_ratings,
        }
    except Exception:
        return {}
