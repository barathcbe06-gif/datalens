import uuid
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path
from sklearn.model_selection import train_test_split

from ..analysis.profiler import load_dataframe, detect_column_type
from .preprocessing import prepare_preprocessing_pipeline
from .classification import train_classification_models
from .regression import train_regression_models
from .explainability import compute_model_explainability

TRAINED_MODELS_CACHE: Dict[str, Any] = {}

def inspect_ml_targets(file_path: Path) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    
    if row_count < 12:
        return {
            "is_suitable": False,
            "message": f"Dataset has only {row_count} rows. Machine learning modeling requires at least 15+ observations for cross-validation.",
            "targets": []
        }
        
    targets = []
    for col in df.columns:
        s = df[col].dropna()
        if len(s) == 0:
            continue
            
        ctype = detect_column_type(s)
        unique_cnt = int(s.nunique())
        unique_pct = (unique_cnt / max(1, len(s))) * 100
        
        is_id = (unique_pct > 80 and ctype in ['text', 'categorical'] and row_count > 25) or \
                (('id' in str(col).lower() or 'code' in str(col).lower()) and unique_pct > 60)
        is_constant = (unique_cnt <= 1)
        
        if is_id or is_constant or ctype == 'datetime':
            continue
            
        if ctype in ['categorical', 'boolean'] or (ctype == 'numerical' and 2 <= unique_cnt <= 10):
            targets.append({
                "column": str(col),
                "problem_type": "classification",
                "label": f"{col} (Classification - {unique_cnt} distinct classes)",
                "classes_count": unique_cnt,
                "sample_classes": [str(x) for x in s.unique()[:6]]
            })
        elif ctype == 'numerical' and unique_cnt > 5:
            targets.append({
                "column": str(col),
                "problem_type": "regression",
                "label": f"{col} (Regression - Continuous real numerical values)",
                "classes_count": 0,
                "sample_classes": []
            })
            
    return {
        "is_suitable": len(targets) > 0,
        "row_count": row_count,
        "col_count": col_count,
        "targets": targets
    }

def run_automl_pipeline(file_path: Path, target_col: str, problem_type: Optional[str] = "auto") -> Dict[str, Any]:
    df = load_dataframe(file_path)
    
    if target_col not in df.columns:
        raise ValueError(f"Target feature '{target_col}' not found in dataset columns.")
        
    preprocessor, X, y_raw, num_features, cat_features, audit = prepare_preprocessing_pipeline(df, target_col)
    
    # Auto determine problem type if auto
    if not problem_type or problem_type == "auto":
        target_ctype = detect_column_type(y_raw)
        if target_ctype in ['categorical', 'boolean'] or y_raw.nunique() <= 10:
            problem_type = "classification"
        else:
            problem_type = "regression"
            
    if problem_type == "classification":
        y = y_raw.astype(str)
        # Check stratification eligibility
        val_counts = y.value_counts()
        can_stratify = (val_counts.min() >= 2) and (len(val_counts) < len(y) * 0.4)
        strat = y if can_stratify else None
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=strat)
        models_results = train_classification_models(preprocessor, X_train, X_test, y_train, y_test)
        
        # Determine champion based on F1-Score
        models_results.sort(key=lambda m: m["metrics"]["f1_score"], reverse=True)
        champion = models_results[0]
        champion_metric = "F1 Score (Weighted)"
        champion_val = champion["metrics"]["f1_score"]
        selection_rationale = f"Selected '{champion['model_name']}' as champion with the highest F1 Score ({champion_val}%). F1 score harmonizes precision and recall, guarding against class imbalance bias."
        
    else:
        # Regression
        y = pd.to_numeric(y_raw, errors='coerce').fillna(y_raw.median())
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        models_results = train_regression_models(preprocessor, X_train, X_test, y_train, y_test)
        
        # Determine champion based on R2 Score
        models_results.sort(key=lambda m: m["metrics"]["r2_score"], reverse=True)
        champion = models_results[0]
        champion_metric = "R² Coefficient of Determination"
        champion_val = champion["metrics"]["r2_score"]
        selection_rationale = f"Selected '{champion['model_name']}' as champion with the highest R² score ({champion_val:.4f}) and lowest RMSE ({champion['metrics']['rmse']}). R² measures the proportion of variance explained by the model."

    # Explainability on Champion Model
    explainability = compute_model_explainability(
        champion["pipeline"], X_test, y_test, num_features, cat_features
    )
    
    # Form Schema for Interactive Simulator
    simulator_features = []
    for col in (num_features + cat_features):
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
            opts = [str(x) for x in s.unique()[:15]]
            simulator_features.append({
                "name": str(col),
                "type": "categorical",
                "default": opts[0] if opts else "",
                "options": opts
            })

    # Cache champion model in memory
    model_id = str(uuid.uuid4())
    TRAINED_MODELS_CACHE[model_id] = {
        "pipeline": champion["pipeline"],
        "num_features": num_features,
        "cat_features": cat_features,
        "feature_cols": num_features + cat_features,
        "problem_type": problem_type,
        "target_col": target_col,
        "simulator_features": simulator_features
    }

    # Format leaderboard (strip pipeline object before returning JSON)
    leaderboard = []
    for m in models_results:
        leaderboard.append({
            "model_name": m["model_name"],
            "algorithm": m["algorithm"],
            "metrics": m["metrics"],
            "confusion_matrix": m.get("confusion_matrix"),
            "actual_vs_predicted": m.get("actual_vs_predicted")
        })

    return {
        "model_id": model_id,
        "target_column": target_col,
        "problem_type": problem_type,
        "champion_model": {
            "name": champion["model_name"],
            "algorithm": champion["algorithm"],
            "metric_used": champion_metric,
            "metric_value": champion_val,
            "metrics": champion["metrics"],
            "rationale": selection_rationale
        },
        "leaderboard": leaderboard,
        "preprocessing_audit": audit,
        "explainability": explainability,
        "simulator_features": simulator_features
    }

def predict_single_what_if(model_id: str, input_dict: Dict[str, Any]) -> Dict[str, Any]:
    if model_id not in TRAINED_MODELS_CACHE:
        raise ValueError("Model session expired or not found. Please train an AutoML model first.")
        
    entry = TRAINED_MODELS_CACHE[model_id]
    pipeline = entry["pipeline"]
    feature_cols = entry["feature_cols"]
    problem_type = entry["problem_type"]
    
    row_data = {}
    for col in feature_cols:
        row_data[col] = [input_dict.get(col, None)]
        
    input_df = pd.DataFrame(row_data)
    pred = pipeline.predict(input_df)[0]
    
    confidence = None
    class_probabilities = []
    if problem_type == "classification" and hasattr(pipeline.named_steps['model'], 'predict_proba'):
        try:
            probas = pipeline.predict_proba(input_df)[0]
            classes = pipeline.named_steps['model'].classes_
            for c, p in zip(classes, probas):
                class_probabilities.append({
                    "class": str(c),
                    "probability_pct": round(float(p) * 100, 2)
                })
            max_idx = np.argmax(probas)
            confidence = round(float(probas[max_idx]) * 100, 1)
        except Exception:
            pass
            
    return {
        "prediction": str(pred) if problem_type == "classification" else round(float(pred), 2),
        "confidence": confidence,
        "class_probabilities": class_probabilities,
        "problem_type": problem_type
    }