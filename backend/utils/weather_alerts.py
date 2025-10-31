import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')

# Major financial centers and their coordinates
MAJOR_CITIES = {
    'New York': {'lat': 40.7128, 'lon': -74.0060, 'region': 'US East Coast'},
    'London': {'lat': 51.5074, 'lon': -0.1278, 'region': 'Europe'},
    'Tokyo': {'lat': 35.6762, 'lon': 139.6503, 'region': 'Asia'},
    'Hong Kong': {'lat': 22.3193, 'lon': 114.1694, 'region': 'Asia'},
    'Shanghai': {'lat': 31.2304, 'lon': 121.4737, 'region': 'Asia'},
    'Mumbai': {'lat': 19.0760, 'lon': 72.8777, 'region': 'India'},
    'Singapore': {'lat': 1.3521, 'lon': 103.8198, 'region': 'Asia'},
    'Frankfurt': {'lat': 50.1109, 'lon': 8.6821, 'region': 'Europe'},
    'San Francisco': {'lat': 37.7749, 'lon': -122.4194, 'region': 'US West Coast'},
}

# Disaster severity mapping
SEVERITY_LEVELS = {
    'Extreme': {'level': 5, 'color': 'red', 'impact': 'Critical'},
    'Severe': {'level': 4, 'color': 'orange', 'impact': 'High'},
    'Moderate': {'level': 3, 'color': 'yellow', 'impact': 'Medium'},
    'Minor': {'level': 2, 'color': 'blue', 'impact': 'Low'},
}

# Disaster types that significantly impact markets
HIGH_IMPACT_EVENTS = [
    'hurricane', 'typhoon', 'earthquake', 'tsunami', 'flood', 
    'tornado', 'wildfire', 'severe storm', 'cyclone', 'blizzard'
]

def fetch_weather_alerts(city=None):
    """
    Fetch weather alerts for major financial centers
    
    Args:
        city: Specific city to check (optional)
    
    Returns:
        dict with alerts data
    """
    if not OPENWEATHER_API_KEY:
        return {
            'alerts': [],
            'message': 'Weather API key not configured. Sign up at https://openweathermap.org/api',
            'disclaimer': 'This is a demo. Configure OPENWEATHER_API_KEY in .env to enable real alerts.'
        }
    
    try:
        alerts = []
        cities_to_check = {city: MAJOR_CITIES[city]} if city and city in MAJOR_CITIES else MAJOR_CITIES
        
        for city_name, coords in cities_to_check.items():
            try:
                # OneCall API provides alerts
                url = f"https://api.openweathermap.org/data/3.0/onecall"
                params = {
                    'lat': coords['lat'],
                    'lon': coords['lon'],
                    'appid': OPENWEATHER_API_KEY,
                    'exclude': 'minutely,hourly,daily'
                }
                
                response = requests.get(url, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check for alerts
                    if 'alerts' in data and data['alerts']:
                        for alert in data['alerts']:
                            severity = determine_severity(alert.get('event', ''))
                            
                            alerts.append({
                                'city': city_name,
                                'region': coords['region'],
                                'event': alert.get('event', 'Unknown'),
                                'description': alert.get('description', ''),
                                'start': alert.get('start', 0),
                                'end': alert.get('end', 0),
                                'severity': severity['level'],
                                'severity_name': severity['name'],
                                'color': severity['color'],
                                'impact': severity['impact'],
                                'sender': alert.get('sender_name', 'Weather Service'),
                                'high_impact': is_high_impact_event(alert.get('event', ''))
                            })
                
            except Exception as e:
                print(f"Error fetching alerts for {city_name}: {e}")
                continue
        
        # Sort by severity (highest first)
        alerts.sort(key=lambda x: x['severity'], reverse=True)
        
        # Get market impact summary
        market_impact = calculate_market_impact(alerts)
        
        return {
            'alerts': alerts,
            'total_alerts': len(alerts),
            'high_impact_count': sum(1 for a in alerts if a['high_impact']),
            'market_impact': market_impact,
            'timestamp': datetime.now().isoformat(),
            'cities_monitored': list(cities_to_check.keys())
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'alerts': [],
            'message': 'Unable to fetch weather alerts'
        }

def determine_severity(event_name):
    """Determine severity level of weather event"""
    event_lower = event_name.lower()
    
    if any(word in event_lower for word in ['extreme', 'catastrophic', 'major']):
        return {'name': 'Extreme', 'level': 5, 'color': 'red', 'impact': 'Critical'}
    elif any(word in event_lower for word in ['severe', 'warning', 'hurricane', 'typhoon']):
        return {'name': 'Severe', 'level': 4, 'color': 'orange', 'impact': 'High'}
    elif any(word in event_lower for word in ['moderate', 'watch', 'advisory']):
        return {'name': 'Moderate', 'level': 3, 'color': 'yellow', 'impact': 'Medium'}
    else:
        return {'name': 'Minor', 'level': 2, 'color': 'blue', 'impact': 'Low'}

def is_high_impact_event(event_name):
    """Check if event type significantly impacts markets"""
    event_lower = event_name.lower()
    return any(keyword in event_lower for keyword in HIGH_IMPACT_EVENTS)

def calculate_market_impact(alerts):
    """Calculate overall market impact from alerts"""
    if not alerts:
        return {
            'level': 'None',
            'recommendation': 'No weather-related market concerns',
            'color': 'green'
        }
    
    high_impact = [a for a in alerts if a['high_impact']]
    critical_alerts = [a for a in alerts if a['severity'] >= 4]
    
    if len(critical_alerts) >= 2 or len(high_impact) >= 3:
        return {
            'level': 'High',
            'recommendation': 'Exercise caution - multiple severe weather events detected',
            'color': 'red',
            'affected_regions': list(set(a['region'] for a in critical_alerts))
        }
    elif len(critical_alerts) >= 1 or len(high_impact) >= 2:
        return {
            'level': 'Moderate',
            'recommendation': 'Monitor situation - severe weather in key financial regions',
            'color': 'orange',
            'affected_regions': list(set(a['region'] for a in (critical_alerts + high_impact)))
        }
    elif len(high_impact) >= 1:
        return {
            'level': 'Low',
            'recommendation': 'Be aware - weather events detected but limited market impact expected',
            'color': 'yellow',
            'affected_regions': list(set(a['region'] for a in high_impact))
        }
    else:
        return {
            'level': 'Minimal',
            'recommendation': 'No significant weather-related market concerns',
            'color': 'green'
        }

def get_disaster_impact_info():
    """Get general info about how disasters impact markets"""
    return {
        'high_impact_events': HIGH_IMPACT_EVENTS,
        'financial_centers': list(MAJOR_CITIES.keys()),
        'impact_examples': {
            'Hurricane': 'Can disrupt supply chains, energy production, and regional economies',
            'Earthquake': 'May affect infrastructure, manufacturing, and regional stability',
            'Typhoon': 'Impacts Asian markets, supply chains, and commodity prices',
            'Wildfire': 'Affects agriculture, insurance, utilities, and real estate sectors',
            'Flood': 'Disrupts transportation, agriculture, and local economies',
            'Severe Storm': 'Can impact energy, transportation, and retail sectors'
        }
    }
