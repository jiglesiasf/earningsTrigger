import yfinance as yf
from datetime import datetime, timedelta


def get_news_sentiment(ticker):
    try:
        stock = yf.Ticker(ticker)
        news = stock.news

        if not news:
            return {
                "sentiment_score": 0.5,
                "headline_count": 0,
                "key_themes": [],
                "major_events": [],
            }

        headlines = []
        for item in news[:20]:
            title = item.get("title", "")
            publisher = item.get("publisher", "")
            headlines.append({
                "title": title,
                "publisher": publisher,
            })

        bullish_keywords = ["beat", "surpass", "upgrade", "buy", "strong", "growth", "record", "profit", "surge", "rally"]
        bearish_keywords = ["miss", "downgrade", "sell", "decline", "loss", "drop", "fall", "lawsuit", "investigation", "warning"]

        bullish_count = 0
        bearish_count = 0
        for h in headlines:
            title_lower = h["title"].lower()
            for kw in bullish_keywords:
                if kw in title_lower:
                    bullish_count += 1
            for kw in bearish_keywords:
                if kw in title_lower:
                    bearish_count += 1

        total = bullish_count + bearish_count
        sentiment = bullish_count / total if total > 0 else 0.5

        return {
            "sentiment_score": round(sentiment, 2),
            "headline_count": len(headlines),
            "key_themes": [],
            "major_events": [],
            "bullish_signals": bullish_count,
            "bearish_signals": bearish_count,
        }
    except Exception:
        return {
            "sentiment_score": 0.5,
            "headline_count": 0,
            "key_themes": [],
            "major_events": [],
        }
