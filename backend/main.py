import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime
from config import DATA_OUTPUT_DIR, MIN_AVG_VOLUME, EARNINGS_WINDOW_DAYS
from utils.helpers import save_json, ensure_dir
from utils.universe import get_large_cap_universe, filter_by_volume
from data.earnings_calendar import get_earnings_calendar
from data.market_data import get_market_data, get_spy_data, get_qqq_data
from data.technical_analysis import calculate_technicals
from data.fundamentals import get_fundamentals
from data.options_analysis import get_options_data
from data.analyst_sentiment import get_analyst_sentiment
from data.historical_earnings import get_historical_earnings
from data.news_sentiment import get_news_sentiment
from data.macro_data import get_market_regime
from scoring.technical_score import calculate_technical_score
from scoring.fundamental_score import calculate_fundamental_score
from scoring.options_score import calculate_options_score
from scoring.sentiment_score import calculate_sentiment_score
from scoring.historical_score import calculate_historical_score, calculate_deep_historical_score, merge_historical_scores
from historical_analysis import analyze_earnings
from scoring.macro_score import calculate_macro_score
from scoring.overall_score import calculate_overall_score
from analysis.trade_parameters import calculate_trade_parameters
from analysis.recommendation import get_decision, get_decision_rationale
from analysis.market_regime import evaluate_market_regime


def analyze_stock(ticker, market_regime_data):
    print(f"  Analyzing {ticker}...")

    market_data = get_market_data(ticker)
    if not market_data:
        return None

    hist = market_data.get("hist")
    current_price = market_data.get("current_price")

    technicals = calculate_technicals(hist, current_price)
    fundamentals = get_fundamentals(ticker)
    options = get_options_data(ticker)
    analyst = get_analyst_sentiment(ticker)
    historical = get_historical_earnings(ticker)
    news = get_news_sentiment(ticker)

    deep_historical = None
    try:
        deep_historical = analyze_earnings(ticker, num_quarters=16)
        print(f"    Deep historical: {deep_historical.get('total_quarters', 0)} quarters, beat rate {deep_historical.get('overall', {}).get('beat_rate_pct', 0)}%")
    except Exception as e:
        print(f"    Deep historical failed for {ticker}: {e}")

    simple_hist_score = calculate_historical_score(historical)
    deep_hist_score = calculate_deep_historical_score(deep_historical)
    has_deep = deep_historical is not None and deep_historical.get("total_quarters", 0) >= 4
    final_hist_score = merge_historical_scores(simple_hist_score, deep_hist_score, has_deep)

    scores = {
        "technical": calculate_technical_score(technicals),
        "fundamental": calculate_fundamental_score(fundamentals),
        "options": calculate_options_score(options),
        "sentiment": calculate_sentiment_score(analyst, news),
        "historical": final_hist_score,
        "macro": calculate_macro_score(market_regime_data),
    }

    overall = calculate_overall_score(scores)
    scores["overall"] = overall

    trade_params = calculate_trade_parameters(current_price, technicals, options, historical)

    decision, _ = get_decision(
        overall,
        market_regime_data,
        market_data.get("days_until_earnings", 7)
    )

    rationale = get_decision_rationale(scores, decision, trade_params, technicals, historical)

    return {
        "ticker": ticker,
        "company": market_data.get("company_name", ticker),
        "sector": market_data.get("sector", "Unknown"),
        "price": {
            "current": current_price,
            "open": market_data.get("open"),
            "high": market_data.get("high"),
            "low": market_data.get("low"),
            "previous_close": market_data.get("previous_close"),
            "change_pct": market_data.get("change_pct"),
            "market_cap": market_data.get("market_cap"),
        },
        "trade_parameters": trade_params,
        "scores": scores,
        "historical_score_breakdown": {
            "simple": simple_hist_score,
            "deep": deep_hist_score,
            "merged": final_hist_score,
            "has_deep": has_deep,
        },
        "technical": technicals,
        "fundamentals": fundamentals,
        "options": options,
        "analyst": analyst,
        "historical_earnings": historical,
        "historical_analysis": deep_historical,
        "news": news,
        "market_regime": market_regime_data,
        "decision": decision,
        "decision_rationale": rationale,
    }


def run_analysis():
    print("=" * 60)
    print("EARNINGS TRIGGER ANALYSIS")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    print("\n[1/7] Fetching market regime...")
    market_regime = get_market_regime()
    macro_score_val = calculate_macro_score(market_regime)
    regime_eval = evaluate_market_regime(market_regime)
    market_regime["macro_score"] = macro_score_val
    market_regime["regime_assessment"] = regime_eval

    print(f"  S&P500: {market_regime.get('sp500_trend', 'N/A')}")
    print(f"  Nasdaq: {market_regime.get('nasdaq_trend', 'N/A')}")
    print(f"  VIX: {market_regime.get('vix', 'N/A')}")
    print(f"  Regime: {market_regime.get('market_regime', 'N/A')}")

    print("\n[2/7] Building universe...")
    universe = get_large_cap_universe()
    print(f"  Universe size: {len(universe)} stocks")

    print("\n[3/7] Filtering by volume...")
    liquid_stocks = filter_by_volume(universe[:200], MIN_AVG_VOLUME)
    print(f"  Liquid stocks: {len(liquid_stocks)}")

    print("\n[4/7] Finding upcoming earnings...")
    upcoming = get_earnings_calendar(liquid_stocks, EARNINGS_WINDOW_DAYS)
    print(f"  Stocks reporting in next {EARNINGS_WINDOW_DAYS} days: {len(upcoming)}")

    if not upcoming:
        print("\n  No upcoming earnings found in the universe.")
        output = create_output([], market_regime, [], [])
        save_output(output)
        return output

    print("\n[5/7] Analyzing each stock...")
    analyzed = []
    for item in upcoming[:50]:
        ticker = item["ticker"]
        try:
            result = analyze_stock(ticker, market_regime)
            if result:
                result["earnings_date"] = item["earnings_date"]
                result["days_until_earnings"] = item["days_until_earnings"]
                result["earnings_time"] = item.get("time", "unknown")
                analyzed.append(result)
                print(f"    {ticker}: Score={result['scores']['overall']}, Decision={result['decision']}")
        except Exception as e:
            print(f"    {ticker}: Error - {e}")
            continue

    print(f"\n[6/7] Ranking {len(analyzed)} stocks...")
    analyzed.sort(key=lambda x: x["scores"]["overall"], reverse=True)

    top_picks = [s for s in analyzed if s["decision"] in ["STRONG BUY", "BUY"]][:5]
    watchlist = [s for s in analyzed if s["decision"] == "WATCH"][:10]

    print("\n[7/7] Generating output...")
    output = create_output(top_picks, market_regime, watchlist, analyzed)
    save_output(output, analyzed)

    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    if top_picks:
        print(f"\nTop {len(top_picks)} Opportunities:")
        for i, pick in enumerate(top_picks, 1):
            print(f"  {i}. {pick['ticker']} - Score: {pick['scores']['overall']} - Decision: {pick['decision']}")
    else:
        print("\nNo trades today. Capital preservation is the best trade.")

    return output


def create_output(top_picks, market_regime, watchlist, all_analyzed):
    watchlist_changes = {"added": [], "removed": []}

    return {
        "run_date": datetime.now().strftime("%Y-%m-%d"),
        "run_time": datetime.now().strftime("%H:%M:%S UTC"),
        "market_summary": {
            "sp500_trend": market_regime.get("sp500_trend"),
            "sp500_price": market_regime.get("sp500_price"),
            "sp500_change_pct": market_regime.get("sp500_change_pct"),
            "nasdaq_trend": market_regime.get("nasdaq_trend"),
            "nasdaq_price": market_regime.get("nasdaq_price"),
            "nasdaq_change_pct": market_regime.get("nasdaq_change_pct"),
            "vix": market_regime.get("vix"),
            "vix_trend": market_regime.get("vix_trend"),
            "market_regime": market_regime.get("market_regime"),
            "risk_level": market_regime.get("risk_level"),
            "sector_leadership": market_regime.get("sector_leadership", []),
            "macro_events": market_regime.get("macro_events", []),
            "breadth": market_regime.get("breadth"),
        },
        "earnings_universe": [
            {
                "ticker": s.get("ticker"),
                "company": s.get("company"),
                "earnings_date": s.get("earnings_date"),
                "days_until_earnings": s.get("days_until_earnings"),
                "time": s.get("earnings_time"),
                "sector": s.get("sector"),
                "price": s.get("price", {}).get("current"),
                "scores": s.get("scores"),
                "decision": s.get("decision"),
            }
            for s in all_analyzed
        ],
        "top_picks": top_picks,
        "watchlist": watchlist[:10],
        "watchlist_changes": watchlist_changes,
    }


def save_output(output, all_analyzed):
    ensure_dir(DATA_OUTPUT_DIR)

    latest_path = os.path.join(DATA_OUTPUT_DIR, "latest.json")
    save_json(output, latest_path)

    date_path = os.path.join(DATA_OUTPUT_DIR, "history", f"{output['run_date']}.json")
    save_json(output, date_path)

    for stock in all_analyzed:
        ticker = stock["ticker"]
        ticker_path = os.path.join(DATA_OUTPUT_DIR, "stock", f"{ticker}.json")
        save_json(stock, ticker_path)

    print(f"\n  Output saved to {DATA_OUTPUT_DIR}")


if __name__ == "__main__":
    run_analysis()
