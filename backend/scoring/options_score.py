import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utils.helpers import clamp


def calculate_options_score(options_data):
    if not options_data:
        return 0

    score = 50

    put_call = options_data.get("put_call_ratio", 1.0)
    if put_call < 0.7:
        score += 15
    elif put_call < 0.9:
        score += 8
    elif put_call > 1.3:
        score -= 10
    elif put_call > 1.1:
        score -= 5

    expected_move_pct = options_data.get("expected_move_pct", 0)
    if 5 <= expected_move_pct <= 10:
        score += 10
    elif 3 <= expected_move_pct < 5:
        score += 5
    elif expected_move_pct > 15:
        score -= 5

    iv = options_data.get("implied_volatility", 0.5)
    if 0.3 <= iv <= 0.6:
        score += 8
    elif iv > 0.8:
        score -= 5
    elif iv < 0.2:
        score -= 3

    if options_data.get("unusual_activity"):
        score += 10

    skew = options_data.get("skew", "")
    if skew == "mild_call_skew":
        score += 5
    elif skew == "mild_put_skew":
        score -= 3

    return clamp(score)
