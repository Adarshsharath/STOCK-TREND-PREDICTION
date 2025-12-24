from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
import sys
import os
import numpy as np
import pandas as pd
from datetime import timedelta
from dotenv import load_dotenv
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
from models.lstm_multistep_model import lstm_multistep_predict
from models.prophet_model import prophet_predict
from models.prophet_multistep_model import prophet_multistep_predict
from models.arima_model import arima_predict
from models.randomforest_model import randomforest_predict
from models.randomforest_multistep_model import randomforest_multistep_predict
from models.xgboost_model import xgboost_predict
from models.xgboost_multistep_model import xgboost_multistep_predict
from models.signal_xgb_model import train_and_predict_multi_horizon

# Import classifier models
from models.logistic_regression_model import logistic_regression_predict
from models.xgboost_classifier_model import xgboost_classifier_predict
from models.randomforest_classifier_model import randomforest_classifier_predict
from models.lstm_classifier_model import lstm_classifier_predict
from models.svm_classifier_model import svm_classifier_predict

# Import chatbot
"""Chatbot imports removed; will be provided by new blueprint."""
# Load environment variables
load_dotenv()

# MongoDB is mandatory
from db.mongo import get_db
get_db()

# Chat history is MongoDB-only
"""Legacy chat helpers removed; new chatbot blueprint will handle storage and routes."""

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
from chatbot.routes import chatbot_bp
app.register_blueprint(chatbot_bp, url_prefix='/api')

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

def _get_user_id():
    """Extract user_id from header, JSON body, or query string"""
    try:
        verify_jwt_in_request(optional=True)
        jwt_user = get_jwt_identity()
        if jwt_user:
            return str(jwt_user)
    except Exception:
        pass

    user_id = request.headers.get('X-User-Id')
    if not user_id:
        try:
            data = request.get_json(silent=True) or {}
        except Exception:
            data = {}
        user_id = data.get('user_id') or request.args.get('user_id')
    return user_id

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
    'lstm_multistep': lstm_multistep_predict,  # Multi-step LSTM (7-day forecast)
    'prophet': prophet_predict,
    'prophet_multistep': prophet_multistep_predict,  # Multi-step Prophet (7-day forecast)
    'arima': arima_predict,  # Now supports multi-step by default
    'randomforest': randomforest_predict,
    'randomforest_multistep': randomforest_multistep_predict,  # Multi-step Random Forest (7-day forecast)
    'xgboost': xgboost_predict,
    'xgboost_multistep': xgboost_multistep_predict,  # Multi-step XGBoost (7-day forecast)
    
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
        period = request.args.get('period', '5y')  # Changed from 2y to 5y for better accuracy
        
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

"""Legacy chatbot routes removed; new blueprint defines all chat endpoints."""

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
            {'id': 'lstm_multistep', 'name': 'Multi-Step LSTM', 'description': 'BiLSTM predicting 7 days ahead with trend classification (Recommended)'},
            {'id': 'prophet_multistep', 'name': 'Multi-Step Prophet', 'description': 'Prophet predicting 7 days ahead with trend classification (Recommended)'},
            {'id': 'arima', 'name': 'ARIMA (Multi-Step)', 'description': 'ARIMA with 7-day forecasting and trend classification (Recommended)'},
            {'id': 'randomforest_multistep', 'name': 'Multi-Step Random Forest', 'description': 'Random Forest predicting 7 days ahead with trend classification (Recommended)'},
            {'id': 'xgboost_multistep', 'name': 'Multi-Step XGBoost', 'description': 'XGBoost predicting 7 days ahead with trend classification (Recommended)'},
            {'id': 'lstm', 'name': 'LSTM (Legacy)', 'description': 'Single-day LSTM prediction'},
            {'id': 'prophet', 'name': 'Prophet (Legacy)', 'description': 'Single-day Prophet prediction'},
            {'id': 'randomforest', 'name': 'Random Forest (Legacy)', 'description': 'Single-day Random Forest prediction'},
            {'id': 'xgboost', 'name': 'XGBoost (Legacy)', 'description': 'Single-day XGBoost prediction'}
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

@app.route('/api/astrology', methods=['POST'])
@jwt_required()
def get_astrology_insights():
    """
    Get astrology-based insights for trading guidance
    
    Request Body:
        dob: Date of birth in YYYY-MM-DD format (required)
        
    The system automatically fills missing fields with defaults:
        - Time: 12:00:00 PM (noon)
        - Location: 20.5937°N, 78.9629°E (India center)
        - Timezone: IST (UTC+5.5)
        - Settings: topocentric observation, lahiri ayanamsha
    
    Returns:
        Astrological data with trading suggestions (NOT financial advice)
    """
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # ============================================================
        # VALIDATION: Date of Birth
        # ============================================================
        if not data or 'dob' not in data:
            return jsonify({'error': 'Date of birth is required'}), 400
        
        dob = data['dob']
        
        # Validate date format and logical constraints
        try:
            dob_date = datetime.strptime(dob, '%Y-%m-%d')
            
            # Check if date is not in the future
            if dob_date > datetime.now():
                return jsonify({'error': 'Date of birth cannot be in the future'}), 400
            
            # Check if date is reasonable (not too far in the past)
            min_date = datetime(1900, 1, 1)
            if dob_date < min_date:
                return jsonify({'error': 'Date of birth must be after 1900'}), 400
                
        except ValueError as e:
            return jsonify({'error': 'Invalid date format. Please use YYYY-MM-DD (e.g., 1990-05-15)'}), 400
        
        # ============================================================
        # USER PROVIDED DATA (from date of birth only)
        # ============================================================
        day = dob_date.day      # User provided: day
        month = dob_date.month  # User provided: month
        year = dob_date.year    # User provided: year
        
        # ============================================================
        # DEFAULT VALUES (automatically filled for missing details)
        # These defaults ensure the API request is valid
        # ============================================================
        hours = 12              # Defaulted: noon (12:00 PM)
        minutes = 0             # Defaulted: 0 minutes
        seconds = 0             # Defaulted: 0 seconds
        latitude = 20.5937      # Defaulted: India center latitude
        longitude = 78.9629     # Defaulted: India center longitude
        timezone = 5.5          # Defaulted: IST (UTC+5:30)
        
        # ============================================================
        # API SETTINGS (as per FreeAstrologyAPI requirements)
        # ============================================================
        observation_point = "topocentric"  # Defaulted: topocentric observation
        ayanamsha = "lahiri"               # Defaulted: lahiri ayanamsha system
        
        # Call FreeAstrologyAPI.com
        import requests
        
        api_url = "https://json.freeastrologyapi.com/planets"
        
        # ============================================================
        # BUILD REQUEST PAYLOAD
        # Structure optimized to prevent 400 errors
        # ============================================================
        payload = {
            # User provided fields (from DOB)
            "year": year,
            "month": month,
            "day": day,
            
            # Defaulted time fields
            "hour": hours,
            "min": minutes,
            
            # Defaulted location fields
            "lat": latitude,
            "lon": longitude,
            "tzone": timezone,
            
            # Defaulted settings (optional - remove if API returns 400)
            "settings": {
                "observation_point": observation_point,
                "ayanamsha": ayanamsha
            }
        }
        
        # ============================================================
        # SECURE API KEY HANDLING
        # API key is kept on backend only (never exposed to frontend)
        # ============================================================
        headers = {'Content-Type': 'application/json'}
        astrology_api_key = os.getenv('ASTROLOGY_API_KEY')
        
        if astrology_api_key:
            headers['X-API-Key'] = astrology_api_key
            print(f"[Astrology API] Using API key from environment")
        else:
            print(f"[Astrology API] WARNING: No API key found in environment. API may return 403.")
            print(f"[Astrology API] Add ASTROLOGY_API_KEY to your .env file")
        
        # ============================================================
        # API REQUEST WITH ERROR HANDLING
        # ============================================================
        try:
            print(f"[Astrology API] Requesting planetary data for DOB: {dob}")
            response = requests.post(api_url, json=payload, headers=headers, timeout=15)
            
            # Handle specific error codes
            if response.status_code == 403:
                return jsonify({
                    'error': 'API authentication failed. Please ensure ASTROLOGY_API_KEY is set in your .env file.',
                    'hint': 'Get your free API key from https://freeastrologyapi.com'
                }), 403
            elif response.status_code == 400:
                # Try without settings if we get 400
                print(f"[Astrology API] Got 400 with settings, retrying without...")
                payload_simple = {k: v for k, v in payload.items() if k != 'settings'}
                response = requests.post(api_url, json=payload_simple, headers=headers, timeout=15)
                
            response.raise_for_status()
            astro_data = response.json()
            print(f"[Astrology API] Successfully received planetary data")
            
        except requests.exceptions.Timeout:
            return jsonify({'error': 'Astrology API request timed out. Please try again.'}), 504
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            print(f"[Astrology API] Error: {error_msg}")
            return jsonify({
                'error': f'Failed to fetch astrology data: {error_msg}',
                'hint': 'Please check your internet connection and API key configuration'
            }), 500
        
        # ============================================================
        # PARSE AND EXTRACT PLANETARY DATA
        # ============================================================
        key_info = {}
        suggestion = ""
        
        try:
            # Extract planetary positions from API response
            if 'output' in astro_data:
                planets = astro_data['output']
                
                # Get Sun and Moon signs (most relevant for daily guidance)
                sun_sign = None
                moon_sign = None
                
                for planet in planets:
                    if planet.get('name') == 'Sun':
                        sun_sign = planet.get('sign')
                    elif planet.get('name') == 'Moon':
                        moon_sign = planet.get('sign')
                
                if sun_sign:
                    key_info['Sun Sign'] = sun_sign
                if moon_sign:
                    key_info['Moon Sign'] = moon_sign
                
                # Generate suggestion based on planetary data
                suggestion = generate_astro_suggestion(planets, sun_sign, moon_sign)
                print(f"[Astrology API] Parsed data: Sun={sun_sign}, Moon={moon_sign}")
            else:
                # Fallback if API structure is different
                print(f"[Astrology API] Unexpected response structure: {list(astro_data.keys())}")
                key_info['Status'] = 'Data received'
                suggestion = generate_generic_suggestion()
                
        except Exception as e:
            print(f"[Astrology API] Error parsing data: {str(e)}")
            key_info['Status'] = 'Partial data'
            suggestion = generate_generic_suggestion()
        
        # ============================================================
        # RETURN RESPONSE
        # ============================================================
        return jsonify({
            'success': True,
            'keyInfo': key_info,
            'suggestion': suggestion,
            'dob': dob,
            'timestamp': datetime.now().isoformat(),
            'usedDefaults': True,  # Flag to indicate defaults were used
            'defaults': {
                'time': f'{hours:02d}:{minutes:02d}:{seconds:02d}',
                'location': f'{latitude}°N, {longitude}°E',
                'timezone': f'UTC+{timezone}',
                'observation_point': observation_point,
                'ayanamsha': ayanamsha
            }
        })
        
    except Exception as e:
        print(f"[Astrology API] Unexpected error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def generate_astro_suggestion(planets, sun_sign=None, moon_sign=None):
    """
    Generate a supportive suggestion based on astrological data.
    This is NOT financial advice - only general guidance about mindset and timing.
    """
    suggestions = []
    
    # Moon-based emotional state suggestions
    moon_suggestions = {
        'Aries': "High energy period — be mindful of impulsive decisions. Take time to review.",
        'Taurus': "Stable mindset favors patience. Good time for steady planning.",
        'Gemini': "Mental activity is high — great for research, but avoid overthinking.",
        'Cancer': "Emotions may run strong. Consider a cautious approach today.",
        'Leo': "Confidence is high — good for decision-making, but stay grounded.",
        'Virgo': "Analytical clarity is strong. Excellent for detailed review.",
        'Libra': "Balanced perspective — good time for evaluating options.",
        'Scorpio': "Intense focus period — powerful for strategic planning.",
        'Sagittarius': "Optimistic energy — balance enthusiasm with practical assessment.",
        'Capricorn': "Disciplined mindset — excellent for structured decision-making.",
        'Aquarius': "Innovative thinking period — good for new perspectives.",
        'Pisces': "Intuitive phase — trust your instincts but verify with data."
    }
    
    if moon_sign and moon_sign in moon_suggestions:
        suggestions.append(moon_suggestions[moon_sign])
    
    # General timing suggestions based on planetary patterns
    if planets:
        # Check for retrograde patterns (simplified)
        retrogrades = [p for p in planets if p.get('isRetro') == 'true']
        if len(retrogrades) >= 2:
            suggestions.append("Multiple planetary retrogrades suggest a period for review rather than aggressive moves.")
    
    # Return suggestion or fallback
    if suggestions:
        return " ".join(suggestions)
    else:
        return generate_generic_suggestion()

def generate_generic_suggestion():
    """Fallback generic suggestion"""
    generic_suggestions = [
        "Today favors a balanced approach — consider both opportunities and risks carefully.",
        "Clear mindset period — good for planning and research.",
        "Mixed energies today — focus on what you can control and stay patient.",
        "Steady energy — suitable for maintaining current positions and observing.",
        "Moderate volatility expected emotionally — consider taking a measured approach."
    ]
    import random
    return random.choice(generic_suggestions)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
