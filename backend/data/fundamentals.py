import yfinance as yf


def get_fundamentals(ticker):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        income = stock.income_stmt
        balance = stock.balance_sheet
        cashflow = stock.cashflow

        revenue_growth = None
        eps_growth = None
        if income is not None and not income.empty:
            if len(income.columns) >= 2:
                latest = income.iloc[:, 0]
                prev = income.iloc[:, 1]
                if "Total Revenue" in latest.index and "Total Revenue" in prev.index:
                    if prev["Total Revenue"] and prev["Total Revenue"] != 0:
                        revenue_growth = ((latest["Total Revenue"] - prev["Total Revenue"]) / abs(prev["Total Revenue"])) * 100
                if "Net Income" in latest.index and "Diluted EPS" in prev.index:
                    if prev.get("Diluted EPS") and prev["Diluted EPS"] != 0:
                        eps_growth = ((latest.get("Diluted EPS", 0) - prev["Diluted EPS"]) / abs(prev["Diluted EPS"])) * 100

        gross_margin = info.get("grossMargins", 0) * 100 if info.get("grossMargins") else None
        operating_margin = info.get("operatingMargins", 0) * 100 if info.get("operatingMargins") else None
        net_margin = info.get("profitMargins", 0) * 100 if info.get("profitMargins") else None

        debt_equity = info.get("debtToEquity")
        current_ratio = info.get("currentRatio")
        forward_pe = info.get("forwardPE")
        peg_ratio = info.get("pegRatio")
        ev_ebitda = info.get("enterpriseToEbitda")
        price_to_sales = info.get("priceToSalesTrailing12Months")
        roe = info.get("returnOnEquity", 0) * 100 if info.get("returnOnEquity") else None

        total_cash = info.get("totalCash")
        total_debt = info.get("totalDebt")

        return {
            "revenue_growth_yoy": round(revenue_growth, 2) if revenue_growth is not None else None,
            "eps_growth_yoy": round(eps_growth, 2) if eps_growth is not None else None,
            "gross_margin": round(gross_margin, 2) if gross_margin is not None else None,
            "operating_margin": round(operating_margin, 2) if operating_margin is not None else None,
            "net_margin": round(net_margin, 2) if net_margin is not None else None,
            "roe": round(roe, 2) if roe is not None else None,
            "debt_to_equity": round(debt_equity, 2) if debt_equity is not None else None,
            "current_ratio": round(current_ratio, 2) if current_ratio is not None else None,
            "cash": total_cash,
            "total_debt": total_debt,
            "net_cash": (total_cash - total_debt) if total_cash and total_debt else None,
            "forward_pe": round(forward_pe, 2) if forward_pe is not None else None,
            "peg_ratio": round(peg_ratio, 2) if peg_ratio is not None else None,
            "ev_ebitda": round(ev_ebitda, 2) if ev_ebitda is not None else None,
            "price_to_sales": round(price_to_sales, 2) if price_to_sales is not None else None,
        }
    except Exception:
        return {}
