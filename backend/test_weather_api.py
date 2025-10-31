import requests
import json

print("Testing Weather Alerts API...")
print("=" * 60)

# Test the weather alerts endpoint
try:
    response = requests.get('http://localhost:5000/api/weather-alerts', timeout=10)
    
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        
        print("✓ Weather Alerts API Working!\n")
        
        if 'message' in data:
            print(f"Message: {data['message']}")
            if 'disclaimer' in data:
                print(f"Note: {data['disclaimer']}")
        
        print(f"\nTotal Alerts: {data.get('total_alerts', 0)}")
        print(f"High Impact Alerts: {data.get('high_impact_count', 0)}")
        
        if data.get('market_impact'):
            impact = data['market_impact']
            print(f"\nMarket Impact:")
            print(f"  Level: {impact.get('level')}")
            print(f"  Recommendation: {impact.get('recommendation')}")
            if impact.get('affected_regions'):
                print(f"  Affected Regions: {', '.join(impact['affected_regions'])}")
        
        if data.get('cities_monitored'):
            print(f"\nCities Monitored: {', '.join(data['cities_monitored'][:5])}...")
        
        if data.get('alerts') and len(data['alerts']) > 0:
            print(f"\n--- Active Alerts ---")
            for i, alert in enumerate(data['alerts'][:3], 1):
                print(f"\n{i}. {alert['event']} - {alert['city']}")
                print(f"   Severity: {alert['severity_name']} ({alert['severity']}/5)")
                print(f"   Region: {alert['region']}")
                print(f"   Impact: {alert['impact']}")
        else:
            print("\n✓ No active weather alerts (good news!)")
        
        print("\n" + "=" * 60)
        print("Setup Instructions:")
        print("1. Get free API key from: https://openweathermap.org/api")
        print("2. Add to backend/.env: OPENWEATHER_API_KEY=your_key_here")
        print("3. Restart backend: python app.py")
        print("=" * 60)
    else:
        print(f"Error: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("✗ Backend not running. Start with: python app.py")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n--- Test Disaster Impact Info Endpoint ---")
try:
    response = requests.get('http://localhost:5000/api/disaster-impact-info', timeout=5)
    if response.status_code == 200:
        data = response.json()
        print("✓ Disaster Impact Info API Working!")
        print(f"\nHigh Impact Events: {', '.join(data['high_impact_events'][:5])}...")
        print(f"Financial Centers: {len(data['financial_centers'])} monitored")
except Exception as e:
    print(f"✗ Error: {e}")
