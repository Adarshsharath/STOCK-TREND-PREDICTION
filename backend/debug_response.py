import requests
import json

# Test the exact same request the frontend makes
print("Testing Strategy Response Structure...")
print("=" * 60)

strategy = input("Enter strategy name (ema_crossover/rsi/macd/bollinger_scalping/supertrend): ").strip() or 'ema_crossover'
symbol = input("Enter symbol (default AAPL): ").strip().upper() or 'AAPL'
period = input("Enter period (default 1y): ").strip() or '1y'

print(f"\nTesting: {strategy} for {symbol} ({period})")
print("-" * 60)

try:
    response = requests.get(
        'http://localhost:5000/api/strategy',
        params={
            'name': strategy,
            'symbol': symbol,
            'period': period
        },
        timeout=60
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse Keys: {list(response.json().keys())}")
    
    data = response.json()
    
    # Check what frontend expects
    if 'data' in data:
        print(f"✓ 'data' field exists")
        print(f"  - Length: {len(data['data'])}")
        if len(data['data']) > 0:
            print(f"  - First item keys: {list(data['data'][0].keys())}")
    else:
        print(f"✗ 'data' field missing!")
    
    if 'buy_signals' in data:
        print(f"✓ 'buy_signals' field exists ({len(data['buy_signals'])} signals)")
    else:
        print(f"✗ 'buy_signals' field missing!")
    
    if 'sell_signals' in data:
        print(f"✓ 'sell_signals' field exists ({len(data['sell_signals'])} signals)")
    else:
        print(f"✗ 'sell_signals' field missing!")
    
    if 'metadata' in data:
        print(f"✓ 'metadata' field exists")
        print(f"  - Name: {data['metadata'].get('name')}")
    else:
        print(f"✗ 'metadata' field missing!")
    
    print(f"\n--- Full Response Structure ---")
    print(json.dumps(data, indent=2, default=str)[:500])
    
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
