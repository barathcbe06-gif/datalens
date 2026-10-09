import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from ..analysis.profiler import load_dataframe, detect_column_type

def analyze_time_series(file_path: Path, date_col: Optional[str] = None, target_col: Optional[str] = None, horizon: int = 14) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    columns = list(df.columns)
    
    # 1. Identify datetime columns
    date_candidates = [c for c in columns if detect_column_type(df[c]) == 'datetime']
    num_candidates = [c for c in columns if detect_column_type(df[c]) == 'numerical']
    
    if not date_candidates:
        return {
            "is_applicable": False,
            "reason": "No valid temporal (date/time) column detected in the dataset. Time-series analysis requires a chronological index."
        }
        
    if not num_candidates:
        return {
            "is_applicable": False,
            "reason": "No numerical feature found to serve as a forecasting target. Time-series forecasting requires a continuous numerical metric."
        }
        
    selected_date_col = date_col if (date_col and date_col in columns) else date_candidates[0]
    selected_target_col = target_col if (target_col and target_col in columns) else num_candidates[0]
    
    # Clean and parse datetime
    ts_df = df[[selected_date_col, selected_target_col]].dropna().copy()
    ts_df['parsed_date'] = pd.to_datetime(ts_df[selected_date_col], errors='coerce')
    ts_df['target_val'] = pd.to_numeric(ts_df[selected_target_col], errors='coerce')
    ts_df = ts_df.dropna().sort_values(by='parsed_date')
    
    # Aggregate duplicate date stamps by mean
    grouped = ts_df.groupby('parsed_date')['target_val'].mean().reset_index()
    
    if len(grouped) < 10:
        return {
            "is_applicable": False,
            "reason": f"Only {len(grouped)} valid chronological observation points found. Rigorous forecasting requires at least 10 sequential time points to establish trend and autoregressive patterns."
        }
        
    y_series = grouped['target_val'].values
    date_series = grouped['parsed_date'].dt.strftime('%Y-%m-%d').values
    
    # 2. Moving Average Calculation
    window_size = 7 if len(grouped) >= 21 else (3 if len(grouped) >= 9 else 2)
    rolling_series = grouped['target_val'].rolling(window=window_size, min_periods=1).mean().round(2).values
    
    historical_points = []
    for i in range(len(grouped)):
        historical_points.append({
            "date": str(date_series[i]),
            "actual": round(float(y_series[i]), 2),
            "moving_average": round(float(rolling_series[i]), 2)
        })
        
    # 3. Autoregressive Lag + Linear Trend Extrapolation
    horizon = min(max(7, horizon), 60)
    
    # Construct lag features
    lags = 3 if len(y_series) >= 15 else (2 if len(y_series) >= 8 else 1)
    X_train = []
    y_train = []
    
    for i in range(lags, len(y_series)):
        row_feat = [i] # Time trend feature
        for l in range(1, lags + 1):
            row_feat.append(y_series[i - l])
        X_train.append(row_feat)
        y_train.append(y_series[i])
        
    X_train = np.array(X_train)
    y_train = np.array(y_train)
    
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)
    
    fitted_vals = model.predict(X_train)
    residuals = y_train - fitted_vals
    resid_std = float(np.std(residuals)) if len(residuals) > 1 else 1.0
    
    mae = float(mean_absolute_error(y_train, fitted_vals))
    rmse = float(root_mean_squared_error(y_train, fitted_vals))
    non_zero = y_train != 0
    mape = float(np.mean(np.abs((y_train[non_zero] - fitted_vals[non_zero]) / y_train[non_zero])) * 100) if np.any(non_zero) else 0.0
    
    # 4. Multi-step Recursive Forecasting
    forecast_points = []
    current_history = list(y_series)
    last_date = grouped['parsed_date'].iloc[-1]
    
    # Detect frequency step (default 1 day)
    if len(grouped) > 1:
        step_days = max(1, int((last_date - grouped['parsed_date'].iloc[-2]).days))
    else:
        step_days = 1
        
    curr_date = last_date
    for step in range(1, horizon + 1):
        curr_date += pd.Timedelta(days=step_days)
        t_idx = len(current_history)
        feat = [t_idx]
        for l in range(1, lags + 1):
            feat.append(current_history[-l])
            
        pred_val = float(model.predict([feat])[0])
        # Guard against extreme runaway predictions
        pred_val = max(0.0, pred_val)
        current_history.append(pred_val)
        
        ci_margin = 1.96 * resid_std * np.sqrt(1 + (step * 0.05))
        forecast_points.append({
            "date": curr_date.strftime('%Y-%m-%d'),
            "forecast": round(pred_val, 2),
            "lower_bound": round(max(0.0, pred_val - ci_margin), 2),
            "upper_bound": round(pred_val + ci_margin, 2)
        })
        
    # Trend Analysis
    first_half_avg = float(np.mean(y_series[:len(y_series)//2]))
    second_half_avg = float(np.mean(y_series[len(y_series)//2:]))
    if first_half_avg > 0:
        trend_change_pct = round(((second_half_avg - first_half_avg) / first_half_avg) * 100, 1)
    else:
        trend_change_pct = 0.0
        
    trend_direction = "Upward Growth" if trend_change_pct > 3.0 else ("Downward Contraction" if trend_change_pct < -3.0 else "Stable / Horizontal")
    
    return {
        "is_applicable": True,
        "date_column": selected_date_col,
        "target_column": selected_target_col,
        "total_observations": len(grouped),
        "moving_average_window": window_size,
        "trend_summary": {
            "direction": trend_direction,
            "change_pct": trend_change_pct,
            "first_half_mean": round(first_half_avg, 2),
            "second_half_mean": round(second_half_avg, 2)
        },
        "model_performance": {
            "model_type": "Autoregressive Lag Ridge Model + Deterministic Trend",
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape": round(mape, 2)
        },
        "historical_data": historical_points,
        "forecast_data": forecast_points,
        "date_columns_available": date_candidates,
        "numerical_columns_available": num_candidates
    }