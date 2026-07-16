import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def calculate_trade_parameters(current_price, technical_data, options_data, historical_data):
    if not current_price or not technical_data:
        return {}

    price_structure = technical_data.get("price_structure", {})
    trend = technical_data.get("trend", {})
    volatility = technical_data.get("volatility", {})

    resistance_levels = price_structure.get("resistance", [])
    support_levels = price_structure.get("support", [])
    nearest_resistance = price_structure.get("nearest_resistance", current_price * 1.05)
    nearest_support = price_structure.get("nearest_support", current_price * 0.95)

    buy_above = current_price
    if resistance_levels:
        closest_above = min([r for r in resistance_levels if r > current_price], default=current_price * 1.03)
        if (closest_above - current_price) / current_price < 0.03:
            buy_above = closest_above
        else:
            buy_above = current_price

    atr = technical_data.get("trend", {}).get("ema_20", 0)
    atr_val = technical_data.get("volatility", {}).get("historical_volatility_20", 15) / 100 * current_price

    stop_loss = max(nearest_support, current_price - 2 * atr_val)

    expected_move_pct = options_data.get("expected_move_pct", 5) if options_data else 5
    take_profit = current_price * (1 + expected_move_pct / 100)

    risk = buy_above - stop_loss
    reward = take_profit - buy_above
    risk_reward = round(reward / risk, 2) if risk > 0 else 0

    expected_return_pct = round(((take_profit - buy_above) / buy_above) * 100, 2)
    max_drawdown_pct = round(((stop_loss - buy_above) / buy_above) * 100, 2)

    return {
        "buy_above": round(buy_above, 2),
        "stop_loss": round(stop_loss, 2),
        "take_profit": round(take_profit, 2),
        "expected_move": f"±{expected_move_pct}%",
        "expected_move_dollars": f"±${round(current_price * expected_move_pct / 100, 2)}",
        "risk_reward": risk_reward,
        "support_levels": [round(s, 2) for s in support_levels[:3]],
        "resistance_levels": [round(r, 2) for r in resistance_levels[:3]],
        "expected_return_pct": expected_return_pct,
        "max_drawdown_pct": max_drawdown_pct,
    }
