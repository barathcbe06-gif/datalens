import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from ..analysis.profiler import detect_column_type

def prepare_preprocessing_pipeline(df: pd.DataFrame, target_col: str) -> Tuple[Pipeline, pd.DataFrame, pd.Series, List[str], Dict[str, Any]]:
    # Drop rows where target is missing
    df_clean = df.dropna(subset=[target_col]).copy()
    if len(df_clean) < 10:
        raise ValueError("Insufficient records remain after removing missing target rows (at least 10 required).")
        
    y = df_clean[target_col]
    X_raw = df_clean.drop(columns=[target_col])
    
    num_features = []
    cat_features = []
    dropped_features = []
    
    for col in X_raw.columns:
        s = X_raw[col]
        ctype = detect_column_type(s)
        unique_cnt = s.dropna().nunique()
        unique_pct = (unique_cnt / max(1, len(df_clean))) * 100
        
        is_id = (unique_pct > 80 and ctype in ['text', 'categorical'] and len(df_clean) > 25) or \
                (('id' in str(col).lower() or 'code' in str(col).lower()) and unique_pct > 60)
        is_constant = (unique_cnt <= 1)
        
        if is_id or is_constant or ctype == 'datetime':
            dropped_features.append({"column": str(col), "reason": "Identifier / Constant / Datetime"})
        elif ctype == 'numerical':
            num_features.append(str(col))
        else:
            cat_features.append(str(col))
            
    if not num_features and not cat_features:
        raise ValueError("No valid predictive features remain after excluding ID, constant, and timestamp attributes.")
        
    X = X_raw[num_features + cat_features]
    
    transformers = []
    if num_features:
        num_pipe = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        transformers.append(('num', num_pipe, num_features))
        
    if cat_features:
        cat_pipe = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        transformers.append(('cat', cat_pipe, cat_features))
        
    preprocessor = ColumnTransformer(transformers=transformers)
    
    audit = {
        "original_rows": len(df),
        "training_rows": len(df_clean),
        "rows_dropped_target_null": len(df) - len(df_clean),
        "original_columns": len(df.columns),
        "selected_features_count": len(num_features) + len(cat_features),
        "numerical_features": num_features,
        "categorical_features": cat_features,
        "dropped_features": dropped_features,
        "imputation_strategy": {
            "numerical": "Median Imputation",
            "categorical": "Most Frequent Mode Imputation"
        },
        "encoding_strategy": "One-Hot Categorical Encoding (Sparse=False)",
        "scaling_strategy": "StandardScaler (Zero-Mean, Unit-Variance)"
    }
    
    return preprocessor, X, y, num_features, cat_features, audit