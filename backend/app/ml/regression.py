import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

def train_regression_models(preprocessor, X_train, X_test, y_train, y_test) -> List[Dict[str, Any]]:
    models_config = [
        ("Linear Regression (Ridge)", "linear_regression", Ridge(random_state=42)),
        ("Decision Tree Regressor", "decision_tree", DecisionTreeRegressor(max_depth=6, random_state=42)),
        ("Random Forest Regressor", "random_forest", RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42))
    ]
    
    results = []
    
    for display_name, algo_id, estimator in models_config:
        pipe = Pipeline(steps=[('preprocessor', preprocessor), ('model', estimator)])
        
        start_time = time.perf_counter()
        pipe.fit(X_train, y_train)
        latency_ms = round((time.perf_counter() - start_time) * 1000, 1)
        
        y_pred = pipe.predict(X_test)
        
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(root_mean_squared_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))
        
        scatter_points = []
        for actual, pred in list(zip(y_test, y_pred))[:60]:
            scatter_points.append({
                "actual": round(float(actual), 2),
                "predicted": round(float(pred), 2)
            })
            
        results.append({
            "model_name": display_name,
            "algorithm": algo_id,
            "pipeline": pipe,
            "metrics": {
                "r2_score": round(r2, 4),
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "training_time_ms": latency_ms,
                "train_samples": len(X_train),
                "test_samples": len(X_test)
            },
            "actual_vs_predicted": scatter_points
        })
        
    return results