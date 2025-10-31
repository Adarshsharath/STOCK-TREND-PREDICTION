import requests
import json
import sys

# Test what the frontend actually receives
strategy = sys.argv[1] if len(sys.argv) > 1 else 'ema_crossover'
symbol = sys.argv[2] if len(sys.argv) > 2 else 'AAPL'
period = sys.argv[3] if len(sys.argv) > 3 else '1mo'

print(f"Testing: {strategy} for {symbol} ({period})")
print("=" * 60)

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
    
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        
        # Check structure
        print("Response Structure:")
        print(f"  - Has 'data' field: {'data' in data}")
        print(f"  - Has 'buy_signals' field: {'buy_signals' in data}")
        print(f"  - Has 'sell_signals' field: {'sell_signals' in data}")
        print(f"  - Has 'metadata' field: {'metadata' in data}")
        
        if 'data' in data:
            print(f"\n  Data length: {len(data['data'])}")
            if len(data['data']) > 0:
                print(f"  First data item: {json.dumps(data['data'][0], default=str)[:200]}")
        
        if 'buy_signals' in data:
            print(f"\n  Buy signals: {len(data['buy_signals'])}")
        
        if 'sell_signals' in data:
            print(f"  Sell signals: {len(data['sell_signals'])}")
        
        if 'metadata' in data:
            print(f"\n  Strategy name: {data['metadata'].get('name')}")
        
        # Check if response.data.data would work (as frontend expects)
        print(f"\n--- Frontend Check ---")
        if data and 'data' in data:
            print("✓ Frontend would accept this response")
        else:
            print("✗ Frontend would reject: 'Invalid response from server'")
            print(f"   Response keys: {list(data.keys())}")
    else:
        print(f"Error Response: {response.text}")
        
except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()

print("=" * 60)
