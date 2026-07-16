import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utils.helpers import clamp


def calculate_historical_score(historical_data):
    if not historical_data:
        return 0

    score = 50

    avg_move = historical_data.get("avg_move_pct", 0)
    if avg_move > 8:
        score += 12
    elif avg_move > 5:
        score += 8
    elif avg_move > 3:
        score += 4

    avg_return = historical_data.get("avg_1d_return", 0)
    if avg_return > 2:
        score += 15
    elif avg_return > 0:
        score += 8
    elif avg_return < -2:
        score -= 10

    gap_up = historical_data.get("gap_up_pct", 50)
    if gap_up > 65:
        score += 10
    elif gap_up > 55:
        score += 5
    elif gap_up < 35:
        score -= 8

    max_upside = historical_data.get("largest_upside_pct", 0)
    max_downside = historical_data.get("largest_downside_pct", 0)
    if max_upside > 10:
        score += 5
    if max_downside < -10:
        score -= 3

    return clamp(score)
