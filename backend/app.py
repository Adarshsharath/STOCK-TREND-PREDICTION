from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import sys
import os
import numpy as np
import pandas as pd
from datetime import timedelta, datetime
from dotenv import load_dotenv
import traceback


# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from .env
load_dotenv()

# Import utilities
from utils.fetch_data import fetch_stock_data, fetch_live_candles
from utils.live_stream import stream
from utils.sentiment_volatility import analyze_market_sentiment, calculate_atr_volatility
from utils.explainability import generate_prediction_reasoning
from utils.market_overview import get_market_indices, generate_market_summary, get_top_gainers_losers
from utils.news_sentiment import fetch_news_sentiment, get_sentiment_summary
from utils.confidence_calculator import get_confidence_explanation
from utils.market_data import fetch_market_valuation, get_market_summary
from utils.market_hours import is_market_open, get_market_status_message

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
from models.signal_xgb_model import train_and_predict_multi_horizon

# Import classifier models
from models.logistic_regression_model import logistic_regression_predict
from models.xgboost_classifier_model import xgboost_classifier_predict
from models.randomforest_classifier_model import randomforest_classifier_predict
from models.lstm_classifier_model import lstm_classifier_predict
from models.svm_classifier_model import svm_classifier_predict

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

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)

# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'simple', 'CACHE_DEFAULT_TIMEOUT': 300})

# Initialize database
from database import init_db, add_favorite, remove_favorite, list_favorites
from utils.market_snapshots import get_intraday_summary
init_db()

# Start live price stream (websocket or polling fallback)
try:
    stream.start()
except Exception:
    pass

# Register auth blueprint
from auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')

def clean_nan_values(obj):
    """
    Recursively replace NaN, Infinity with None for valid JSON serialization
    """
    if isinstance(obj, dict):
        return {key: clean_nan_values(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, (pd.Timestamp, datetime, np.datetime64)):
        try:
            return pd.to_datetime(obj).isoformat()
        except Exception:
            return str(obj)
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
    # Regression models (price prediction)
    'lstm': lstm_predict,
    'prophet': prophet_predict,
    'arima': arima_predict,
    'randomforest': randomforest_predict,
    'xgboost': xgboost_predict,
    
    # Classification models (direction prediction)
    'logistic_regression': logistic_regression_predict,
    'xgboost_classifier': xgboost_classifier_predict,
    'randomforest_classifier': randomforest_classifier_predict,
    'lstm_classifier': lstm_classifier_predict,
    'svm': svm_classifier_predict
}

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API information"""
    return jsonify({
        'message': 'FinSight AI Backend API',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'strategies': '/api/strategies',
            'strategy': '/api/strategy?name=<strategy>&symbol=<symbol>&period=<period>',
            'models': '/api/models',
            'predict': '/api/predict?model=<model>&symbol=<symbol>&period=<period>',
            'chatbot': '/api/chatbot (POST)',
            'market_overview': '/api/market-overview'
        },
        'docs': 'Visit /api/health to check server status'
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'FinSight AI Backend is running'})

@app.route('/api/live/subscribe', methods=['POST', 'GET'])
def live_subscribe():
    symbol = request.args.get('symbol') or request.json.get('symbol') if request.is_json else None
    if not symbol:
        return jsonify({'error': 'symbol is required'}), 400
    ok = stream.subscribe(symbol.upper())
    return jsonify({'success': bool(ok), 'symbol': symbol.upper()})

@app.route('/api/live/quote', methods=['GET'])
def live_quote():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({'error': 'symbol is required'}), 400
    quote = stream.get_quote(symbol)
    if not quote:
        return jsonify({'error': 'No quote yet'}), 404
    return jsonify(quote)

@app.route('/api/live/candles', methods=['GET'])
def live_candles():
    symbol = request.args.get('symbol')
    lookback = int(request.args.get('lookback', '300'))
    if not symbol:
        return jsonify({'error': 'symbol is required'}), 400
    df = stream.get_candles(symbol, lookback=lookback)
    if df is None or df.empty:
        return jsonify({'error': 'No candles yet'}), 404
    return jsonify({
        'symbol': symbol.upper(),
        'data_source': 'websocket' if stream.mode == 'websocket' else 'polling',
        'candles': df.to_dict('records')
    })

@app.route('/api/strategy', methods=['GET'])
def get_strategy():
    """
    Get trading strategy signals based on historical price data
    
    Query Parameters:
        name: Strategy name (ema_crossover, rsi, macd, bollinger_scalping, supertrend)
        symbol: Stock symbol (e.g., AAPL, INFY.NS)
        period: Data period (default: 1y)
        interval: Data interval (default: 1d)
    """
    try:
        strategy_name = request.args.get('name', '').lower()
        symbol = request.args.get('symbol', 'AAPL').upper()
        period = request.args.get('period', '1y')
        interval = request.args.get('interval', '1d')
        
        if not strategy_name or strategy_name not in STRATEGIES:
            return jsonify({
                'error': 'Invalid strategy name',
                'available_strategies': list(STRATEGIES.keys())
            }), 400
        
        # Fetch historical data (training/backtesting friendly)
        df = fetch_stock_data(symbol, period=period, interval=interval)
        
        # Apply strategy
        strategy_func = STRATEGIES[strategy_name]
        result = strategy_func(df)
        
        # Add data source flag for frontend visibility
        try:
            result['data_source'] = df.attrs.get('data_source', 'yfinance')
        except Exception:
            result['data_source'] = 'yfinance'

        # Clean NaN values for valid JSON
        result = clean_nan_values(result)
        
        return jsonify(result)
    
    except Exception as e:
        tb = traceback.format_exc()
        try:
            print(tb)
        except Exception:
            pass
        # Return traceback only in development to help debug
        if (os.getenv('FLASK_ENV', '').lower() == 'development') or (os.getenv('FLASK_DEBUG', '').lower() in ['1', 'true', 'yes']):
            return jsonify({'error': str(e), 'traceback': tb}), 500
        return jsonify({'error': str(e)}), 500

@app.route('/api/strategy/live', methods=['GET'])
def get_strategy_live():
    """Run a trading strategy on recent intraday candles for near-real-time signals.

    Query Parameters:
        name: Strategy name (ema_crossover, rsi, macd, bollinger_scalping, supertrend, ichimoku, adx_dmi, vwap, breakout, ml_lstm)
        symbol: Stock symbol (e.g., AAPL, RELIANCE.NS)
        resolution: Candle resolution in minutes. Supported: '1','5','15','30','60' (default: '1')
        lookback: Number of minutes to look back for candles (default: 240)
    """
    try:
        strategy_name = request.args.get('name', '').lower()
        symbol = request.args.get('symbol', 'AAPL').upper()
        resolution = request.args.get('resolution', '1')
        lookback = int(request.args.get('lookback', '240'))

        if not strategy_name or strategy_name not in STRATEGIES:
            return jsonify({
                'error': 'Invalid strategy name',
                'available_strategies': list(STRATEGIES.keys())
            }), 400

        # Check if market is open for this symbol
        market_status = is_market_open(symbol=symbol)
        
        # Fetch recent intraday candles using yfinance
        df = fetch_live_candles(symbol, resolution=resolution, lookback_minutes=lookback)
        if df is None or df.empty:
            return jsonify({'error': f'No live candle data available for symbol: {symbol}'}), 404

        # Apply strategy on live candles
        strategy_func = STRATEGIES[strategy_name]
        result = strategy_func(df)

        # Attach data source
        try:
            result['data_source'] = df.attrs.get('data_source', 'live')
        except Exception:
            result['data_source'] = 'live'
        
        # Add market status information
        result['market_status'] = market_status

        # Add convenience field for frontend polling/notifications
        latest_signal = None
        try:
            latest_buy = (result.get('buy_signals') or [])
            latest_sell = (result.get('sell_signals') or [])

            candidate = None
            for s in latest_buy:
                candidate = s if candidate is None else (s if str(s.get('date', '')) > str(candidate.get('date', '')) else candidate)
            for s in latest_sell:
                candidate = s if candidate is None else (s if str(s.get('date', '')) > str(candidate.get('date', '')) else candidate)

            if candidate is not None:
                # Determine type by membership (best-effort)
                signal_type = 'BUY' if any(str(s.get('date', '')) == str(candidate.get('date', '')) for s in latest_buy) else 'SELL'
                latest_signal = {
                    'type': signal_type,
                    'date': candidate.get('date'),
                    'close': candidate.get('close'),
                    'symbol': symbol,
                    'strategy': strategy_name,
                    'resolution': resolution
                }
        except Exception:
            latest_signal = None

        result['latest_signal'] = latest_signal
        result['symbol'] = symbol
        result['resolution'] = resolution
        result['lookback'] = lookback

        result = clean_nan_values(result)
        return jsonify(result)

    except Exception as e:
        tb = traceback.format_exc()
        try:
            print(tb)
        except Exception:
            pass
        if (os.getenv('FLASK_ENV', '').lower() == 'development') or (os.getenv('FLASK_DEBUG', '').lower() in ['1', 'true', 'yes']):
            return jsonify({'error': str(e), 'traceback': tb}), 500
        return jsonify({'error': str(e)}), 500

@app.route('/api/signal', methods=['GET'])
def get_trading_signal():
    """
    Generate production-oriented multi-horizon trading signal
    
    Query Parameters:
        symbol: Stock symbol (e.g., AAPL, INFY.NS)
        period: Data period (default: 5y, supports up to 10y)
    Returns:
        JSON with aggregate final signal (BUY/SELL/HOLD), confidence, explanations, and backtest metrics
    """
    try:
        symbol = request.args.get('symbol', 'AAPL').upper()
        period = request.args.get('period', '5y')

        # Fetch historical data (long horizon)
        df = fetch_stock_data(symbol, period=period, interval='1d')
        if df is None or df.empty:
            return jsonify({'error': f'No data available for symbol: {symbol}'}), 400

        # Optional: benchmark could be fetched here (e.g., SPY / ^NSEI) and passed in
        result = train_and_predict_multi_horizon(df)

        # Clean NaN/infs
        result = clean_nan_values(result)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    """Get the current user's favorite symbols"""
    try:
        current_user_id = int(get_jwt_identity())
        items = list_favorites(current_user_id)
        if isinstance(items, dict) and items.get('error'):
            return jsonify({'error': items['error']}), 500
        return jsonify({'favorites': items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/favorites', methods=['POST'])
@jwt_required()
def add_favorite_symbol():
    """Add a symbol to the current user's favorites"""
    try:
        data = request.get_json() or {}
        symbol = (data.get('symbol') or '').strip().upper()
        display_name = data.get('display_name')
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        current_user_id = int(get_jwt_identity())
        # Validate symbol has data
        try:
            df_check = fetch_stock_data(symbol, period='5d', interval='1d')
            if df_check is None or df_check.empty:
                return jsonify({'error': f'No stock available for symbol: {symbol}'}), 400
        except Exception:
            return jsonify({'error': f'No stock available for symbol: {symbol}'}), 400
        result = add_favorite(current_user_id, symbol, display_name)
        if not result.get('success'):
            return jsonify({'error': result.get('error', 'Failed to add favorite')}), 400
        # Invalidate favorites summary cache for this user
        cache.delete(f"fav_summary:{current_user_id}")
        items = list_favorites(current_user_id)
        return jsonify({'message': 'Added to favorites', 'favorites': items}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/favorites/<symbol>', methods=['DELETE'])
@jwt_required()
def delete_favorite_symbol(symbol):
    """Remove a symbol from the current user's favorites"""
    try:
        current_user_id = int(get_jwt_identity())
        result = remove_favorite(current_user_id, (symbol or '').upper())
        if not result.get('success'):
            return jsonify({'error': result.get('error', 'Failed to remove favorite')}), 404
        # Invalidate favorites summary cache for this user
        cache.delete(f"fav_summary:{current_user_id}")
        items = list_favorites(current_user_id)
        return jsonify({'message': 'Removed from favorites', 'favorites': items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/favorites/summary', methods=['GET'])
@jwt_required()
def favorites_summary():
    """Get intraday summary for current user's favorite symbols"""
    try:
        current_user_id = int(get_jwt_identity())
        items = list_favorites(current_user_id)
        if isinstance(items, dict) and items.get('error'):
            return jsonify({'error': items['error']}), 500
        symbols = [i['symbol'] for i in items]
        cache_key = f"fav_summary:{current_user_id}:{','.join(sorted(symbols))}"
        cached = cache.get(cache_key)
        if cached:
            return jsonify(clean_nan_values(cached))
        summary = get_intraday_summary(symbols)
        cache.set(cache_key, summary, timeout=60)
        return jsonify(clean_nan_values(summary))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['GET'])
def get_prediction():
    """
    Get stock price predictions
    
    Query Parameters:
        model: Model name (lstm, prophet, arima, randomforest, xgboost, logistic_regression, xgboost_classifier, randomforest_classifier, lstm_classifier, svm)
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
    Chat with FinSight AI
    
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

@app.route('/api/stock-price', methods=['GET'])
def get_stock_price():
    """
    Get current stock price with change and percentage
    
    Query Parameters:
        symbol: Stock symbol (e.g., AAPL, RELIANCE.NS)
    """
    try:
        symbol = request.args.get('symbol')
        if not symbol:
            return jsonify({'error': 'Symbol parameter is required'}), 400
        
        # Fetch recent data (last 2 days to calculate change)
        df = fetch_stock_data(symbol, period='5d')
        
        if df is None or len(df) < 2:
            return jsonify({'error': f'Unable to fetch data for {symbol}'}), 404
        
        # Get latest and previous close
        current_price = float(df['close'].iloc[-1])
        previous_close = float(df['close'].iloc[-2])
        
        # Calculate change
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100
        
        return jsonify({
            'symbol': symbol,
            'price': current_price,
            'previousClose': previous_close,
            'change': change,
            'changePercent': change_percent,
            'timestamp': str(df.index[-1])
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/simulator-data', methods=['GET'])
def get_simulator_data():
    """
    Get historical data with signals for live market simulation
    
    Query Parameters:
        symbol: Stock symbol (e.g., AAPL)
        strategy: Strategy name for signal detection (e.g., macd, rsi)
    """
    try:
        symbol = request.args.get('symbol', 'AAPL')
        strategy_name = request.args.get('strategy', 'macd')
        
        print(f"\n{'='*60}")
        print(f"Simulator request: {symbol} with {strategy_name}")
        print(f"{'='*60}")
        
        df = None
        data_source = "mock"
        
        # ALWAYS generate mock data for now (guaranteed to work)
        # You can enable Yahoo Finance later by uncommenting the code below
        from datetime import datetime, timedelta
        
        print(f"Generating mock data for {symbol}...")
        
        num_days = 90
        base_price = 150.0
        current_date = datetime.now()
        
        # Create dates and prices
        prices = [base_price]
        
        for i in range(1, num_days):
            # Random walk simulation
            change = np.random.randn() * 2.0
            new_price = prices[-1] * (1 + change/100)
            prices.append(max(new_price, base_price * 0.7))
        
        dates = [(current_date - timedelta(days=num_days-i)).strftime('%Y-%m-%d') for i in range(num_days)]
        
        # Create DataFrame
        df = pd.DataFrame({
            'date': dates,
            'open': [p * (1 + np.random.uniform(-0.01, 0.01)) for p in prices],
            'high': [p * (1 + abs(np.random.uniform(0, 0.02))) for p in prices],
            'low': [p * (1 - abs(np.random.uniform(0, 0.02))) for p in prices],
            'close': prices,
            'volume': [np.random.randint(1000000, 10000000) for _ in range(num_days)]
        })
        
        print(f"✓ Generated {len(df)} days of MOCK data")
        print(f"  Price range: ₹{min(prices):.2f} - ₹{max(prices):.2f}")
        print(f"  Data source: {data_source.upper()}")
        
        # OPTIONAL: Try Yahoo Finance (uncomment to enable)
        # try:
        #     print(f"Attempting to fetch real data for {symbol}...")
        #     real_df = fetch_stock_data(symbol, period='3mo', interval='1d')
        #     if real_df is not None and len(real_df) > 30:
        #         df = real_df
        #         data_source = "yahoo_finance"
        #         if 'date' not in df.columns:
        #             df.reset_index(inplace=True)
        #             df.columns = [col.lower().replace(' ', '_') for col in df.columns]
        #         print(f"✓ Using REAL Yahoo Finance data instead")
        # except Exception as e:
        #     print(f"✗ Yahoo Finance failed, using mock data: {str(e)}")
        
        # Apply strategy to detect signals
        from strategies.macd_strategy import macd_strategy
        from strategies.rsi_strategy import rsi_strategy
        from strategies.ema_crossover import ema_crossover_strategy
        
        strategy_functions = {
            'macd': macd_strategy,
            'rsi': rsi_strategy,
            'ema_crossover': ema_crossover_strategy
        }
        
        strategy_func = strategy_functions.get(strategy_name, macd_strategy)
        
        print(f"Running {strategy_name} strategy...")
        result = strategy_func(df.copy())
        
        # Build response with signals
        data_with_signals = []
        buy_count = 0
        sell_count = 0
        
        for idx, row in enumerate(result['data']):
            # Ensure we have the required fields
            data_point = {
                'date': str(row.get('date', '')),
                'open': float(row.get('open', 0)),
                'high': float(row.get('high', 0)),
                'low': float(row.get('low', 0)),
                'close': float(row.get('close', 0)),
                'volume': int(row.get('volume', 0)),
                'signal': 0
            }
            
            # Check for buy/sell signals
            buy_signal = any(str(s.get('date', '')) == data_point['date'] for s in result.get('buy_signals', []))
            sell_signal = any(str(s.get('date', '')) == data_point['date'] for s in result.get('sell_signals', []))
            
            if buy_signal:
                data_point['signal'] = 1
                buy_count += 1
            elif sell_signal:
                data_point['signal'] = -1
                sell_count += 1
            
            data_with_signals.append(data_point)
        
        print(f"✓ Strategy processed")
        print(f"  Buy signals: {buy_count}")
        print(f"  Sell signals: {sell_count}")
        print(f"  Total data points: {len(data_with_signals)}")
        
        response_data = {
            'data': data_with_signals,
            'symbol': symbol,
            'strategy': strategy_name,
            'total_points': len(data_with_signals),
            'buy_signals': buy_count,
            'sell_signals': sell_count,
            'data_source': data_source,
            'success': True
        }
        
        print(f"✓ Returning response with {len(data_with_signals)} points")
        print(f"{'='*60}\n")
        
        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"\n{'!'*60}")
        print(f"ERROR in simulator endpoint:")
        print(error_trace)
        print(f"{'!'*60}\n")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
