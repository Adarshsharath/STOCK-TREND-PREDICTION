import os
import json
import time
import threading
from datetime import datetime

import pandas as pd

try:
    import websocket  # type: ignore
except Exception:  # pragma: no cover
    websocket = None

from .fetch_data import fetch_live_candles


class LivePriceStream:
    def __init__(self):
        self.ws = None
        self.thread = None
        self.running = False
        self.subscribed = set()
        self.latest = {}
        self.candles = {}
        self.lock = threading.Lock()
        self.mode = 'polling'  # Always use polling mode with yfinance
        self.poll_thread = None

    def start(self):
        # Use yfinance polling mode
        self._start_polling()

    def _start_polling(self):
        if self.poll_thread and self.poll_thread.is_alive():
            return

        def loop():
            while True:
                time.sleep(5)
                subs = list(self.subscribed)
                for sym in subs:
                    try:
                        df = fetch_live_candles(sym, resolution='1', lookback_minutes=120)
                        if df is not None and len(df) > 0:
                            last = df.iloc[-1]
                            ts = int(pd.to_datetime(last['date']).timestamp())
                            with self.lock:
                                self.latest[sym] = {
                                    'symbol': sym,
                                    'price': float(last['close']),
                                    'timestamp': ts,
                                    'data_source': 'polling'
                                }
                                self.candles[sym] = df.tail(300).copy()
                    except Exception:
                        continue

        self.poll_thread = threading.Thread(target=loop, daemon=True)
        self.poll_thread.start()

    def subscribe(self, symbol: str):
        symbol = symbol.upper()
        with self.lock:
            if symbol not in self.subscribed:
                self.subscribed.add(symbol)
        return True

    def _update_candle(self, symbol: str, price: float, ts: int):
        minute = ts - (ts % 60)
        df = self.candles.get(symbol)
        if df is None or df.empty:
            self.candles[symbol] = pd.DataFrame([
                {
                    'date': datetime.fromtimestamp(minute),
                    'open': price,
                    'high': price,
                    'low': price,
                    'close': price,
                    'volume': 0.0,
                }
            ])
            return
        last_row = df.iloc[-1]
        last_minute = int(pd.to_datetime(last_row['date']).timestamp())
        if minute == last_minute:
            df.at[df.index[-1], 'high'] = max(df.iloc[-1]['high'], price)
            df.at[df.index[-1], 'low'] = min(df.iloc[-1]['low'], price)
            df.at[df.index[-1], 'close'] = price
        else:
            new_row = pd.DataFrame([
                {
                    'date': datetime.fromtimestamp(minute),
                    'open': df.iloc[-1]['close'],
                    'high': price,
                    'low': price,
                    'close': price,
                    'volume': 0.0,
                }
            ])
            self.candles[symbol] = pd.concat([df, new_row], ignore_index=True).tail(500)

    def get_quote(self, symbol: str):
        with self.lock:
            return self.latest.get(symbol.upper())

    def get_candles(self, symbol: str, lookback: int = 300):
        with self.lock:
            df = self.candles.get(symbol.upper())
            if df is None or df.empty:
                return None
            return df.tail(lookback).copy()


stream = LivePriceStream()
