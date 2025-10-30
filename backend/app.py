from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import utilities
from utils.fetch_data import fetch_stock_data

# Import strategies
from strategies.ema_crossover import ema_crossover_strategy
from strategies.rsi_strategy import rsi_strategy
from strategies.macd_strategy import macd_strategy
from strategies.bollinger_scalping import bollinger_scalping_strategy
from strategies.supertrend import supertrend_strategy

# Import models
from models.lstm_model import lstm_predict
from models.prophet_model import prophet_predict
from models.arima_model import arima_predict
from models.randomforest_model import randomforest_predict
from models.xgboost_model import xgboost_predict

# Import chatbot
from chatbot.perplexity_bot import chat_with_perplexity

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'simple', 'CACHE_DEFAULT_TIMEOUT': 300})

# Strategy mapping
STRATEGIES = {
    'ema_crossover': ema_crossover_strategy,
    'rsi': rsi_strategy,
    'macd': macd_strategy,
    'bollinger_scalping': bollinger_scalping_strategy,
    'supertrend': supertrend_strategy
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
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    Chat with FinBot AI
    
    Request Body:
        message: User's message
        conversation_history: Previous conversation (optional)
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        conversation_history = data.get('conversation_history', None)
        
        # Get response from Perplexity
        result = chat_with_perplexity(user_message, conversation_history)
        
        return jsonify(result)
    
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
