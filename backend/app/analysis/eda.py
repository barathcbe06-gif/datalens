import numpy as np
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path
from .profiler import load_dataframe, detect_column_type

def perform_eda(file_path: Path) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    
    numerical_stats = {}
    categorical_stats = {}
    numerical_cols = []
    categorical_cols = []
    
    for col in df.columns:
        series = df[col]
        ctype = detect_column_type(series)
        
        if ctype == 'numerical':
            numerical_cols.append(str(col))
            s_clean = pd.to_numeric(series, errors='coerce').dropna()
            if len(s_clean) > 0:
                mean_val = float(s_clean.mean())
                median_val = float(s_clean.median())
                std_val = float(s_clean.std()) if len(s_clean) > 1 else 0.0
                var_val = float(s_clean.var()) if len(s_clean) > 1 else 0.0
                min_val = float(s_clean.min())
                max_val = float(s_clean.max())
                q25 = float(s_clean.quantile(0.25))
                q50 = float(s_clean.quantile(0.50))
                q75 = float(s_clean.quantile(0.75))
                iqr_val = q75 - q25
                
                # Mode
                mode_series = s_clean.mode()
                mode_val = float(mode_series.iloc[0]) if len(mode_series) > 0 else median_val
                
                # Skewness and Kurtosis
                skew_val = float(s_clean.skew()) if len(s_clean) > 2 else 0.0
                kurt_val = float(s_clean.kurt()) if len(s_clean) > 3 else 0.0
                
                zeros_cnt = int((s_clean == 0).sum())
                zeros_pct = round((zeros_cnt / len(s_clean)) * 100, 2)
                
                # IQR Outlier count
                lower_b = q25 - 1.5 * iqr_val
                upper_b = q75 + 1.5 * iqr_val
                outliers_cnt = int(((s_clean < lower_b) | (s_clean > upper_b)).sum())
                
                numerical_stats[str(col)] = {
                    "count": int(len(s_clean)),
                    "mean": round(mean_val, 3),
                    "median": round(median_val, 3),
                    "mode": round(mode_val, 3),
                    "std": round(std_val, 3),
                    "variance": round(var_val, 3),
                    "min": round(min_val, 3),
                    "max": round(max_val, 3),
                    "range": round(max_val - min_val, 3),
                    "q25": round(q25, 3),
                    "q50": round(q50, 3),
                    "q75": round(q75, 3),
                    "iqr": round(iqr_val, 3),
                    "skewness": round(skew_val, 3),
                    "kurtosis": round(kurt_val, 3),
                    "zeros_count": zeros_cnt,
                    "zeros_pct": zeros_pct,
                    "outliers_count": outliers_cnt,
                    "outliers_pct": round((outliers_cnt / len(s_clean)) * 100, 2)
                }
                
        elif ctype in ['categorical', 'boolean', 'text']:
            categorical_cols.append(str(col))
            s_valid = series.dropna().astype(str)
            val_counts = s_valid.value_counts()
            top_cat = str(val_counts.index[0]) if len(val_counts) > 0 else "N/A"
            top_cnt = int(val_counts.iloc[0]) if len(val_counts) > 0 else 0
            
            distribution = []
            for val, cnt in val_counts.head(10).items():
                distribution.append({
                    "category": str(val),
                    "count": int(cnt),
                    "percentage": round((cnt / max(1, len(s_valid))) * 100, 2)
                })
                
            categorical_stats[str(col)] = {
                "count": int(len(s_valid)),
                "unique_count": int(s_valid.nunique()),
                "top_category": top_cat,
                "top_count": top_cnt,
                "top_pct": round((top_cnt / max(1, len(s_valid))) * 100, 2),
                "distribution": distribution
            }

    # Pearson Correlation Matrix & Pairwise Rankings
    correlations = []
    correlation_matrix = None
    if len(numerical_cols) >= 2:
        try:
            num_df = df[numerical_cols].apply(pd.to_numeric, errors='coerce')
            corr_df = num_df.corr().round(3)
            cols = list(corr_df.columns)
            
            matrix_rows = []
            for r_col in cols:
                row_data = {"feature": r_col}
                for c_col in cols:
                    v = corr_df.loc[r_col, c_col]
                    row_data[c_col] = 0.0 if np.isnan(v) else float(v)
                matrix_rows.append(row_data)
                
            correlation_matrix = {
                "columns": cols,
                "matrix": matrix_rows
            }
            
            for i in range(len(cols)):
                for j in range(i + 1, len(cols)):
                    c1, c2 = cols[i], cols[j]
                    val = corr_df.loc[c1, c2]
                    if not np.isnan(val):
                        r_val = float(val)
                        abs_r = abs(r_val)
                        if abs_r >= 0.7:
                            strength = "Very Strong"
                        elif abs_r >= 0.5:
                            strength = "Strong"
                        elif abs_r >= 0.3:
                            strength = "Moderate"
                        else:
                            strength = "Weak"
                        direction = "Positive" if r_val > 0 else "Negative"
                        
                        correlations.append({
                            "feature_1": c1,
                            "feature_2": c2,
                            "correlation": round(r_val, 3),
                            "abs_corr": round(abs_r, 3),
                            "relationship": f"{strength} {direction}"
                        })
            correlations.sort(key=lambda x: x["abs_corr"], reverse=True)
        except Exception:
            pass

    return {
        "numerical_stats": numerical_stats,
        "categorical_stats": categorical_stats,
        "correlation_matrix": correlation_matrix,
        "correlations": correlations[:25],
        "numerical_columns": numerical_cols,
        "categorical_columns": categorical_cols
    }