import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train_classification_models(preprocessor, X_train, X_test, y_train, y_test) -> List[Dict[str, Any]]:
    models_config = [
        ("Logistic Regression", "logistic_regression", LogisticRegression(max_iter=1000, random_state=42)),
        ("Decision Tree Classifier", "decision_tree", DecisionTreeClassifier(max_depth=6, random_state=42)),
        ("Random Forest Classifier", "random_forest", RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
    ]
    
    classes = sorted(list(np.unique(np.concatenate([y_train, y_test]))))
    class_labels = [str(c) for c in classes]
    results = []
    
    for display_name, algo_id, estimator in models_config:
        pipe = Pipeline(steps=[('preprocessor', preprocessor), ('model', estimator)])
        
        start_time = time.perf_counter()
        pipe.fit(X_train, y_train)
        latency_ms = round((time.perf_counter() - start_time) * 1000, 1)
        
        y_pred = pipe.predict(X_test)
        
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
        rec = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        
        cm = confusion_matrix(y_test, y_pred, labels=classes)
        
        results.append({
            "model_name": display_name,
            "algorithm": algo_id,
            "pipeline": pipe,
            "metrics": {
                "accuracy": round(acc * 100, 2),
                "precision": round(prec * 100, 2),
                "recall": round(rec * 100, 2),
                "f1_score": round(f1 * 100, 2),
                "training_time_ms": latency_ms,
                "train_samples": len(X_train),
                "test_samples": len(X_test)
            },
            "confusion_matrix": {
                "labels": class_labels,
                "matrix": cm.tolist()
            }
        })
        
    return results