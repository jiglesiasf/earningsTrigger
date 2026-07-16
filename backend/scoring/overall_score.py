import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import SCORING_WEIGHTS


def calculate_overall_score(scores):
    overall = 0
    for category, weight in SCORING_WEIGHTS.items():
        score = scores.get(category, 0)
        overall += score * weight

    return round(overall, 1)
