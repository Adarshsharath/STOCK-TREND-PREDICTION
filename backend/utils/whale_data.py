"""
Whale Data Utility - Fetch real bulk deals, block deals, and short selling data from NSE India
"""

import requests
from datetime import datetime, timedelta
import traceback
import time

# NSE API endpoints
NSE_BASE_URL = "https://www.nseindia.com"
NSE_LARGE_DEALS_URL = f"{NSE_BASE_URL}/api/snapshot-capital-market-largedeal"
NSE_BULK_DEALS_URL = f"{NSE_BASE_URL}/api/historical/bulk-deals"
NSE_BLOCK_DEALS_URL = f"{NSE_BASE_URL}/api/historical/block-deals"

# Headers to mimic browser request (NSE requires this)
NSE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.nseindia.com/',
    'Connection': 'keep-alive',
    'DNT': '1',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
}

def get_nse_session():
    """Create a session with NSE cookies for authenticated requests"""
    session = requests.Session()
    session.headers.update(NSE_HEADERS)
    
    # First, visit the homepage to get cookies (NSE requires this)
    try:
        # Visit main page to establish session
        session.get(NSE_BASE_URL, timeout=10)
        time.sleep(0.5)  # Small delay to let cookies set
        
        # Visit the bulk deals page to get proper cookies
        session.get(f"{NSE_BASE_URL}/report-detail/eq_security", timeout=10)
        time.sleep(0.5)
    except Exception as e:
        print(f"Warning: Error establishing NSE session: {e}")
    
    return session

def fetch_nse_large_deals():
    """
    Fetch today's large deals (bulk + block + short selling) from NSE
    Returns: dict with bulk_deals, block_deals, short_deals lists
    """
    try:
        session = get_nse_session()
        
        # Add a small delay before making the API call
        time.sleep(1)
        
        response = session.get(NSE_LARGE_DEALS_URL, timeout=15)
        
        if response.status_code == 200:
            # Check if response is actually JSON
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' not in content_type:
                print(f"NSE API returned non-JSON response. Content-Type: {content_type}")
                print(f"Response text (first 200 chars): {response.text[:200]}")
                return {'bulk_deals': [], 'block_deals': [], 'short_deals': []}
            
            data = response.json()
            return {
                'bulk_deals': data.get('BULK_DEALS', []),
                'block_deals': data.get('BLOCK_DEALS', []),
                'short_deals': data.get('SHORT_DEALS', [])
            }
        else:
            print(f"NSE API returned status code: {response.status_code}")
            print(f"Response text (first 200 chars): {response.text[:200]}")
            return {'bulk_deals': [], 'block_deals': [], 'short_deals': []}
    
    except requests.exceptions.JSONDecodeError as e:
        print(f"NSE API returned invalid JSON: {e}")
        print("This usually means NSE's anti-bot protection is active or market is closed")
        return {'bulk_deals': [], 'block_deals': [], 'short_deals': []}
    except Exception as e:
        print(f"Error fetching NSE large deals: {e}")
        traceback.print_exc()
        return {'bulk_deals': [], 'block_deals': [], 'short_deals': []}


def fetch_nse_historical_bulk_deals(from_date=None, to_date=None):
    """
    Fetch historical bulk deals from NSE
    Args:
        from_date: Start date in DD-MM-YYYY format (default: today)
        to_date: End date in DD-MM-YYYY format (default: today)
    """
    try:
        if not from_date:
            from_date = datetime.now().strftime('%d-%m-%Y')
        if not to_date:
            to_date = datetime.now().strftime('%d-%m-%Y')
        
        session = get_nse_session()
        url = f"{NSE_BULK_DEALS_URL}?from={from_date}&to={to_date}"
        response = session.get(url, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            return []
    
    except Exception as e:
        print(f"Error fetching historical bulk deals: {e}")
        return []

def fetch_nse_historical_block_deals(from_date=None, to_date=None):
    """
    Fetch historical block deals from NSE
    Args:
        from_date: Start date in DD-MM-YYYY format (default: today)
        to_date: End date in DD-MM-YYYY format (default: today)
    """
    try:
        if not from_date:
            from_date = datetime.now().strftime('%d-%m-%Y')
        if not to_date:
            to_date = datetime.now().strftime('%d-%m-%Y')
        
        session = get_nse_session()
        url = f"{NSE_BLOCK_DEALS_URL}?from={from_date}&to={to_date}"
        response = session.get(url, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            return []
    
    except Exception as e:
        print(f"Error fetching historical block deals: {e}")
        return []

def parse_bulk_deal(deal):
    """
    Parse a bulk deal into whale alert format
    
    Bulk deal fields from NSE:
    - symbol: Stock symbol
    - name: Company name
    - clientName: Client/investor name
    - buySell: 'BUY' or 'SELL'
    - qty: Quantity of shares
    - watp: Weighted average trade price
    - remarks: Additional remarks
    """
    try:
        symbol = deal.get('symbol', 'N/A')
        client_name = deal.get('clientName', 'Unknown Investor')
        buy_sell = deal.get('buySell', 'BUY').upper()
        qty = float(deal.get('qty', 0))
        price = float(deal.get('watp', 0))
        
        # Calculate value in crores
        value_inr = (qty * price) / 10000000  # Convert to crores
        
        # Determine sentiment
        sentiment = 'bullish' if buy_sell == 'BUY' else 'bearish'
        emoji = '📈' if buy_sell == 'BUY' else '📉'
        color = 'green' if buy_sell == 'BUY' else 'red'
        
        # Create explanation
        if buy_sell == 'BUY':
            explanation = f"🚨 {client_name} just bought {qty/1000000:.2f} Million shares at ₹{price:.2f} each!\n\n💡 What this means for you: When big investors buy heavily, they expect the price to go UP. This could be a good time to consider buying this stock."
        else:
            explanation = f"⚠️ {client_name} sold {qty/1000000:.2f} Million shares at ₹{price:.2f}. Total money taken out: ₹{value_inr:.0f} Crores!\n\n💡 What this means for you: Big investors are cashing out. The price might DROP soon. If you own this stock, consider selling. If planning to buy, wait for price to fall."
        
        return {
            'symbol': symbol,
            'type': f'Bulk Deal - {buy_sell.title()}',
            'emoji': emoji,
            'color': color,
            'sentiment': sentiment,
            'explanation': explanation,
            'volume': f'{qty/1000000:.2f}M shares',
            'value': f'₹{value_inr:.0f} Cr',
            'time': 'Today',
            'price': f'₹{price:.2f}',
            'client_name': client_name
        }
    
    except Exception as e:
        print(f"Error parsing bulk deal: {e}")
        return None

def parse_block_deal(deal):
    """
    Parse a block deal into whale alert format
    
    Block deal fields from NSE:
    - symbol: Stock symbol
    - name: Company name
    - clientName: Client/investor name
    - buySell: 'BUY' or 'SELL'
    - qty: Quantity of shares
    - watp: Weighted average trade price
    """
    try:
        symbol = deal.get('symbol', 'N/A')
        client_name = deal.get('clientName', 'Unknown Investor')
        buy_sell = deal.get('buySell', 'BUY').upper()
        qty = float(deal.get('qty', 0))
        price = float(deal.get('watp', 0))
        
        # Calculate value in crores
        value_inr = (qty * price) / 10000000
        
        # Determine sentiment
        sentiment = 'bullish' if buy_sell == 'BUY' else 'bearish'
        emoji = '🧱' if buy_sell == 'BUY' else '💨'
        color = 'indigo' if buy_sell == 'BUY' else 'red'
        
        # Create explanation
        if buy_sell == 'BUY':
            explanation = f"🧱 HUGE BLOCK TRADE! {client_name} bought {qty/1000000:.2f} Million shares at ₹{price:.2f} in a single transaction!\n\n💡 What this means for you: Block deals are massive institutional trades. When they buy, it signals strong confidence. This is a STRONG BUY signal!"
        else:
            explanation = f"💨 BLOCK DUMP! {client_name} sold {qty/1000000:.2f} Million shares rapidly at ₹{price:.2f}!\n\n💡 What this means for you: Institutional exit detected. Price pressure likely. Consider exiting positions or waiting for stabilization."
        
        return {
            'symbol': symbol,
            'type': f'Block Deal - {buy_sell.title()}',
            'emoji': emoji,
            'color': color,
            'sentiment': sentiment,
            'explanation': explanation,
            'volume': f'{qty/1000000:.2f}M shares',
            'value': f'₹{value_inr:.0f} Cr',
            'time': 'Today',
            'price': f'₹{price:.2f}',
            'client_name': client_name
        }
    
    except Exception as e:
        print(f"Error parsing block deal: {e}")
        return None

def parse_short_deal(deal):
    """
    Parse a short selling deal into whale alert format
    
    Short deal fields from NSE:
    - symbol: Stock symbol
    - name: Company name
    - qty: Quantity of shares shorted
    """
    try:
        symbol = deal.get('symbol', 'N/A')
        name = deal.get('name', symbol)
        qty = float(deal.get('qty', 0))
        
        return {
            'symbol': symbol,
            'type': 'High Short Selling',
            'emoji': '⚠️',
            'color': 'orange',
            'sentiment': 'bearish',
            'explanation': f"⚠️ WARNING! {qty/1000000:.2f} Million shares of {name} were SHORT SOLD today!\n\n💡 What this means for you: Short sellers are betting the price will DROP. High short selling often indicates bearish sentiment. Be cautious with this stock.",
            'volume': f'{qty/1000000:.2f}M shares',
            'value': 'N/A',
            'time': 'Today',
            'price': 'N/A',
            'client_name': 'Multiple Traders'
        }
    
    except Exception as e:
        print(f"Error parsing short deal: {e}")
        return None

def get_whale_alerts():
    """
    Fetch and parse all whale alerts from NSE
    Returns: dict with 'alerts' list and 'stats' dict
    """
    try:
        # Fetch data from NSE
        large_deals = fetch_nse_large_deals()
        
        alerts = []
        
        # Parse bulk deals
        for deal in large_deals.get('bulk_deals', []):
            parsed = parse_bulk_deal(deal)
            if parsed:
                alerts.append(parsed)
        
        # Parse block deals
        for deal in large_deals.get('block_deals', []):
            parsed = parse_block_deal(deal)
            if parsed:
                alerts.append(parsed)
        
        # Parse short selling deals
        for deal in large_deals.get('short_deals', []):
            parsed = parse_short_deal(deal)
            if parsed:
                alerts.append(parsed)
        
        # Calculate statistics
        bullish = len([a for a in alerts if a['sentiment'] == 'bullish'])
        bearish = len([a for a in alerts if a['sentiment'] == 'bearish'])
        neutral = len([a for a in alerts if a['sentiment'] == 'neutral'])
        
        stats = {
            'total': len(alerts),
            'bullish': bullish,
            'bearish': bearish,
            'neutral': neutral,
            'sentiment': 'Bullish' if bullish > bearish else 'Bearish' if bearish > bullish else 'Neutral'
        }
        
        return {
            'alerts': alerts,
            'stats': stats,
            'last_updated': datetime.now().isoformat(),
            'data_source': 'NSE India'
        }
    
    except Exception as e:
        print(f"Error getting whale alerts: {e}")
        traceback.print_exc()
        return {
            'alerts': [],
            'stats': {
                'total': 0,
                'bullish': 0,
                'bearish': 0,
                'neutral': 0,
                'sentiment': 'Neutral'
            },
            'last_updated': datetime.now().isoformat(),
            'data_source': 'NSE India',
            'error': str(e)
        }

if __name__ == '__main__':
    # Test the whale data fetching
    print("Testing NSE Whale Data Fetching...")
    print("=" * 50)
    
    result = get_whale_alerts()
    
    print(f"\nTotal Alerts: {result['stats']['total']}")
    print(f"Bullish: {result['stats']['bullish']}")
    print(f"Bearish: {result['stats']['bearish']}")
    print(f"Overall Sentiment: {result['stats']['sentiment']}")
    print(f"\nData Source: {result.get('data_source')}")
    print(f"Last Updated: {result.get('last_updated')}")
    
    if result['alerts']:
        print(f"\nFirst Alert:")
        alert = result['alerts'][0]
        print(f"  Symbol: {alert['symbol']}")
        print(f"  Type: {alert['type']}")
        print(f"  Volume: {alert['volume']}")
        print(f"  Value: {alert['value']}")
        print(f"  Client: {alert['client_name']}")
    else:
        print("\nNo alerts found (market may be closed or no large deals today)")
