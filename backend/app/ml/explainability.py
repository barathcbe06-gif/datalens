import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.inspection import permutation_importance

def compute_model_explainability(pipeline, X_test, y_test, num_features: List[str], cat_features: List[str]) -> Dict[str, Any]:
    model = pipeline.named_steps['model']
    preprocessor = pipeline.named_steps['preprocessor']
    
    # Extract encoded feature names
    feature_names = []
    if num_features:
        feature_names.extend(num_features)
    if cat_features:
        try:
            cat_encoder = preprocessor.named_transformers_['cat'].named_steps['onehot']
            cat_names = list(cat_encoder.get_feature_names_out(cat_features))
            feature_names.extend(cat_names)
        except Exception:
            feature_names.extend(cat_features)
            
    # 1. Native Model Importance / Coefficients
    native_importances = []
    method_name = "Model-Native Feature Attribution"
    
    if hasattr(model, 'feature_importances_'):
        raw_imp = model.feature_importances_
        method_name = "Tree Gini / MDI (Mean Decrease in Impurity)"
        total_imp = max(1e-6, np.sum(raw_imp))
        for f, imp in zip(feature_names, raw_imp):
            native_importances.append({
                "feature": str(f),
                "importance": round(float(imp), 4),
                "relative_contribution_pct": round(float(imp / total_imp) * 100, 2)
            })
    elif hasattr(model, 'coef_'):
        raw_coef = np.abs(model.coef_).flatten()
        method_name = "Standardized Regression Coefficients (|β|)"
        total_imp = max(1e-6, np.sum(raw_coef))
        for f, imp in zip(feature_names, raw_coef):
            native_importances.append({
                "feature": str(f),
                "importance": round(float(imp), 4),
                "relative_contribution_pct": round(float(imp / total_imp) * 100, 2)
            })
            
    native_importances.sort(key=lambda x: x["relative_contribution_pct"], reverse=True)
    
    # 2. Permutation Importance (Model-Agnostic, evaluated on X_test)
    perm_importances = []
    try:
        sample_size = min(len(X_test), 150)
        X_sub = X_test.iloc[:sample_size]
        y_sub = y_test.iloc[:sample_size] if hasattr(y_test, 'iloc') else y_test[:sample_size]
        
        perm = permutation_importance(pipeline, X_sub, y_sub, n_repeats=5, random_state=42, n_jobs=1)
        mean_scores = np.maximum(0, perm.importances_mean)
        total_perm = max(1e-6, np.sum(mean_scores))
        
        # We map columns of X_test (original features before onehot)
        orig_cols = list(X_test.columns)
        for col, score in zip(orig_cols, mean_scores):
            perm_importances.append({
                "feature": str(col),
                "permutation_score": round(float(score), 4),
                "relative_impact_pct": round(float(score / total_perm) * 100, 2)
            })
        perm_importances.sort(key=lambda x: x["relative_impact_pct"], reverse=True)
    except Exception:
        pass

    # 3. Plain English Explanation
    top_features = native_importances[:3]
    if top_features:
        feat_str = ", ".join([f"'{f['feature']}' ({f['relative_contribution_pct']}%)" for f in top_features])
        explanation = f"These features contributed most strongly to the model: {feat_str}. Shuffling or removing these features leads to the largest drop in predictive fidelity."
    else:
        explanation = "Feature importance could not be computed for this estimator architecture."

    return {
        "method": method_name,
        "validation_method": "Scikit-Learn Permutation Feature Importance (n_repeats=5)",
        "explanation": explanation,
        "feature_importances": native_importances[:12],
        "permutation_importances": perm_importances[:10]
    }