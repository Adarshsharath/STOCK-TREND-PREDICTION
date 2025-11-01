from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
import sys
import os
import numpy as np
import pandas as pd

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import utilities
from utils.fetch_data import fetch_stock_data
from utils.sentiment_volatility import analyze_market_sentiment, calculate_atr_volatility
from utils.explainability import generate_prediction_reasoning
from utils.market_overview import get_market_indices, generate_market_summary, get_top_gainers_losers
from utils.weather_alerts import fetch_weather_alerts, get_disaster_impact_info
from utils.news_sentiment import fetch_news_sentiment, get_sentiment_summary
from utils.confidence_calculator import get_confidence_explanation
from utils.market_data import fetch_market_valuation, get_market_summary

# Import strategies
from strategies.ema_crossover import ema_crossover_strategy
from strategies.rsi_strategy import rsi_strategy
from strategies.macd_strategy import macd_strategy
from strategies.bollinger_scalping import bollinger_scalping_strategy
from strategies.supertrend import supertrend_strategy
from strategies.ichimoku_strategy import ichimoku_strategy
from strategies.adx_dmi_strategy import adx_dmi_strategy
from strategies.vwap_strategy import vwap_strategy
from strategies.breakout_strategy import breakout_strategy
from strategies.ml_lstm_strategy import ml_lstm_strategy

# Import models
from models.lstm_model import lstm_predict
from models.prophet_model import prophet_predict
from models.arima_model import arima_predict
from models.randomforest_model import randomforest_predict
from models.xgboost_model import xgboost_predict

# Import chatbot
from chatbot.perplexity_bot_new import chat_with_perplexity
from chatbot.chat_history import (
    create_new_conversation,
    save_message,
    get_conversation,
    list_conversations,
    delete_conversation,
    update_conversation_title
)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'simple', 'CACHE_DEFAULT_TIMEOUT': 300})

def clean_nan_values(obj):
    """
    Recursively replace NaN, Infinity with None for valid JSON serialization
    """
    if isinstance(obj, dict):
        return {key: clean_nan_values(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    elif isinstance(obj, (np.integer, np.floating)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj) if isinstance(obj, np.floating) else int(obj)
    else:
        return obj

# Strategy mapping
STRATEGIES = {
    'ema_crossover': ema_crossover_strategy,
    'rsi': rsi_strategy,
    'macd': macd_strategy,
    'bollinger_scalping': bollinger_scalping_strategy,
    'supertrend': supertrend_strategy,
    'ichimoku': ichimoku_strategy,
    'adx_dmi': adx_dmi_strategy,
    'vwap': vwap_strategy,
    'breakout': breakout_strategy,
    'ml_lstm': ml_lstm_strategy
}

# Model mapping
MODELS = {
    'lstm': lstm_predict,
    'prophet': prophet_predict,
    'arima': arima_predict,
    'randomforest': randomforest_predict,
    'xgboost': xgboost_predict
}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'FinBot AI Backend is running'})

@app.route('/api/strategy', methods=['GET'])
def get_strategy():
    """
    Get trading strategy signals
    
    Query Parameters:
        name: Strategy name (ema_crossover, rsi, macd, bollinger_scalping, supertrend)
        symbol: Stock symbol (e.g., AAPL, INFY.NS)
        period: Data period (default: 1y)
    """
    try:
        strategy_name = request.args.get('name', '').lower()
        symbol = request.args.get('symbol', 'AAPL').upper()
        period = request.args.get('period', '1y')
        
        if not strategy_name or strategy_name not in STRATEGIES:
            return jsonify({
                'error': 'Invalid strategy name',
                'available_strategies': list(STRATEGIES.keys())
            }), 400
        
        # Fetch stock data
        df = fetch_stock_data(symbol, period=period)
        
        # Apply strategy
        strategy_func = STRATEGIES[strategy_name]
        result = strategy_func(df)
        
        # Clean NaN values for valid JSON
        result = clean_nan_values(result)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['GET'])
def get_prediction():
    """
    Get stock price predictions
    
    Query Parameters:
        model: Model name (lstm, prophet, arima, randomforest, xgboost)
        symbol: Stock symbol (e.g., AAPL, INFY.NS)
        period: Data period (default: 2y)
    """
    try:
        model_name = request.args.get('model', '').lower()
        symbol = request.args.get('symbol', 'AAPL').upper()
        period = request.args.get('period', '2y')
        
        if not model_name or model_name not in MODELS:
            return jsonify({
                'error': 'Invalid model name',
                'available_models': list(MODELS.keys())
            }), 400
        
        # Fetch stock data
        df = fetch_stock_data(symbol, period=period)
        
        # Apply model
        model_func = MODELS[model_name]
        result = model_func(df)
        
        # Generate AI reasoning/explainability
        reasoning = generate_prediction_reasoning(
            df=df,
            predictions=result.get('predictions', []),
            actual=result.get('actual', []),
            metrics=result.get('metrics', {}),
            model_name=result.get('metadata', {}).get('name', model_name.upper())
        )
        
        # Add reasoning to result
        result['reasoning'] = reasoning
        
        # Clean NaN values for valid JSON
        result = clean_nan_values(result)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Chat with FinBot AI
    
    Request Body:
        message: User's message
        conversation_id: Conversation ID (optional, creates new if not provided)
        conversation_history: Previous conversation (optional)
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        conversation_id = data.get('conversation_id')
        conversation_history = data.get('conversation_history', None)
        
        # Create new conversation if ID not provided
        if not conversation_id:
            conversation_id = create_new_conversation()
        
        # Save user message
        save_message(conversation_id, 'user', user_message)
        
        # Get response from Perplexity
        result = chat_with_perplexity(user_message, conversation_history)
        
        # Save assistant response if successful
        if not result.get('error'):
            save_message(conversation_id, 'assistant', result['response'])
        
        # Add conversation_id to result
        result['conversation_id'] = conversation_id
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """Get all conversations"""
    try:
        conversations = list_conversations()
        return jsonify({'conversations': conversations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def get_conversation_by_id(conversation_id):
    """Get a specific conversation"""
    try:
        conversation = get_conversation(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        return jsonify(conversation)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation_by_id(conversation_id):
    """Delete a conversation"""
    try:
        success = delete_conversation(conversation_id)
        if success:
            return jsonify({'message': 'Conversation deleted successfully'})
        return jsonify({'error': 'Conversation not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/<conversation_id>/title', methods=['PUT'])
def update_conversation_title_route(conversation_id):
    """Update conversation title"""
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        
        success = update_conversation_title(conversation_id, data['title'])
        if success:
            return jsonify({'message': 'Title updated successfully'})
        return jsonify({'error': 'Conversation not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/conversations/new', methods=['POST'])
def create_conversation():
    """Create a new conversation"""
    try:
        conversation_id = create_new_conversation()
        return jsonify({'conversation_id': conversation_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/strategies', methods=['GET'])
def list_strategies():
    """List all available strategies"""
    return jsonify({
        'strategies': [
            {'id': 'ema_crossover', 'name': 'EMA Crossover', 'description': 'Exponential Moving Average crossover strategy'},
            {'id': 'rsi', 'name': 'RSI Strategy', 'description': 'Relative Strength Index momentum strategy'},
            {'id': 'macd', 'name': 'MACD Strategy', 'description': 'Moving Average Convergence Divergence strategy'},
            {'id': 'bollinger_scalping', 'name': 'Bollinger Scalping', 'description': 'Bollinger Bands mean reversion strategy'},
            {'id': 'supertrend', 'name': 'SuperTrend', 'description': 'SuperTrend indicator trend-following strategy'}
        ]
    })

@app.route('/api/models', methods=['GET'])
def list_models():
    """List all available prediction models"""
    return jsonify({
        'models': [
            {'id': 'lstm', 'name': 'LSTM', 'description': 'Long Short-Term Memory neural network'},
            {'id': 'prophet', 'name': 'Prophet', 'description': 'Facebook Prophet time series model'},
            {'id': 'arima', 'name': 'ARIMA', 'description': 'AutoRegressive Integrated Moving Average'},
            {'id': 'randomforest', 'name': 'Random Forest', 'description': 'Random Forest ensemble model'},
            {'id': 'xgboost', 'name': 'XGBoost', 'description': 'Extreme Gradient Boosting model'}
        ]
    })

@app.route('/api/sentiment-volatility', methods=['GET'])
def get_sentiment_volatility():
    """
    Get market sentiment and volatility analysis
    
    Query Parameters:
        symbol: Stock symbol (e.g., AAPL, INFY.NS)
        period: Data period (default: 1y)
    """
    try:
        symbol = request.args.get('symbol', 'AAPL').upper()
        period = request.args.get('period', '1y')
        
        # Fetch stock data
        df = fetch_stock_data(symbol, period=period)
        
        # Analyze sentiment
        sentiment_data = analyze_market_sentiment(df)
        
        # Calculate volatility
        volatility_data = calculate_atr_volatility(df)
        
        return jsonify({
            'sentiment': sentiment_data,
            'volatility': volatility_data,
            'symbol': symbol,
            'timestamp': df['date'].iloc[-1].isoformat() if hasattr(df['date'].iloc[-1], 'isoformat') else str(df['date'].iloc[-1])
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/weather-alerts', methods=['GET'])
def get_weather_alerts():
    """
    Get weather and natural disaster alerts for major financial centers
    
    Query Parameters:
        city: Specific city to check (optional)
    """
    try:
        city = request.args.get('city', None)
        alerts = fetch_weather_alerts(city)
        return jsonify(alerts)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/disaster-impact-info', methods=['GET'])
def disaster_impact_info():
    """Get information about how disasters impact markets"""
    return jsonify(get_disaster_impact_info())

@app.route('/api/news-sentiment', methods=['GET'])
def get_news_sentiment():
    """
    Get news sentiment analysis for a stock
    
    Query Parameters:
        symbol: Stock symbol (required)
        days: Number of days to look back (default: 7)
        page_size: Number of articles (default: 10)
    """
    try:
        symbol = request.args.get('symbol', '').upper()
        days = int(request.args.get('days', 7))
        page_size = int(request.args.get('page_size', 10))
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        sentiment = fetch_news_sentiment(symbol, days, page_size)
        return jsonify(sentiment)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sentiment-info', methods=['GET'])
def sentiment_info():
    """Get information about sentiment analysis"""
    return jsonify(get_sentiment_summary())

@app.route('/api/confidence-info', methods=['GET'])
def confidence_info():
    """Get information about confidence score calculation"""
    return jsonify(get_confidence_explanation())

@app.route('/api/market-valuation', methods=['GET'])
def get_market_valuation():
    """
    Get real-time market valuation for a stock
    
    Query Parameters:
        symbol: Stock symbol (required)
    """
    try:
        symbol = request.args.get('symbol', '').upper()
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        valuation = fetch_market_valuation(symbol)
        return jsonify(valuation)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-summary', methods=['GET'])
def market_summary():
    """
    Get market summary for multiple stocks
    
    Query Parameters:
        symbols: Comma-separated stock symbols (optional)
    """
    try:
        symbols_param = request.args.get('symbols', 'AAPL,MSFT,GOOGL,TSLA,AMZN')
        symbols = [s.strip().upper() for s in symbols_param.split(',')]
        
        summary = get_market_summary(symbols)
        return jsonify(summary)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-indices', methods=['GET'])
def market_indices():
    """Get major market indices data with mini charts"""
    try:
        indices = get_market_indices()
        return jsonify(indices)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/market-overview', methods=['GET'])
def market_overview():
    """Get complete market overview with indices and summary"""
    try:
        indices = get_market_indices()
        summary = generate_market_summary()
        return jsonify({
            'indices': indices,
            'summary': summary
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-movers', methods=['GET'])
def top_movers():
    """
    Get top gainers and losers
    
    Query Parameters:
        market: 'US' or 'IN' (default: 'US')
        limit: Number of stocks (default: 5)
    """
    try:
        market = request.args.get('market', 'US').upper()
        limit = int(request.args.get('limit', 5))
        
        movers = get_top_gainers_losers(market=market, limit=limit)
        return jsonify(movers)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
