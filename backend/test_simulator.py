import requests
import json

# Test the simulator endpoint
url = 'http://localhost:5000/api/simulator-data'
params = {
    'symbol': 'AAPL',
    'strategy': 'macd'
}

print(f"Testing simulator endpoint: {url}")
print(f"Parameters: {params}")
print("-" * 50)

try:
    response = requests.get(url, params=params, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Success!")
        print(f"  Symbol: {data.get('symbol')}")
        print(f"  Strategy: {data.get('strategy')}")
        print(f"  Total Points: {data.get('total_points')}")
        print(f"  First 3 data points:")
        for i, point in enumerate(data.get('data', [])[:3]):
            print(f"    {i+1}. Date: {point.get('date')}, Close: {point.get('close')}, Signal: {point.get('signal')}")
    else:
        print(f"✗ Error: {response.status_code}")
        print(f"  Response: {response.text}")
        
except Exception as e:
    print(f"✗ Exception: {str(e)}")
