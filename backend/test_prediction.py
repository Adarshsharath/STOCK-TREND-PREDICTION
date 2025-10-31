import requests
import json

print("Testing Prediction Models...")
print("=" * 60)

models = ['arima', 'prophet', 'lstm', 'randomforest', 'xgboost']

for model in models:
    print(f"\n📈 Testing: {model.upper()}")
    print("-" * 60)
    
    try:
        response = requests.get(
            'http://localhost:5000/api/predict',
            params={
                'model': model,
                'symbol': 'AAPL',
                'period': '1y'
            },
            timeout=120
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ SUCCESS")
            print(f"  Keys: {list(data.keys())}")
        else:
            print(f"✗ FAILED")
            print(f"  Error: {response.text[:300]}")
            
    except Exception as e:
        print(f"✗ EXCEPTION: {str(e)[:200]}")

print("\n" + "=" * 60)
