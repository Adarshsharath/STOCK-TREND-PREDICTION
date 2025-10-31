import requests
import json

print("Testing All FinBot AI Strategies...")
print("=" * 60)

strategies = [
    'ema_crossover',
    'rsi',
    'macd',
    'bollinger_scalping',
    'supertrend'
]

for strategy in strategies:
    print(f"\n📊 Testing: {strategy.upper()}")
    print("-" * 60)
    
    try:
        response = requests.get(
            'http://localhost:5000/api/strategy',
            params={
                'name': strategy,
                'symbol': 'AAPL',
                'period': '3mo'
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Status: SUCCESS")
            print(f"  - Strategy Name: {data.get('metadata', {}).get('name')}")
            print(f"  - Buy Signals: {len(data.get('buy_signals', []))}")
            print(f"  - Sell Signals: {len(data.get('sell_signals', []))}")
            print(f"  - Total Data Points: {len(data.get('data', []))}")
        else:
            print(f"✗ Status: FAILED ({response.status_code})")
            print(f"  Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"✗ Status: ERROR")
        print(f"  Error: {str(e)[:200]}")

print("\n" + "=" * 60)
print("✅ Testing Complete!")
