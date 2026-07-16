import yfinance as yf
import pandas as pd
import numpy as np


def get_historical_earnings(ticker, num_periods=8):
    try:
        stock = yf.Ticker(ticker)
        earnings_dates = stock.earnings_dates

        if earnings_dates is None or earnings_dates.empty:
            return {}

        hist = stock.history(period="2y")
        if hist.empty:
            return {}

        moves = []
        for date in earnings_dates.index:
            date_str = date.strftime("%Y-%m-%d")
            matching = hist.index[hist.index.get_indexer([date], method="nearest")]
            if len(matching) == 0:
                continue

            idx = hist.index.get_loc(matching[0])
            if idx + 1 >= len(hist):
                continue

            pre_close = hist["Close"].iloc[idx]
            post_open = hist["Open"].iloc[idx + 1]
            post_close = hist["Close"].iloc[idx + 1]

            gap = ((post_open - pre_close) / pre_close) * 100
            day_return = ((post_close - pre_close) / pre_close) * 100

            moves.append({
                "date": date_str,
                "gap_pct": round(gap, 2),
                "day_return_pct": round(day_return, 2),
                "pre_close": round(pre_close, 2),
                "post_open": round(post_open, 2),
                "post_close": round(post_close, 2),
            })

        if not moves:
            return {}

        recent_moves = moves[:num_periods]

        avg_move = np.mean([abs(m["day_return_pct"]) for m in recent_moves])
        median_move = np.median([abs(m["day_return_pct"]) for m in recent_moves])
        max_upside = max([m["day_return_pct"] for m in recent_moves])
        max_downside = min([m["day_return_pct"] for m in recent_moves])
        avg_1d_return = np.mean([m["day_return_pct"] for m in recent_moves])
        gap_up_pct = len([m for m in recent_moves if m["gap_pct"] > 0]) / len(recent_moves) * 100
        gap_down_pct = 100 - gap_up_pct

        return {
            "avg_move_pct": round(avg_move, 2),
            "median_move_pct": round(median_move, 2),
            "largest_upside_pct": round(max_upside, 2),
            "largest_downside_pct": round(max_downside, 2),
            "avg_1d_return": round(avg_1d_return, 2),
            "gap_up_pct": round(gap_up_pct, 1),
            "gap_down_pct": round(gap_down_pct, 1),
            "recent_moves": recent_moves[:5],
            "num_periods_analyzed": len(recent_moves),
        }
    except Exception:
        return {}
