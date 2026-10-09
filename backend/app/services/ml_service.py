import uuid
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
    r2_score, mean_absolute_error, root_mean_squared_error
)

from .analysis_service import load_dataframe, detect_column_type

# In-memory storage for active trained pipelines for What-If simulator
TRAINED_MODELS_CACHE = {}

def check_ml_suitability(file_path: Path) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    
    reasons = []
    is_suitable = True
    
    if row_count < 15:
        is_suitable = False
        reasons.append(f"Dataset has only {row_count} rows. Machine learning models require at least 15+ samples (recommended 50+) for meaningful generalization.")
        
    if col_count < 2:
        is_suitable = False
        reasons.append(f"Dataset has only {col_count} column. At least 1 feature column and 1 target column are required.")
        
    targets = []
    for col in df.columns:
        series = df[col].dropna()
        if len(series) == 0:
            continue
            
        unique_cnt = series.nunique()
        ctype = detect_column_type(df[col])
        is_id = (unique_cnt / max(1, len(series)) > 0.8 and ctype in ['text', 'categorical'] and row_count > 30) or ('id' in str(col).lower() and unique_cnt > 50)
        
        if is_id:
            continue
            
        if ctype in ['categorical', 'boolean'] or (ctype == 'numerical' and 2 <= unique_cnt <= 15 and series.dtype in [int, np.int64]):
            targets.append({
                "column": str(col),
                "problem_type": "classification",
                "label": f"{col} (Classification, {unique_cnt} classes)",
                "classes_count": unique_cnt,
                "sample_classes": [str(x) for x in series.unique()[:5]]
            })
        elif ctype == 'numerical' and unique_cnt > 5:
            targets.append({
                "column": str(col),
                "problem_type": "regression",
                "label": f"{col} (Regression, Continuous numeric)",
                "classes_count": 0,
                "sample_classes": []
            })
            
    if len(targets) == 0:
        is_suitable = False
        reasons.append("No viable target column candidates detected (all columns are IDs, dates, or constant).")
        
    return {
        "is_suitable": is_suitable,
        "row_count": row_count,
        "col_count": col_count,
        "reasons": reasons,
        "targets": targets
    }

def train_ml_pipeline(file_path: Path, target_col: str, problem_type: Optional[str] = None, model_algo: str = "random_forest") -> Dict[str, Any]:
    df = load_dataframe(file_path)
    
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataset.")
        
    # Drop rows where target is NA
    df_clean = df.dropna(subset=[target_col]).copy()
    if len(df_clean) < 10:
        raise ValueError("Insufficient rows remaining after dropping missing target entries.")
        
    y_raw = df_clean[target_col]
    X_raw = df_clean.drop(columns=[target_col])
    
    # Identify and drop pure ID columns from features
    feature_cols = []
    num_features = []
    cat_features = []
    
    for col in X_raw.columns:
        s = X_raw[col]
        ctype = detect_column_type(s)
        unique_cnt = s.dropna().nunique()
        is_id = (unique_cnt / max(1, len(s)) > 0.85 and ctype in ['text', 'categorical'] and len(df_clean) > 30) or ('id' in str(col).lower() and unique_cnt > 50)
        
        if not is_id and ctype != 'datetime':
            feature_cols.append(col)
            if ctype == 'numerical':
                num_features.append(col)
            else:
                cat_features.append(col)
                
    if len(feature_cols) == 0:
        raise ValueError("No valid predictive features remaining after excluding ID and timestamp columns.")
        
    X = X_raw[feature_cols]
    
    # Auto-detect problem type if not supplied
    if not problem_type or problem_type == "auto":
        target_type = detect_column_type(y_raw)
        if target_type in ['categorical', 'boolean'] or y_raw.nunique() <= 10:
            problem_type = "classification"
        else:
            problem_type = "regression"
            
    # Preprocessing Transformers
    transformers = []
    if num_features:
        num_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        transformers.append(('num', num_transformer, num_features))
        
    if cat_features:
        cat_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        transformers.append(('cat', cat_transformer, cat_features))
        
    preprocessor = ColumnTransformer(transformers=transformers)
    
    # Prepare Train / Test Split
    if problem_type == "classification":
        y = y_raw.astype(str)
        # Check class distribution for stratification
        class_counts = y.value_counts()
        can_stratify = (class_counts.min() >= 2) and (len(class_counts) < len(y) * 0.5)
        strat = y if can_stratify else None
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=strat)
        
        if model_algo == "logistic_regression":
            model = LogisticRegression(max_iter=1000, random_state=42)
            model_display_name = "Logistic Regression"
        elif model_algo == "decision_tree":
            model = DecisionTreeClassifier(max_depth=6, random_state=42)
            model_display_name = "Decision Tree Classifier"
        else:
            model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
            model_display_name = "Random Forest Classifier"
            
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])
        pipeline.fit(X_train, y_train)
        
        y_pred = pipeline.predict(X_test)
        
        # Metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
        rec = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        
        classes = sorted(list(np.unique(np.concatenate([y_train, y_test]))))
        cm = confusion_matrix(y_test, y_pred, labels=classes)
        cm_data = {
            "labels": [str(c) for c in classes],
            "matrix": cm.tolist()
        }
        
        metrics = {
            "accuracy": round(acc * 100, 2),
            "precision": round(prec * 100, 2),
            "recall": round(rec * 100, 2),
            "f1_score": round(f1 * 100, 2),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "classes": [str(c) for c in classes]
        }
        
    else:
        # Regression
        y = pd.to_numeric(y_raw, errors='coerce').fillna(y_raw.median())
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        if model_algo == "ridge":
            model = Ridge(random_state=42)
            model_display_name = "Ridge Linear Regressor"
        else:
            model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
            model_display_name = "Random Forest Regressor"
            
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])
        pipeline.fit(X_train, y_train)
        
        y_pred = pipeline.predict(X_test)
        
        r2 = float(r2_score(y_test, y_pred))
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(root_mean_squared_error(y_test, y_pred))
        
        # Sample Actual vs Predicted points for scatter
        scatter_points = []
        for actual, pred in list(zip(y_test, y_pred))[:60]:
            scatter_points.append({
                "actual": round(float(actual), 2),
                "predicted": round(float(pred), 2)
            })
            
        metrics = {
            "r2_score": round(r2, 4),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mean_target": round(float(y.mean()), 2),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "actual_vs_predicted": scatter_points
        }
        cm_data = None

    # Compute Feature Importances
    feature_importances = []
    try:
        # Extract feature names from preprocessor
        feature_names = []
        if num_features:
            feature_names.extend(num_features)
        if cat_features:
            cat_encoder = pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
            cat_names = cat_encoder.get_feature_names_out(cat_features)
            feature_names.extend(cat_names)
            
        if hasattr(model, 'feature_importances_'):
            raw_importances = model.feature_importances_
            fi_list = [{"feature": str(f), "importance": round(float(imp) * 100, 2)} for f, imp in zip(feature_names, raw_importances)]
            fi_list.sort(key=lambda x: x["importance"], reverse=True)
            feature_importances = fi_list[:10]
        elif hasattr(model, 'coef_'):
            raw_coef = np.abs(model.coef_).flatten()
            total_c = max(0.0001, np.sum(raw_coef))
            fi_list = [{"feature": str(f), "importance": round(float(c / total_c) * 100, 2)} for f, c in zip(feature_names, raw_coef)]
            fi_list.sort(key=lambda x: x["importance"], reverse=True)
            feature_importances = fi_list[:10]
    except Exception:
        pass

    # Dynamic Feature Form Schema for What-If Interactive Simulator
    simulator_features = []
    for col in feature_cols:
        s = df[col].dropna()
        ctype = detect_column_type(s)
        if ctype == 'numerical':
            s_num = pd.to_numeric(s, errors='coerce').dropna()
            simulator_features.append({
                "name": str(col),
                "type": "numerical",
                "default": round(float(s_num.median()), 2) if len(s_num) > 0 else 0,
                "min": round(float(s_num.min()), 2) if len(s_num) > 0 else 0,
                "max": round(float(s_num.max()), 2) if len(s_num) > 0 else 100,
                "step": 1 if s_num.dtype in [int, np.int64] else 0.1
            })
        else:
            opts = [str(x) for x in s.unique()[:10]]
            simulator_features.append({
                "name": str(col),
                "type": "categorical",
                "default": opts[0] if opts else "",
                "options": opts
            })

    # Save to memory cache for live predictions
    model_id = str(uuid.uuid4())
    TRAINED_MODELS_CACHE[model_id] = {
        "pipeline": pipeline,
        "feature_cols": feature_cols,
        "problem_type": problem_type,
        "target_col": target_col,
        "simulator_features": simulator_features
    }

    return {
        "model_id": model_id,
        "model_name": model_display_name,
        "problem_type": problem_type,
        "target_column": target_col,
        "metrics": metrics,
        "confusion_matrix": cm_data,
        "feature_importances": feature_importances,
        "simulator_features": simulator_features
    }

def predict_single(model_id: str, input_dict: Dict[str, Any]) -> Dict[str, Any]:
    if model_id not in TRAINED_MODELS_CACHE:
        raise ValueError("Model session expired or not found. Please re-train model.")
        
    model_entry = TRAINED_MODELS_CACHE[model_id]
    pipeline = model_entry["pipeline"]
    feature_cols = model_entry["feature_cols"]
    problem_type = model_entry["problem_type"]
    
    # Construct single-row dataframe with exact column names
    row_data = {}
    for col in feature_cols:
        val = input_dict.get(col, None)
        row_data[col] = [val]
        
    input_df = pd.DataFrame(row_data)
    pred = pipeline.predict(input_df)[0]
    
    confidence = None
    if problem_type == "classification" and hasattr(pipeline.named_steps['model'], 'predict_proba'):
        try:
            probas = pipeline.predict_proba(input_df)[0]
            max_idx = np.argmax(probas)
            confidence = round(float(probas[max_idx]) * 100, 1)
        except Exception:
            pass
            
    return {
        "prediction": str(pred) if problem_type == "classification" else round(float(pred), 2),
        "confidence": confidence,
        "problem_type": problem_type
    }
