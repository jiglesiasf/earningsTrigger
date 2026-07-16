import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from utils.helpers import clamp


def calculate_fundamental_score(fundamentals):
    if not fundamentals:
        return 0

    score = 50

    revenue_growth = fundamentals.get("revenue_growth_yoy")
    if revenue_growth is not None:
        if revenue_growth > 20:
            score += 15
        elif revenue_growth > 10:
            score += 10
        elif revenue_growth > 5:
            score += 5
        elif revenue_growth < 0:
            score -= 10

    eps_growth = fundamentals.get("eps_growth_yoy")
    if eps_growth is not None:
        if eps_growth > 20:
            score += 12
        elif eps_growth > 10:
            score += 8
        elif eps_growth > 0:
            score += 3
        elif eps_growth < -10:
            score -= 10

    gross_margin = fundamentals.get("gross_margin")
    if gross_margin is not None:
        if gross_margin > 50:
            score += 5
        elif gross_margin > 30:
            score += 2
        elif gross_margin < 20:
            score -= 3

    operating_margin = fundamentals.get("operating_margin")
    if operating_margin is not None:
        if operating_margin > 25:
            score += 5
        elif operating_margin > 15:
            score += 2
        elif operating_margin < 0:
            score -= 8

    peg = fundamentals.get("peg_ratio")
    if peg is not None:
        if 0 < peg < 1:
            score += 8
        elif 1 <= peg < 2:
            score += 4
        elif peg > 3:
            score -= 5

    debt_equity = fundamentals.get("debt_to_equity")
    if debt_equity is not None:
        if debt_equity < 0.5:
            score += 5
        elif debt_equity < 1.0:
            score += 2
        elif debt_equity > 2.0:
            score -= 5

    current_ratio = fundamentals.get("current_ratio")
    if current_ratio is not None:
        if current_ratio > 1.5:
            score += 3
        elif current_ratio > 1.0:
            score += 1
        elif current_ratio < 0.8:
            score -= 5

    return clamp(score)
