"""
Multi-Step XGBoost Model for Stock Price Forecasting
Predicts 5-7 days ahead with trend classification
Uses multi-output XGBoost regression
"""

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from multistep_utils import (
    classify_trend, calculate_confidence, calculate_trend_probabilities,
    create_technical_features
)
import warnings
warnings.filterwarnings('ignore')


def xgboost_multistep_predict(df, forecast_horizon=7, lookback=60):
    """
    Multi-step XGBoost prediction with trend classification
    OPTIMIZED FOR 60%+ ACCURACY
    
    Args:
        df: DataFrame with stock data
        forecast_horizon: Number of days to forecast (default: 7)
        lookback: Number of days to look back (default: 60)
        
    Returns:
        dict with predictions, trends, metrics, and metadata
    """
    try:
        # Create technical features
        data = create_technical_features(df)
        
        if len(data) < lookback + forecast_horizon + 100:
            raise ValueError(f"Insufficient data. Need at least {lookback + forecast_horizon + 100} rows")
        
        # Prepare features
        all_feature_cols = [col for col in data.columns if col not in ['date', 'close', 'open', 'high', 'low', 'volume', 'dividends', 'stock_splits']]
        
        # Create full sequence data
        X_all, y_all = [], []
        for i in range(lookback, len(data) - forecast_horizon):
            X_all.append(data[all_feature_cols].iloc[i-lookback:i].values.flatten())
            y_all.append(data['close'].iloc[i:i+forecast_horizon].values)
        
        X_all = np.array(X_all)
        y_all = np.array(y_all)
        
        # Split data: 80% train, 10% validation, 10% test
        train_size = int(len(X_all) * 0.80)
        val_size = int(len(X_all) * 0.10)
        
        X_train_full = X_all[:train_size]
        y_train = y_all[:train_size]
        X_val_full = X_all[train_size:train_size+val_size]
        y_val = y_all[train_size:train_size+val_size]
        X_test_full = X_all[train_size+val_size:]
        y_test = y_all[train_size+val_size:]
        
        # OPTIMIZATION: Feature Selection using a preliminary XGBoost model
        selector_model = xgb.XGBRegressor(n_estimators=100, max_depth=6, random_state=42, n_jobs=-1)
        selector_model.fit(X_train_full, y_train[:, 0]) # Select based on first day prediction
        
        importances = selector_model.feature_importances_
        indices = np.argsort(importances)[::-1][:100] # Top 100 features
        
        X_train = X_train_full[:, indices]
        X_val = X_val_full[:, indices]
        X_test = X_test_full[:, indices]
        
        # Train separate XGBoost models with OPTIMIZED parameters
        models = []
        for day in range(forecast_horizon):
            model = xgb.XGBRegressor(
                n_estimators=300,
                max_depth=10,
                learning_rate=0.03, # Slightly lower for better generalization
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=42,
                n_jobs=-1,
                tree_method='hist' # Faster training
            )
            model.fit(
                X_train, y_train[:, day],
                eval_set=[(X_val, y_val[:, day])],
                early_stopping_rounds=20,
                verbose=False
            )
            models.append(model)
        
        # Make predictions on test set
        y_pred = np.zeros_like(y_test)
        for day, model in enumerate(models):
            y_pred[:, day] = model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test.flatten(), y_pred.flatten())
        rmse = np.sqrt(mean_squared_error(y_test.flatten(), y_pred.flatten()))
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        actual_directions = np.diff(y_test, axis=1) > 0
        pred_directions = np.diff(y_pred, axis=1) > 0
        directional_accuracy = np.mean(actual_directions == pred_directions) * 100
        
        pred_trends = np.array([classify_trend(pred) for pred in y_pred])
        actual_trends = np.array([classify_trend(actual) for actual in y_test])
        trend_accuracy = np.mean(pred_trends == actual_trends) * 100
        
        # Final prediction for next 7 days
        last_features = data[all_feature_cols].iloc[-lookback:].values.flatten().reshape(1, -1)
        last_features_selected = last_features[:, indices]
        final_predictions = np.array([model.predict(last_features_selected)[0] for model in models])
        
        # Generate forecast dates
        last_date = pd.to_datetime(data['date'].iloc[-1])
        forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_horizon)
        
        final_trend_class = classify_trend(final_predictions)
        final_trend = ['Bearish', 'Sideways', 'Bullish'][final_trend_class]
        confidence = calculate_confidence(final_predictions, y_test.flatten(), mae)
        probabilities = calculate_trend_probabilities(final_predictions, confidence)
        
        test_start_idx = lookback + train_size + val_size
        test_dates = data['date'].iloc[test_start_idx:test_start_idx+len(y_test)].values
        
        return {
            'predictions': final_predictions.tolist(),
            'forecast_dates': [str(d.date()) for d in forecast_dates],
            'trend': {
                'direction': final_trend,
                'confidence': confidence,
                'probabilities': probabilities
            },
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'mape': float(mape),
                'directional_accuracy': float(directional_accuracy),
                'trend_accuracy': float(trend_accuracy)
            },
            'test_results': {
                'predictions': y_pred[-10:].tolist() if len(y_pred) >= 10 else y_pred.tolist(),
                'actual': y_test[-10:].tolist() if len(y_test) >= 10 else y_test.tolist(),
                'dates': [str(d) for d in test_dates[-10:]] if len(test_dates) >= 10 else [str(d) for d in test_dates]
            },
            'metadata': {
                'name': 'Multi-Step XGBoost (Optimized)',
                'description': f'Optimized XGBoost with feature selection predicting {forecast_horizon} days ahead',
                'parameters': {
                    'n_estimators': 300,
                    'max_depth': 10,
                    'learning_rate': 0.03,
                    'features_kept': 100
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"Multi-step XGBoost prediction error: {str(e)}")
    """
    Multi-step XGBoost prediction with trend classification
    
    Args:
        df: DataFrame with stock data
        forecast_horizon: Number of days to forecast (default: 7)
        lookback: Number of days to look back (default: 60)
        
    Returns:
        dict with predictions, trends, metrics, and metadata
    """
    try:
        # Create technical features
        data = create_technical_features(df)
        
        if len(data) < lookback + forecast_horizon + 100:
            raise ValueError(f"Insufficient data. Need at least {lookback + forecast_horizon + 100} rows")
        
        # Prepare features
        feature_cols = [col for col in data.columns if col not in ['date', 'close', 'open', 'high', 'low', 'volume', 'dividends', 'stock_splits']]
        
        # Create sequences for multi-step prediction
        X, y_multi = [], []
        
        for i in range(lookback, len(data) - forecast_horizon):
            # Input: last 'lookback' days of features
            X.append(data[feature_cols].iloc[i-lookback:i].values.flatten())
            
            # Output: next 'forecast_horizon' days of close prices
            y_multi.append(data['close'].iloc[i:i+forecast_horizon].values)
        
        X = np.array(X)
        y_multi = np.array(y_multi)
        
        # Split data: 70% train, 15% validation, 15% test
        train_size = int(len(X) * 0.70)
        val_size = int(len(X) * 0.15)
        
        X_train = X[:train_size]
        y_train = y_multi[:train_size]
        
        X_val = X[train_size:train_size+val_size]
        y_val = y_multi[train_size:train_size+val_size]
        
        X_test = X[train_size+val_size:]
        y_test = y_multi[train_size+val_size:]
        
        # Train separate XGBoost model for each forecast day
        models = []
        for day in range(forecast_horizon):
            model = xgb.XGBRegressor(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
            model.fit(
                X_train, y_train[:, day],
                eval_set=[(X_val, y_val[:, day])],
                early_stopping_rounds=10,
                verbose=False
            )
            models.append(model)
        
        # Make predictions on test set
        y_pred = np.zeros_like(y_test)
        for day, model in enumerate(models):
            y_pred[:, day] = model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test.flatten(), y_pred.flatten())
        rmse = np.sqrt(mean_squared_error(y_test.flatten(), y_pred.flatten()))
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
        
        # Directional accuracy
        actual_directions = np.diff(y_test, axis=1) > 0
        pred_directions = np.diff(y_pred, axis=1) > 0
        directional_accuracy = np.mean(actual_directions == pred_directions) * 100
        
        # Trend classification
        pred_trends = np.array([classify_trend(pred) for pred in y_pred])
        actual_trends = np.array([classify_trend(actual) for actual in y_test])
        trend_accuracy = np.mean(pred_trends == actual_trends) * 100
        
        # Final prediction for next 7 days
        last_features = data[feature_cols].iloc[-lookback:].values.flatten().reshape(1, -1)
        final_predictions = np.array([model.predict(last_features)[0] for model in models])
        
        # Generate forecast dates
        last_date = pd.to_datetime(data['date'].iloc[-1])
        forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_horizon)
        
        # Trend classification for final prediction
        final_trend_class = classify_trend(final_predictions)
        final_trend = ['Bearish', 'Sideways', 'Bullish'][final_trend_class]
        confidence = calculate_confidence(final_predictions, y_test.flatten(), mae)
        probabilities = calculate_trend_probabilities(final_predictions, confidence)
        
        # Get test dates
        test_start_idx = lookback + train_size + val_size
        test_dates = data['date'].iloc[test_start_idx:test_start_idx+len(y_test)].values
        
        return {
            'predictions': final_predictions.tolist(),
            'forecast_dates': [str(d.date()) for d in forecast_dates],
            'trend': {
                'direction': final_trend,
                'confidence': confidence,
                'probabilities': probabilities
            },
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'mape': float(mape),
                'directional_accuracy': float(directional_accuracy),
                'trend_accuracy': float(trend_accuracy)
            },
            'test_results': {
                'predictions': y_pred[-10:].tolist(),
                'actual': y_test[-10:].tolist(),
                'dates': [str(d) for d in test_dates[-10:]]
            },
            'metadata': {
                'name': 'Multi-Step XGBoost',
                'description': f'XGBoost model predicting {forecast_horizon} days ahead with trend classification',
                'parameters': {
                    'n_estimators': 200,
                    'max_depth': 8,
                    'learning_rate': 0.05,
                    'lookback': lookback,
                    'forecast_horizon': forecast_horizon,
                    'features_used': len(feature_cols)
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"Multi-step XGBoost prediction error: {str(e)}")
