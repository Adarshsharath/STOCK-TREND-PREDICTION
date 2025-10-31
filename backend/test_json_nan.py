import requests
import json

# Test if NaN values are breaking JSON parsing
response = requests.get(
    'http://localhost:5000/api/strategy',
    params={
        'name': 'supertrend',
        'symbol': 'AAPL',
        'period': '1mo'
    },
    timeout=30
)

print(f"Status: {response.status_code}")
print(f"Content-Type: {response.headers.get('Content-Type')}")

# Try to parse as JSON
try:
    data = response.json()
    print("✓ JSON parsing succeeded")
    
    # Check for NaN values
    response_text = response.text
    if 'NaN' in response_text:
        print("✗ PROBLEM: Response contains NaN values (invalid JSON)")
        print(f"   NaN count: {response_text.count('NaN')}")
    else:
        print("✓ No NaN values found")
        
except json.JSONDecodeError as e:
    print(f"✗ JSON parsing failed: {e}")
    print(f"Response preview: {response.text[:500]}")
