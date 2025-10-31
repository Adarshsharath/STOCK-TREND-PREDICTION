# 🌪️ Weather & Natural Disaster Alert Feature

## Overview

This feature adds real-time weather and natural disaster monitoring to help investors make informed decisions. Natural disasters can significantly impact stock markets, supply chains, and regional economies. By monitoring weather conditions in major financial centers, users can assess risk before making investments.

## Why This Matters for Investors

Natural disasters can have immediate and lasting effects on:
- **Supply Chains**: Hurricanes, floods, and storms disrupt transportation and logistics
- **Energy Sector**: Severe weather affects oil production, power grids, and utilities
- **Insurance Companies**: Major disasters lead to massive claims
- **Agriculture**: Droughts, floods, and storms impact crop yields and food prices
- **Real Estate**: Earthquakes, wildfires, and floods affect property values
- **Manufacturing**: Facility damage and workforce disruption
- **Regional Economies**: Major disasters slow economic activity in affected areas

## Features

### 📍 Monitored Locations
The system monitors weather alerts in major financial centers:
- **United States**: New York, San Francisco
- **Europe**: London, Frankfurt
- **Asia**: Tokyo, Hong Kong, Shanghai, Singapore
- **India**: Mumbai

### 🎯 Alert Severity Levels

1. **Critical (Red)** - Extreme weather events
   - Hurricane/Typhoon warnings
   - Major earthquakes
   - Catastrophic events
   - Recommendation: Exercise caution with investments

2. **High (Orange)** - Severe weather events
   - Severe storm warnings
   - Significant flooding
   - Major wildfires
   - Recommendation: Monitor situation closely

3. **Medium (Yellow)** - Moderate weather events
   - Weather advisories
   - Moderate warnings
   - Recommendation: Be aware of developments

4. **Low (Blue)** - Minor weather events
   - Minor advisories
   - Recommendation: Limited market impact expected

### 💼 Market Impact Assessment

The system automatically calculates overall market impact based on:
- Number of high-severity alerts
- Number of high-impact weather events
- Affected financial regions
- Event types (hurricanes, earthquakes, etc.)

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Subscribe to the **One Call API 3.0** (Free tier: 1,000 calls/day)
4. Copy your API key

### 2. Configure Backend

1. Open or create `.env` file in the `backend` folder:
   ```bash
   cd backend
   ```

2. Add your API key:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

3. Restart the backend server:
   ```bash
   python app.py
   ```

### 3. Verify Installation

1. Test the API endpoint:
   ```bash
   curl http://localhost:5000/api/weather-alerts
   ```

2. Open the application in your browser
3. Navigate to any page (Dashboard, Strategies, Predictions)
4. You should see weather alerts at the top if any are active

## API Endpoints

### Get Weather Alerts
```
GET /api/weather-alerts
```

**Query Parameters:**
- `city` (optional): Specific city to check (e.g., "New York", "Tokyo")

**Response:**
```json
{
  "alerts": [
    {
      "city": "New York",
      "region": "US East Coast",
      "event": "Hurricane Warning",
      "description": "Major hurricane approaching...",
      "severity": 5,
      "severity_name": "Extreme",
      "color": "red",
      "impact": "Critical",
      "high_impact": true,
      "start": 1698768000,
      "end": 1698854400
    }
  ],
  "total_alerts": 1,
  "high_impact_count": 1,
  "market_impact": {
    "level": "High",
    "recommendation": "Exercise caution - multiple severe weather events detected",
    "color": "red",
    "affected_regions": ["US East Coast"]
  },
  "timestamp": "2025-10-31T16:00:00",
  "cities_monitored": ["New York", "London", "Tokyo", ...]
}
```

### Get Disaster Impact Information
```
GET /api/disaster-impact-info
```

Returns information about how different disaster types impact markets.

## Frontend Components

### WeatherAlerts Component

Displays weather alerts at the top of key pages:
- **Dashboard**: Overview of all alerts
- **Strategies**: Alerts when analyzing trading strategies
- **Predictions**: Alerts when making ML predictions

**Features:**
- Color-coded severity badges
- Dismissible alerts
- Manual refresh button
- Auto-refresh every 30 minutes
- Detailed alert information
- Market impact recommendations

## Usage Example

When viewing the **Strategies** page:

1. If there are severe weather alerts, you'll see a banner at the top
2. The banner shows:
   - Overall market impact level (High, Moderate, Low)
   - Number of alerts detected
   - Affected regions
   - Specific weather events in financial centers
   - Investment recommendations

3. You can:
   - Click the refresh button to update alerts
   - Dismiss the banner if you want to continue
   - View detailed information about each alert

## Demo Mode

If you haven't configured an API key, the system will operate in demo mode:
- Shows placeholder message
- Explains how to enable the feature
- Provides sign-up link

## Cost Considerations

**OpenWeatherMap Free Tier:**
- 1,000 API calls per day
- With auto-refresh every 30 minutes: ~48 calls per day per user
- Sufficient for personal use and small teams

**For Production:**
- Consider upgrading to paid tier for higher limits
- Implement server-side caching to reduce API calls
- Monitor usage through OpenWeatherMap dashboard

## High-Impact Weather Events

The system specifically monitors:
- 🌀 Hurricanes & Typhoons
- 🌊 Tsunamis
- 🌪️ Tornadoes
- 🔥 Wildfires
- 💧 Major Floods
- 🌍 Earthquakes
- ❄️ Severe Blizzards
- ⛈️ Severe Storms
- 🌀 Cyclones

## Best Practices

1. **Check alerts before major investments**
2. **Monitor affected regions** if you're invested in region-specific stocks
3. **Consider diversification** during high-alert periods
4. **Don't panic** - evaluate the specific impact on your portfolio
5. **Use alerts as one factor** among many in your investment decisions

## Technical Details

### Backend Architecture
- **Module**: `backend/utils/weather_alerts.py`
- **API Integration**: OpenWeatherMap One Call API 3.0
- **Caching**: Can be enabled to reduce API calls
- **Error Handling**: Graceful fallbacks if API is unavailable

### Frontend Architecture
- **Component**: `frontend/src/components/WeatherAlerts.jsx`
- **Auto-refresh**: Every 30 minutes
- **State Management**: React hooks
- **Styling**: Tailwind CSS with dynamic color coding

## Troubleshooting

### Alerts Not Showing

1. **Check API Key**:
   ```bash
   # In backend/.env
   OPENWEATHER_API_KEY=your_key_here
   ```

2. **Verify Backend is Running**:
   ```bash
   curl http://localhost:5000/api/weather-alerts
   ```

3. **Check Browser Console** (F12) for errors

4. **Ensure API Key is Valid**:
   - Visit OpenWeatherMap dashboard
   - Verify key is active
   - Check you've subscribed to One Call API 3.0

### API Rate Limits

If you hit rate limits:
1. Reduce refresh frequency in `WeatherAlerts.jsx`
2. Implement backend caching
3. Upgrade to paid tier

## Future Enhancements

Potential improvements:
- [ ] Historical disaster impact analysis
- [ ] Sector-specific impact predictions
- [ ] Integration with news feeds
- [ ] SMS/Email alerts for critical events
- [ ] Machine learning to predict market impact
- [ ] Earthquake early warning integration
- [ ] Commodity price correlation analysis

## Contributing

To improve this feature:
1. Add more financial centers
2. Enhance severity determination logic
3. Add more disaster types
4. Improve market impact calculations
5. Add historical disaster data

## License

This feature is part of FinBot AI and follows the same license as the main project.

## Support

For issues or questions:
1. Check the main TROUBLESHOOTING.md
2. Review API documentation at OpenWeatherMap
3. Check backend logs for errors
4. Verify environment variables are set correctly

---

**Stay informed. Trade smarter. 📈🌪️**
