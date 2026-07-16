#!/usr/bin/env python3
"""
Deep Historical Earnings Analysis for a Stock.
Analyzes last N earnings calls: pre-state, results, post-price action.
"""

import json
import sys
import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta


def get_earnings_dates_with_results(ticker_symbol):
    """Get earnings dates with EPS estimate, actual, and surprise from yfinance."""
    ticker = yf.Ticker(ticker_symbol)
    ed = ticker.earnings_dates
    if ed is None or ed.empty:
        return []
    
    results = []
    for date, row in ed.iterrows():
        if pd.isna(row.get("Reported EPS")):
            continue  # skip future/missing
        results.append({
            "date": date.strftime("%Y-%m-%d"),
            "date_obj": date,
            "eps_estimate": row.get("EPS Estimate"),
            "eps_actual": row.get("Reported EPS"),
            "surprise_pct": row.get("Surprise(%)"),
        })
    
    return sorted(results, key=lambda x: x["date_obj"])


def get_full_price_history(ticker_symbol):
    """Get full price history since IPO."""
    ticker = yf.Ticker(ticker_symbol)
    hist = ticker.history(period="max")
    return hist


def calculate_rsi(prices, period=14):
    """Calculate RSI for a price series."""
    delta = prices.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = (-delta).where(delta < 0, 0.0)
    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def get_pre_earnings_state(hist, earnings_date, lookback_days=60):
    """Get the technical state before an earnings date."""
    # Find the trading day on or before earnings date
    mask = hist.index <= earnings_date
    pre_data = hist[mask]
    if len(pre_data) < 20:
        return None
    
    # Use the last trading day before earnings
    last_day = pre_data.iloc[-1]
    pre_prices = pre_data["Close"]
    
    # Current price metrics
    current_price = last_day["Close"]
    current_volume = last_day["Volume"]
    
    # 20-day average volume
    avg_vol_20 = pre_data["Volume"].tail(20).mean()
    relative_volume = current_volume / avg_vol_20 if avg_vol_20 > 0 else 1.0
    
    # RSI
    rsi_series = calculate_rsi(pre_prices)
    rsi = rsi_series.iloc[-1] if not pd.isna(rsi_series.iloc[-1]) else 50.0
    
    # Moving averages
    sma_20 = pre_prices.tail(20).mean()
    sma_50 = pre_prices.tail(50).mean() if len(pre_prices) >= 50 else sma_20
    sma_200 = pre_prices.tail(200).mean() if len(pre_prices) >= 200 else sma_50
    
    # Trend
    above_sma20 = current_price > sma_20
    above_sma50 = current_price > sma_50
    above_sma200 = current_price > sma_200 if len(pre_prices) >= 200 else None
    
    # Golden/Death cross
    if len(pre_prices) >= 200:
        sma_20_50d_ago = pre_prices.iloc[-70:-50].mean() if len(pre_prices) >= 70 else None
        sma_50_50d_ago = pre_prices.iloc[-100:-50].mean() if len(pre_prices) >= 100 else None
    
    # 52-week high/low
    year_data = pre_data.tail(252) if len(pre_data) >= 252 else pre_data
    high_52w = year_data["High"].max()
    low_52w = year_data["Low"].min()
    pct_from_52w_high = (current_price - high_52w) / high_52w * 100
    pct_from_52w_low = (current_price - low_52w) / low_52w * 100
    
    # Recent momentum (last 20 days return)
    if len(pre_prices) >= 20:
        momentum_20d = (current_price - pre_prices.iloc[-20]) / pre_prices.iloc[-20] * 100
    else:
        momentum_20d = 0
    
    # Recent momentum (last 5 days)
    if len(pre_prices) >= 5:
        momentum_5d = (current_price - pre_prices.iloc[-5]) / pre_prices.iloc[-5] * 100
    else:
        momentum_5d = 0
    
    # ATR (14-day)
    if len(pre_data) >= 14:
        high_low = pre_data["High"].tail(14) - pre_data["Low"].tail(14)
        high_close = (pre_data["High"].tail(14) - pre_data["Close"].shift(1).tail(14)).abs()
        low_close = (pre_data["Low"].tail(14) - pre_data["Close"].shift(1).tail(14)).abs()
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.mean()
        atr_pct = (atr / current_price) * 100
    else:
        atr_pct = 3.0
    
    return {
        "price": round(current_price, 2),
        "rsi_14": round(rsi, 1),
        "sma_20": round(sma_20, 2),
        "sma_50": round(sma_50, 2),
        "sma_200": round(sma_200, 2) if len(pre_prices) >= 200 else None,
        "above_sma20": above_sma20,
        "above_sma50": above_sma50,
        "above_sma200": above_sma200,
        "relative_volume": round(relative_volume, 2),
        "pct_from_52w_high": round(pct_from_52w_high, 1),
        "pct_from_52w_low": round(pct_from_52w_low, 1),
        "momentum_5d_pct": round(momentum_5d, 2),
        "momentum_20d_pct": round(momentum_20d, 2),
        "atr_pct": round(atr_pct, 2),
        "volume": int(current_volume),
        "avg_volume_20d": int(avg_vol_20),
    }


def get_post_earnings_moves(hist, earnings_date, forward_days=10):
    """Get price moves after earnings: 1d, 2d, 5d, 10d."""
    # Find the first trading day on or after earnings date
    mask = hist.index >= earnings_date
    post_data = hist[mask]
    
    if len(post_data) < 2:
        # Try next day
        next_day = earnings_date + timedelta(days=1)
        mask = hist.index >= next_day
        post_data = hist[mask]
    
    if len(post_data) < 2:
        return None
    
    # Pre-earnings close (day before or on earnings)
    pre_mask = hist.index <= earnings_date
    pre_data = hist[pre_mask]
    if len(pre_data) < 1:
        return None
    pre_close = pre_data.iloc[-1]["Close"]
    
    # Earnings day open (if available, for gap analysis)
    earnings_day = post_data.iloc[0]
    earnings_day_open = earnings_day["Open"]
    gap_pct = (earnings_day_open - pre_close) / pre_close * 100
    
    # Earnings day close
    earnings_day_close = earnings_day["Close"]
    day_return_pct = (earnings_day_close - pre_close) / pre_close * 100
    
    # Forward returns
    moves = {
        "gap_pct": round(gap_pct, 2),
        "day_return_pct": round(day_return_pct, 2),
        "pre_close": round(pre_close, 2),
        "earnings_open": round(earnings_day_open, 2),
        "earnings_close": round(earnings_day_close, 2),
    }
    
    for days in [2, 3, 5, 10]:
        if len(post_data) > days:
            future_close = post_data.iloc[min(days, len(post_data)-1)]["Close"]
            moves[f"{days}d_return_pct"] = round((future_close - pre_close) / pre_close * 100, 2)
        else:
            moves[f"{days}d_return_pct"] = None
    
    return moves


def analyze_earnings(ticker_symbol, num_quarters=None):
    """Run full historical earnings analysis."""
    print(f"\n{'='*70}")
    print(f"  HISTORICAL EARNINGS ANALYSIS: {ticker_symbol}")
    print(f"{'='*70}")
    
    # Step 1: Get earnings dates
    print(f"\n[1/4] Fetching earnings dates...")
    earnings = get_earnings_dates_with_results(ticker_symbol)
    if num_quarters:
        earnings = earnings[-num_quarters:]
    print(f"  Found {len(earnings)} earnings dates with EPS data")
    
    # Step 2: Get price history
    print(f"\n[2/4] Fetching full price history...")
    hist = get_full_price_history(ticker_symbol)
    print(f"  Price history: {hist.index[0].date()} to {hist.index[-1].date()} ({len(hist)} days)")
    
    # Step 3: Analyze each earnings
    print(f"\n[3/4] Analyzing each earnings call...")
    results = []
    for i, earning in enumerate(earnings):
        earn_date = earning["date_obj"]
        
        pre_state = get_pre_earnings_state(hist, earn_date)
        post_moves = get_post_earnings_moves(hist, earn_date)
        
        if pre_state and post_moves:
            result = {
                "quarter": i + 1,
                "date": earning["date"],
                "eps_estimate": earning["eps_estimate"],
                "eps_actual": earning["eps_actual"],
                "surprise_pct": earning["surprise_pct"],
                "beat": earning["eps_actual"] > earning["eps_estimate"] if earning["eps_estimate"] else None,
                "pre_state": pre_state,
                "post_moves": post_moves,
            }
            results.append(result)
            beat_str = "BEAT" if result["beat"] else "MISS"
            print(f"  Q{result['quarter']:2d} {result['date']} | EPS ${result['eps_actual']:.2f} vs Est ${result['eps_estimate']:.2f} ({beat_str} {result['surprise_pct']:+.1f}%) | Day: {post_moves['day_return_pct']:+.1f}%")
    
    # Step 4: Comprehensive analysis
    print(f"\n[4/4] Computing patterns and statistics...")
    
    if not results:
        print("  No results to analyze!")
        return None
    
    analysis = compute_patterns(results)
    analysis["ticker"] = ticker_symbol
    analysis["total_quarters"] = len(results)
    analysis["date_range"] = f"{results[0]['date']} to {results[-1]['date']}"
    analysis["quarters_detail"] = results
    
    return analysis


def compute_patterns(results):
    """Compute comprehensive patterns from earnings results."""
    analysis = {}
    
    # === OVERALL STATS ===
    surprises = [r["surprise_pct"] for r in results if r["surprise_pct"] is not None]
    day_returns = [r["post_moves"]["day_return_pct"] for r in results]
    gap_pcts = [r["post_moves"]["gap_pct"] for r in results]
    
    analysis["overall"] = {
        "avg_surprise_pct": round(np.mean(surprises), 2),
        "median_surprise_pct": round(np.median(surprises), 2),
        "beat_rate_pct": round(sum(1 for r in results if r["beat"]) / len(results) * 100, 1),
        "avg_day_return_pct": round(np.mean(day_returns), 2),
        "median_day_return_pct": round(np.median(day_returns), 2),
        "avg_abs_day_return_pct": round(np.mean([abs(d) for d in day_returns]), 2),
        "avg_gap_pct": round(np.mean(gap_pcts), 2),
        "positive_day_rate_pct": round(sum(1 for d in day_returns if d > 0) / len(day_returns) * 100, 1),
        "best_day_pct": round(max(day_returns), 2),
        "worst_day_pct": round(min(day_returns), 2),
        "total_quarters": len(results),
    }
    
    # === BEAT vs MISS analysis ===
    beats = [r for r in results if r["beat"]]
    misses = [r for r in results if not r["beat"]]
    
    analysis["beat_analysis"] = {
        "beat_count": len(beats),
        "miss_count": len(misses),
        "avg_day_return_when_beat": round(np.mean([r["post_moves"]["day_return_pct"] for r in beats]), 2) if beats else None,
        "avg_day_return_when_miss": round(np.mean([r["post_moves"]["day_return_pct"] for r in misses]), 2) if misses else None,
        "beat_positive_rate": round(sum(1 for r in beats if r["post_moves"]["day_return_pct"] > 0) / len(beats) * 100, 1) if beats else None,
        "miss_positive_rate": round(sum(1 for r in misses if r["post_moves"]["day_return_pct"] > 0) / len(misses) * 100, 1) if misses else None,
    }
    
    # === SURPRISE MAGNITUDE analysis ===
    large_beat = [r for r in results if r["surprise_pct"] and r["surprise_pct"] > 10]
    small_beat = [r for r in results if r["surprise_pct"] and 0 < r["surprise_pct"] <= 10]
    small_miss = [r for r in results if r["surprise_pct"] and -10 <= r["surprise_pct"] < 0]
    large_miss = [r for r in results if r["surprise_pct"] and r["surprise_pct"] < -10]
    
    analysis["surprise_magnitude"] = {
        "large_beat_gt10": {
            "count": len(large_beat),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in large_beat]), 2) if large_beat else None,
        },
        "small_beat_0_10": {
            "count": len(small_beat),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in small_beat]), 2) if small_beat else None,
        },
        "small_miss_neg10_0": {
            "count": len(small_miss),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in small_miss]), 2) if small_miss else None,
        },
        "large_miss_lt_neg10": {
            "count": len(large_miss),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in large_miss]), 2) if large_miss else None,
        },
    }
    
    # === RSI analysis ===
    rsi_overbought = [r for r in results if r["pre_state"]["rsi_14"] > 70]
    rsi_neutral = [r for r in results if 30 <= r["pre_state"]["rsi_14"] <= 70]
    rsi_oversold = [r for r in results if r["pre_state"]["rsi_14"] < 30]
    
    analysis["rsi_analysis"] = {
        "overbought_gt70": {
            "count": len(rsi_overbought),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in rsi_overbought]), 2) if rsi_overbought else None,
            "positive_rate": round(sum(1 for r in rsi_overbought if r["post_moves"]["day_return_pct"] > 0) / len(rsi_overbought) * 100, 1) if rsi_overbought else None,
        },
        "neutral_30_70": {
            "count": len(rsi_neutral),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in rsi_neutral]), 2) if rsi_neutral else None,
            "positive_rate": round(sum(1 for r in rsi_neutral if r["post_moves"]["day_return_pct"] > 0) / len(rsi_neutral) * 100, 1) if rsi_neutral else None,
        },
        "oversold_lt30": {
            "count": len(rsi_oversold),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in rsi_oversold]), 2) if rsi_oversold else None,
            "positive_rate": round(sum(1 for r in rsi_oversold if r["post_moves"]["day_return_pct"] > 0) / len(rsi_oversold) * 100, 1) if rsi_oversold else None,
        },
    }
    
    # === TREND analysis ===
    uptrend = [r for r in results if r["pre_state"]["above_sma20"] and r["pre_state"]["above_sma50"]]
    downtrend = [r for r in results if not r["pre_state"]["above_sma20"] and not r["pre_state"]["above_sma50"]]
    mixed = [r for r in results if r not in uptrend and r not in downtrend]
    
    analysis["trend_analysis"] = {
        "uptrend_both_above": {
            "count": len(uptrend),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in uptrend]), 2) if uptrend else None,
            "positive_rate": round(sum(1 for r in uptrend if r["post_moves"]["day_return_pct"] > 0) / len(uptrend) * 100, 1) if uptrend else None,
        },
        "downtrend_both_below": {
            "count": len(downtrend),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in downtrend]), 2) if downtrend else None,
            "positive_rate": round(sum(1 for r in downtrend if r["post_moves"]["day_return_pct"] > 0) / len(downtrend) * 100, 1) if downtrend else None,
        },
        "mixed_trend": {
            "count": len(mixed),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in mixed]), 2) if mixed else None,
            "positive_rate": round(sum(1 for r in mixed if r["post_moves"]["day_return_pct"] > 0) / len(mixed) * 100, 1) if mixed else None,
        },
    }
    
    # === MOMENTUM analysis ===
    strong_momentum = [r for r in results if r["pre_state"]["momentum_20d_pct"] > 10]
    weak_momentum = [r for r in results if r["pre_state"]["momentum_20d_pct"] < -10]
    neutral_momentum = [r for r in results if -10 <= r["pre_state"]["momentum_20d_pct"] <= 10]
    
    analysis["momentum_analysis"] = {
        "strong_up_gt10pct": {
            "count": len(strong_momentum),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in strong_momentum]), 2) if strong_momentum else None,
        },
        "neutral_-10_to_10": {
            "count": len(neutral_momentum),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in neutral_momentum]), 2) if neutral_momentum else None,
        },
        "strong_down_lt_neg10pct": {
            "count": len(weak_momentum),
            "avg_day_return": round(np.mean([r["post_moves"]["day_return_pct"] for r in weak_momentum]), 2) if weak_momentum else None,
        },
    }
    
    # === GAP analysis ===
    gap_up = [r for r in results if r["post_moves"]["gap_pct"] > 0]
    gap_down = [r for r in results if r["post_moves"]["gap_pct"] < 0]
    
    analysis["gap_analysis"] = {
        "avg_gap_pct": round(np.mean(gap_pcts), 2),
        "gap_up_count": len(gap_up),
        "gap_down_count": len(gap_down),
        "avg_gap_when_beat": round(np.mean([r["post_moves"]["gap_pct"] for r in beats]), 2) if beats else None,
        "avg_gap_when_miss": round(np.mean([r["post_moves"]["gap_pct"] for r in misses]), 2) if misses else None,
    }
    
    # === FORWARD DRIFT analysis (post-earnings drift) ===
    for days in [2, 5, 10]:
        key = f"{days}d_return_pct"
        vals = [r["post_moves"][key] for r in results if r["post_moves"].get(key) is not None]
        beat_vals = [r["post_moves"][key] for r in beats if r["post_moves"].get(key) is not None]
        miss_vals = [r["post_moves"][key] for r in misses if r["post_moves"].get(key) is not None]
        
        analysis[f"drift_{days}d"] = {
            "avg_return_all": round(np.mean(vals), 2) if vals else None,
            "avg_return_beat": round(np.mean(beat_vals), 2) if beat_vals else None,
            "avg_return_miss": round(np.mean(miss_vals), 2) if miss_vals else None,
            "positive_rate_all": round(sum(1 for v in vals if v > 0) / len(vals) * 100, 1) if vals else None,
        }
    
    # === BEST AND WORST QUARTERS ===
    sorted_by_return = sorted(results, key=lambda x: x["post_moves"]["day_return_pct"], reverse=True)
    analysis["best_quarters"] = [
        {
            "date": r["date"],
            "surprise_pct": r["surprise_pct"],
            "day_return_pct": r["post_moves"]["day_return_pct"],
            "rsi": r["pre_state"]["rsi_14"],
            "trend": f"{'↑' if r['pre_state']['above_sma20'] else '↓'}SMA20 {'↑' if r['pre_state']['above_sma50'] else '↓'}SMA50",
            "momentum_20d": r["pre_state"]["momentum_20d_pct"],
        }
        for r in sorted_by_return[:5]
    ]
    analysis["worst_quarters"] = [
        {
            "date": r["date"],
            "surprise_pct": r["surprise_pct"],
            "day_return_pct": r["post_moves"]["day_return_pct"],
            "rsi": r["pre_state"]["rsi_14"],
            "trend": f"{'↑' if r['pre_state']['above_sma20'] else '↓'}SMA20 {'↑' if r['pre_state']['above_sma50'] else '↓'}SMA50",
            "momentum_20d": r["pre_state"]["momentum_20d_pct"],
        }
        for r in sorted_by_return[-5:]
    ]
    
    # === KEY INSIGHTS ===
    insights = []
    
    if analysis["overall"]["beat_rate_pct"] > 80:
        insights.append(f"Very high beat rate ({analysis['overall']['beat_rate_pct']}%) - consistently beats estimates")
    
    if analysis["beat_analysis"]["avg_day_return_when_beat"] and analysis["beat_analysis"]["avg_day_return_when_beat"] > 2:
        insights.append(f"Beats lead to strong positive reactions (avg +{analysis['beat_analysis']['avg_day_return_when_beat']}%)")
    elif analysis["beat_analysis"]["avg_day_return_when_beat"] and analysis["beat_analysis"]["avg_day_return_when_beat"] < 0:
        insights.append(f"Beats often sell off (avg {analysis['beat_analysis']['avg_day_return_when_beat']}%) - 'sell the news' pattern")
    
    if analysis["rsi_analysis"]["overbought_gt70"]["count"] > 0:
        ob_ret = analysis["rsi_analysis"]["overbought_gt70"]["avg_day_return"]
        if ob_ret and ob_ret < 0:
            insights.append(f"Overbought RSI (>70) before earnings leads to avg {ob_ret}% - risky to hold")
    
    if analysis["trend_analysis"]["uptrend_both_above"]["count"] > 0:
        ut_ret = analysis["trend_analysis"]["uptrend_both_above"]["avg_day_return"]
        if ut_ret and ut_ret > 0:
            insights.append(f"Uptrend (above both SMAs) has positive avg return ({ut_ret}%)")
    
    if analysis["drift_5d"]["avg_return_all"]:
        drift = analysis["drift_5d"]["avg_return_all"]
        if abs(drift) > 2:
            direction = "up" if drift > 0 else "down"
            insights.append(f"Strong 5-day post-earnings drift: avg {drift:+.1f}% ({direction})")
    
    analysis["key_insights"] = insights
    
    return analysis


def print_report(analysis):
    """Print a formatted report."""
    if not analysis:
        return
    
    t = analysis["ticker"]
    o = analysis["overall"]
    
    print(f"\n{'='*70}")
    print(f"  {t} EARNINGS ANALYSIS REPORT")
    print(f"  {analysis['date_range']} | {analysis['total_quarters']} quarters analyzed")
    print(f"{'='*70}")
    
    print(f"\n{'─'*70}")
    print(f"  OVERALL STATISTICS")
    print(f"{'─'*70}")
    print(f"  Beat Rate:              {o['beat_rate_pct']}%")
    print(f"  Avg Surprise:           {o['avg_surprise_pct']:+.2f}%")
    print(f"  Avg Day Return:         {o['avg_day_return_pct']:+.2f}%")
    print(f"  Avg Absolute Move:      {o['avg_abs_day_return_pct']:.2f}%")
    print(f"  Positive Day Rate:      {o['positive_day_rate_pct']}%")
    print(f"  Best Day:               {o['best_day_pct']:+.2f}%")
    print(f"  Worst Day:              {o['worst_day_pct']:+.2f}%")
    print(f"  Avg Gap:                {o['avg_gap_pct']:+.2f}%")
    
    b = analysis["beat_analysis"]
    print(f"\n{'─'*70}")
    print(f"  BEAT vs MISS")
    print(f"{'─'*70}")
    print(f"  Beats: {b['beat_count']} | Misses: {b['miss_count']}")
    if b["avg_day_return_when_beat"] is not None:
        print(f"  Avg Day Return (Beat):  {b['avg_day_return_when_beat']:+.2f}%")
        print(f"  Positive Rate (Beat):   {b['beat_positive_rate']}%")
    if b["avg_day_return_when_miss"] is not None:
        print(f"  Avg Day Return (Miss):  {b['avg_day_return_when_miss']:+.2f}%")
        print(f"  Positive Rate (Miss):   {b['miss_positive_rate']}%")
    
    print(f"\n{'─'*70}")
    print(f"  SURPRISE MAGNITUDE")
    print(f"{'─'*70}")
    sm = analysis["surprise_magnitude"]
    for label, data in sm.items():
        if data["count"] > 0:
            print(f"  {label:30s}: {data['count']:2d}q | Avg Day Return: {data['avg_day_return']:+.2f}%")
    
    print(f"\n{'─'*70}")
    print(f"  RSI PRE-EARNINGS")
    print(f"{'─'*70}")
    r = analysis["rsi_analysis"]
    for label, data in r.items():
        if data["count"] > 0:
            print(f"  {label:30s}: {data['count']:2d}q | Avg Day: {data['avg_day_return']:+.2f}% | Positive: {data['positive_rate']}%")
    
    print(f"\n{'─'*70}")
    print(f"  TREND PRE-EARNINGS")
    print(f"{'─'*70}")
    tr = analysis["trend_analysis"]
    for label, data in tr.items():
        if data["count"] > 0:
            print(f"  {label:30s}: {data['count']:2d}q | Avg Day: {data['avg_day_return']:+.2f}% | Positive: {data['positive_rate']}%")
    
    print(f"\n{'─'*70}")
    print(f"  POST-EARNINGS DRIFT")
    print(f"{'─'*70}")
    for days in [2, 5, 10]:
        d = analysis.get(f"drift_{days}d", {})
        if d.get("avg_return_all") is not None:
            print(f"  {days}-Day Drift: Avg {d['avg_return_all']:+.2f}% | Beat: {d.get('avg_return_beat', 'N/A')} | Miss: {d.get('avg_return_miss', 'N/A')} | Positive: {d.get('positive_rate_all', 'N/A')}%")
    
    print(f"\n{'─'*70}")
    print(f"  TOP 5 BEST EARNINGS DAYS")
    print(f"{'─'*70}")
    for q in analysis["best_quarters"]:
        print(f"  {q['date']} | Return: {q['day_return_pct']:+.2f}% | Surprise: {q['surprise_pct']:+.1f}% | RSI: {q['rsi']:.0f} | {q['trend']}")
    
    print(f"\n{'─'*70}")
    print(f"  TOP 5 WORST EARNINGS DAYS")
    print(f"{'─'*70}")
    for q in analysis["worst_quarters"]:
        print(f"  {q['date']} | Return: {q['day_return_pct']:+.2f}% | Surprise: {q['surprise_pct']:+.1f}% | RSI: {q['rsi']:.0f} | {q['trend']}")
    
    print(f"\n{'─'*70}")
    print(f"  KEY INSIGHTS")
    print(f"{'─'*70}")
    for insight in analysis.get("key_insights", []):
        print(f"  → {insight}")
    
    print(f"\n{'='*70}")


if __name__ == "__main__":
    ticker = sys.argv[1] if len(sys.argv) > 1 else "META"
    num = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    analysis = analyze_earnings(ticker, num)
    if analysis:
        print_report(analysis)
        
        # Save JSON
        output_path = f"public/data/historical_{ticker}.json"
        with open(output_path, "w") as f:
            json.dump(analysis, f, indent=2, default=str)
        print(f"\n  Full data saved to {output_path}")
