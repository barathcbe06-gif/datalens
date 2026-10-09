import numpy as np
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from .profiler import load_dataframe, detect_column_type

def detect_outliers(file_path: Path, contamination: float = 0.05) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    
    num_cols = [c for c in df.columns if detect_column_type(df[c]) == 'numerical']
    
    if not num_cols:
        return {
            "has_numerical_features": False,
            "message": "No numerical features available for outlier detection."
        }
        
    # 1. Univariate IQR Method
    iqr_results = {}
    iqr_affected_indices = set()
    
    for col in num_cols:
        s = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(s) < 8:
            continue
            
        q25 = float(s.quantile(0.25))
        q75 = float(s.quantile(0.75))
        iqr = q75 - q25
        
        if iqr == 0:
            continue
            
        lower_bound = q25 - 1.5 * iqr
        upper_bound = q75 + 1.5 * iqr
        
        outlier_mask = (s < lower_bound) | (s > upper_bound)
        outlier_series = s[outlier_mask]
        outlier_cnt = int(len(outlier_series))
        
        if outlier_cnt > 0:
            for idx in outlier_series.index:
                iqr_affected_indices.add(idx)
                
            sample_vals = [round(float(v), 2) for v in outlier_series.head(6).tolist()]
            iqr_results[col] = {
                "outlier_count": outlier_cnt,
                "outlier_percentage": round((outlier_cnt / len(s)) * 100, 2),
                "lower_bound": round(lower_bound, 2),
                "upper_bound": round(upper_bound, 2),
                "min_outlier": round(float(outlier_series.min()), 2),
                "max_outlier": round(float(outlier_series.max()), 2),
                "sample_values": sample_vals
            }
            
    iqr_total_affected = len(iqr_affected_indices)
    iqr_total_pct = round((iqr_total_affected / max(1, row_count)) * 100, 2)
    
    # 2. Multivariate Isolation Forest Method
    iso_total_affected = 0
    iso_total_pct = 0.0
    iso_sample_indices = []
    
    try:
        sub_df = df[num_cols].apply(pd.to_numeric, errors='coerce')
        # Impute and Scale
        imputer = SimpleImputer(strategy='median')
        X_imputed = imputer.fit_transform(sub_df)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_imputed)
        
        # Fit Isolation Forest
        clf = IsolationForest(
            contamination=min(0.15, max(0.01, contamination)),
            random_state=42,
            n_estimators=100
        )
        preds = clf.fit_predict(X_scaled)
        scores = clf.decision_function(X_scaled)
        
        outlier_mask = (preds == -1)
        iso_total_affected = int(outlier_mask.sum())
        iso_total_pct = round((iso_total_affected / max(1, row_count)) * 100, 2)
        
        iso_sample_indices = [int(i) for i in np.where(outlier_mask)[0][:15]]
    except Exception:
        pass
        
    return {
        "has_numerical_features": True,
        "row_count": row_count,
        "iqr_method": {
            "total_outliers_rows": iqr_total_affected,
            "outliers_percentage": iqr_total_pct,
            "columns_with_outliers_count": len(iqr_results),
            "column_details": iqr_results
        },
        "isolation_forest": {
            "total_outliers_rows": iso_total_affected,
            "outliers_percentage": iso_total_pct,
            "contamination_parameter": round(contamination, 2),
            "sample_anomaly_indices": iso_sample_indices
        },
        "interpretation": "Statistical outliers represent distribution tails or natural real-world variability and should not be dropped automatically without business domain validation."
    }