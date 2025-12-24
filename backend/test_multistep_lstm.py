"""
Test script for Multi-Step LSTM Model
Tests the new 5-7 day forecasting model with trend classification
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.fetch_data import fetch_stock_data
from models.lstm_multistep_model import lstm_multistep_predict
import json

def test_multistep_lstm():
    """Test the multi-step LSTM model"""
    print("=" * 80)
    print("Testing Multi-Step LSTM Model")
    print("=" * 80)
    
    # Test symbols
    symbols = ['AAPL', 'GOOGL', 'MSFT']
    
    for symbol in symbols:
        print(f"\n{'='*80}")
        print(f"Testing {symbol}")
        print(f"{'='*80}\n")
        
        try:
            # Fetch data
            print(f"Fetching data for {symbol}...")
            df = fetch_stock_data(symbol, period='5y', interval='1d')
            print(f"✓ Data fetched: {len(df)} rows")
            
            # Run prediction
            print(f"\nRunning multi-step LSTM prediction...")
            result = lstm_multistep_predict(df, forecast_horizon=7, lookback=60, epochs=30)
            
            # Display results
            print(f"\n{'─'*80}")
            print("PREDICTION RESULTS")
            print(f"{'─'*80}")
            
            # Forecast
            print(f"\n📊 7-Day Price Forecast:")
            for i, (date, price) in enumerate(zip(result['forecast_dates'], result['predictions']), 1):
                print(f"  Day {i} ({date}): ${price:.2f}")
            
            # Trend
            trend_info = result['trend']
            print(f"\n📈 Trend Classification:")
            print(f"  Direction: {trend_info['direction']}")
            print(f"  Confidence: {trend_info['confidence']:.1f}%")
            print(f"\n  Probabilities:")
            print(f"    Bearish:  {trend_info['probabilities']['bearish']:.1f}%")
            print(f"    Sideways: {trend_info['probabilities']['sideways']:.1f}%")
            print(f"    Bullish:  {trend_info['probabilities']['bullish']:.1f}%")
            
            # Metrics
            metrics = result['metrics']
            print(f"\n📏 Model Performance Metrics:")
            print(f"  MAE (Mean Absolute Error):      ${metrics['mae']:.2f}")
            print(f"  RMSE (Root Mean Squared Error): ${metrics['rmse']:.2f}")
            print(f"  MAPE (Mean Abs % Error):        {metrics['mape']:.2f}%")
            print(f"  Directional Accuracy:           {metrics['directional_accuracy']:.1f}%")
            print(f"  Trend Classification Accuracy:  {metrics['trend_accuracy']:.1f}%")
            
            # Metadata
            metadata = result['metadata']
            print(f"\n⚙️  Model Configuration:")
            print(f"  Architecture: {metadata['parameters']['architecture']}")
            print(f"  Lookback Period: {metadata['parameters']['lookback']} days")
            print(f"  Forecast Horizon: {metadata['parameters']['forecast_horizon']} days")
            print(f"  Epochs Trained: {metadata['parameters']['epochs_trained']}")
            print(f"  Features Used: {metadata['parameters']['features_used']}")
            
            # Confusion Matrix
            print(f"\n📊 Trend Classification Confusion Matrix:")
            print(f"  (Rows: Actual, Columns: Predicted)")
            print(f"  Classes: [Bearish, Sideways, Bullish]")
            cm = result['confusion_matrix']
            for i, row in enumerate(cm):
                class_name = ['Bearish', 'Sideways', 'Bullish'][i]
                print(f"  {class_name:8s}: {row}")
            
            print(f"\n✅ Test passed for {symbol}!")
            
        except Exception as e:
            print(f"\n❌ Error testing {symbol}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print(f"\n{'='*80}")
    print("All tests completed!")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    test_multistep_lstm()
