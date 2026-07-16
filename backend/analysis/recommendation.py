import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import DECISION_THRESHOLDS


def get_decision(overall_score, market_regime, days_until_earnings):
    if days_until_earnings > 14:
        return "WAIT", "More than 14 days until earnings"

    if market_regime and market_regime.get("market_regime") == "risk_off":
        if overall_score >= DECISION_THRESHOLDS["strong_buy"]:
            return "WATCH", "Market in risk-off mode, high score but cautious"
        return "WAIT", "Market in risk-off mode"

    if market_regime and market_regime.get("vix", 20) > 30:
        if overall_score >= DECISION_THRESHOLDS["strong_buy"]:
            return "WATCH", "High VIX, elevated volatility"
        return "WAIT", "VIX above 30"

    if overall_score >= DECISION_THRESHOLDS["strong_buy"]:
        return "STRONG BUY", "High conviction setup across all factors"
    elif overall_score >= DECISION_THRESHOLDS["buy"]:
        return "BUY", "Good setup with positive scoring across categories"
    elif overall_score >= DECISION_THRESHOLDS["watch"]:
        return "WATCH", "Moderate setup, monitor for improvement"
    else:
        return "AVOID", "Below threshold - insufficient conviction"


def get_decision_rationale(scores, decision, trade_params, technical_data, historical_data):
    reasons = []

    if scores.get("technical", 0) > 75:
        reasons.append("strong technical uptrend")
    if scores.get("fundamental", 0) > 75:
        reasons.append("solid fundamentals")
    if scores.get("options", 0) > 75:
        reasons.append("positive options flow")
    if scores.get("historical", 0) > 75:
        reasons.append("favorable historical earnings pattern")
    if scores.get("sentiment", 0) > 75:
        reasons.append("positive analyst/news sentiment")

    if not reasons:
        reasons = ["mixed signals across analysis categories"]

    risk_reward = trade_params.get("risk_reward", 0)
    if risk_reward >= 2:
        reasons.append(f"favorable risk/reward ratio of {risk_reward}:1")

    return ", ".join(reasons[:4])
