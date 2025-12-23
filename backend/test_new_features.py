import requests
import json

print("🧪 Testing New AI Features")
print("=" * 60)

BASE_URL = 'http://localhost:5000'

# Test 1: Confidence Info Endpoint
print("\n1️⃣ Testing Confidence Score Info...")
try:
    response = requests.get(f'{BASE_URL}/api/confidence-info', timeout=5)
    if response.status_code == 200:
        print("✅ Confidence Info API Working!")
        data = response.json()
        print(f"   Factors tracked: {', '.join(data.get('factors', {}).keys())}")
    else:
        print(f"❌ Failed: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: News Sentiment Endpoint
print("\n2️⃣ Testing News Sentiment API...")
try:
    response = requests.get(
        f'{BASE_URL}/api/news-sentiment',
        params={'symbol': 'AAPL', 'days': 7},
        timeout=15
    )
    if response.status_code == 200:
        data = response.json()
        if 'message' in data:
            print("ℹ️  News Sentiment Setup Required")
            print(f"   {data['message']}")
        else:
            print("✅ News Sentiment API Working!")
            print(f"   Overall Sentiment: {data.get('sentiment_emoji')} {data.get('sentiment_label')}")
            print(f"   Score: {data.get('overall_sentiment')}")
            print(f"   Articles Found: {data.get('total_articles')}")
            if data.get('recommendation'):
                print(f"   Trading Signal: {data['recommendation']['action']}")
    else:
        print(f"❌ Failed: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 3: Strategy with Confidence Scores
print("\n3️⃣ Testing Strategy with Confidence Scores...")
try:
    response = requests.get(
        f'{BASE_URL}/api/strategy',
        params={
            'name': 'ema_crossover',
            'symbol': 'AAPL',
            'period': '1mo'
        },
        timeout=30
    )
    if response.status_code == 200:
        data = response.json()
        buy_signals = data.get('buy_signals', [])
        
        if buy_signals and len(buy_signals) > 0:
            has_confidence = any('confidence' in signal for signal in buy_signals)
            
            if has_confidence:
                print("✅ Confidence Scores Working!")
                # Show first signal with confidence
                first_signal = next((s for s in buy_signals if 'confidence' in s), None)
                if first_signal:
                    print(f"   Sample Buy Signal:")
                    print(f"   - Date: {first_signal.get('date')}")
                    print(f"   - Price: ₹{first_signal.get('close', 0):.2f}")
                    print(f"   - Confidence: {first_signal.get('confidence', 0):.1f}%")
                    print(f"   - Strength: {first_signal.get('confidence_label', 'N/A')}")
                    if first_signal.get('factors'):
                        print(f"   - Factors: {first_signal['factors']}")
            else:
                print("⚠️  Signals found but no confidence scores")
                print("   Make sure backend was restarted after code changes")
        else:
            print("ℹ️  No buy signals in this period (normal)")
            
    else:
        print(f"❌ Failed: {response.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("\n📋 Summary:")
print("1. Confidence scores enhance signal reliability")
print("2. News sentiment provides market context")
print("3. Both features work together for better decisions")
print("\n🎯 To enable all features:")
print("   1. Get NewsAPI key: https://newsapi.org/")
print("   2. Add to backend/.env: NEWSAPI_KEY=your_key")
print("   3. Restart backend: python app.py")
print("\n✨ Test in browser: http://localhost:3000/strategies")
print("=" * 60)
