import yfinance as yf
import pandas as pd
from datetime import datetime


def _fetch_intraday(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period="1d", interval="1m")
        if df.empty:
            # fallback off-hours
            df = ticker.history(period="5d", interval="5m")
        return df.reset_index()
    except Exception:
        return pd.DataFrame()


def summarize_symbol(symbol: str) -> dict:
    symbol = (symbol or '').upper().strip()
    if not symbol:
        return {"symbol": symbol, "error": "empty symbol"}

    df = _fetch_intraday(symbol)
    if df.empty:
        return {"symbol": symbol, "error": "no data"}

    # Standardize columns
    cols = {c.lower().replace(' ', '_'): c for c in df.columns}
    def get(col):
        return df[cols.get(col, col)] if cols.get(col, col) in df.columns else None

    close = get('close')
    high = get('high')
    low = get('low')
    volume = get('volume')

    price = float(close.iloc[-1]) if close is not None and len(close) else None
    prev_close = float(close.iloc[-2]) if close is not None and len(close) > 1 else None

    change = None
    change_pct = None
    if price is not None and prev_close not in (None, 0):
        change = float(price - prev_close)
        change_pct = float((change / prev_close) * 100)

    spark = close.tail(60).tolist() if close is not None else []

    # market time
    dt_col = 'Datetime' if 'Datetime' in df.columns else 'Date' if 'Date' in df.columns else None
    market_time = None
    if dt_col and len(df[dt_col]):
        try:
            market_time = df[dt_col].iloc[-1]
            if isinstance(market_time, pd.Timestamp):
                market_time = market_time.to_pydatetime().isoformat()
            else:
                market_time = str(market_time)
        except Exception:
            market_time = None

    out = {
        "symbol": symbol,
        "price": price,
        "prev_close": prev_close,
        "change": change,
        "change_percent": change_pct,
        "day_high": float(high.max()) if high is not None and len(high) else None,
        "day_low": float(low.min()) if low is not None and len(low) else None,
        "volume": float(volume.iloc[-1]) if volume is not None and len(volume) else None,
        "sparkline": spark,
        "market_time": market_time,
    }
    return out


def get_intraday_summary(symbols: list[str]) -> dict:
    if not symbols:
        return {"symbols": [], "data": [], "errors": []}
    unique = []
    seen = set()
    for s in symbols:
        s2 = (s or '').upper().strip()
        if s2 and s2 not in seen:
            seen.add(s2)
            unique.append(s2)

    data = []
    errors = []
    for s in unique[:25]:
        res = summarize_symbol(s)
        if res.get("error"):
            errors.append({"symbol": s, "error": res["error"]})
        data.append(res)

    return {"symbols": unique, "data": data, "errors": errors}
