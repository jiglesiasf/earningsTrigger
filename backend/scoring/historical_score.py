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


def calculate_deep_historical_score(deep_analysis):
    if not deep_analysis:
        return 50

    score = 50
    o = deep_analysis.get("overall", {})
    b = deep_analysis.get("beat_analysis", {})
    sm = deep_analysis.get("surprise_magnitude", {})
    rsi = deep_analysis.get("rsi_analysis", {})
    trend = deep_analysis.get("trend_analysis", {})
    drift5 = deep_analysis.get("drift_5d", {})
    drift2 = deep_analysis.get("drift_2d", {})

    beat_rate = o.get("beat_rate_pct", 50)
    if beat_rate >= 80:
        score += 15
    elif beat_rate >= 70:
        score += 10
    elif beat_rate >= 60:
        score += 5
    elif beat_rate < 40:
        score -= 10

    avg_surprise = o.get("avg_surprise_pct", 0)
    if avg_surprise > 10:
        score += 10
    elif avg_surprise > 5:
        score += 6
    elif avg_surprise > 0:
        score += 2
    elif avg_surprise < -5:
        score -= 8
    elif avg_surprise < 0:
        score -= 3

    avg_day = o.get("avg_day_return_pct", 0)
    if avg_day > 2:
        score += 8
    elif avg_day > 0:
        score += 4
    elif avg_day < -2:
        score -= 6
    elif avg_day < 0:
        score -= 2

    pos_rate = o.get("positive_day_rate_pct", 50)
    if pos_rate >= 65:
        score += 5
    elif pos_rate >= 55:
        score += 2
    elif pos_rate < 35:
        score -= 5

    beat_ret = b.get("avg_day_return_when_beat")
    miss_ret = b.get("avg_day_return_when_miss")
    if beat_ret is not None and beat_ret > 3:
        score += 5
    elif beat_ret is not None and beat_ret > 0:
        score += 2
    if miss_ret is not None and miss_ret < -5:
        score -= 5
    elif miss_ret is not None and miss_ret < 0:
        score -= 2

    beat_pos = b.get("beat_positive_rate")
    if beat_pos is not None and beat_pos >= 70:
        score += 5
    elif beat_pos is not None and beat_pos >= 55:
        score += 2

    drift_all = drift5.get("avg_return_all")
    if drift_all is not None:
        if drift_all > 3:
            score += 8
        elif drift_all > 1:
            score += 4
        elif drift_all > 0:
            score += 2
        elif drift_all < -3:
            score -= 6
        elif drift_all < 0:
            score -= 2

    drift_beat = drift5.get("avg_return_beat")
    if drift_beat is not None and drift_beat > 3:
        score += 4

    drift2_all = drift2.get("avg_return_all")
    if drift2_all is not None:
        if drift2_all > 2:
            score += 4
        elif drift2_all > 0:
            score += 2
        elif drift2_all < -2:
            score -= 4

    n_quarters = o.get("total_quarters", 0)
    if n_quarters < 8:
        score -= 5
    elif n_quarters >= 16:
        score += 3

    return clamp(score)


def merge_historical_scores(simple_score, deep_score, has_deep):
    if not has_deep:
        return simple_score
    return round(simple_score * 0.3 + deep_score * 0.7, 1)
