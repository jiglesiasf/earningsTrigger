import os
from datetime import datetime, timedelta

FINNHUB_API_KEY = os.environ.get("FINNHUB_API_KEY", "")
FMP_API_KEY = os.environ.get("FMP_API_KEY", "")

EARNINGS_WINDOW_DAYS = 14
EARNINGS_MIN_DAYS = 1
MIN_AVG_VOLUME = 2_000_000
MIN_MARKET_CAP = 2_000_000_000

SCORING_WEIGHTS = {
    "technical": 0.30,
    "fundamental": 0.20,
    "options": 0.20,
    "historical": 0.15,
    "sentiment": 0.10,
    "macro": 0.05,
}

DECISION_THRESHOLDS = {
    "strong_buy": 90,
    "buy": 80,
    "watch": 70,
}

UNIVERSE_INDICES = ["^GSPC", "^IXIC"]

DATA_OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")


def get_today():
    return datetime.now().strftime("%Y-%m-%d")


def get_earnings_window():
    today = datetime.now()
    start = today
    end = today + timedelta(days=EARNINGS_WINDOW_DAYS)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")
