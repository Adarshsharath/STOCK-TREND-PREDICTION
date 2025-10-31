import requests
import json

print("Testing FinBot AI Backend...")
print("-" * 50)

# Test health endpoint
try:
    response = requests.get('http://localhost:5000/api/health')
    print(f"✓ Health check: {response.json()}")
except Exception as e:
    print(f"✗ Health check failed: {e}")

print()

# Test strategy endpoint
try:
    response = requests.get(
        'http://localhost:5000/api/strategy',
        params={
            'name': 'ema_crossover',
            'symbol': 'AAPL',
            'period': '1mo'
        },
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Strategy endpoint working!")
        print(f"  - Strategy: {data.get('metadata', {}).get('name')}")
        print(f"  - Buy signals: {len(data.get('buy_signals', []))}")
        print(f"  - Sell signals: {len(data.get('sell_signals', []))}")
        print(f"  - Data points: {len(data.get('data', []))}")
    else:
        print(f"✗ Strategy endpoint failed with status: {response.status_code}")
        print(f"  Response: {response.text}")
        
except Exception as e:
    print(f"✗ Strategy endpoint failed: {e}")

print()
print("-" * 50)
