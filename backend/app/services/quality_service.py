import numpy as np
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path
from .analysis_service import load_dataframe, detect_column_type

def calculate_data_quality(file_path: Path) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    total_cells = max(1, row_count * col_count)
    
    # 1. Completeness Calculation (Max 35 points)
    total_missing = int(df.isna().sum().sum())
    missing_ratio = total_missing / total_cells
    completeness_score = max(0.0, min(35.0, 35.0 * (1.0 - (missing_ratio * 2.0))))
    completeness_score = round(completeness_score, 1)
    
    # 2. Uniqueness Calculation (Max 25 points)
    duplicate_rows = int(df.duplicated().sum())
    duplicate_ratio = duplicate_rows / max(1, row_count)
    uniqueness_score = max(0.0, min(25.0, 25.0 * (1.0 - (duplicate_ratio * 3.0))))
    uniqueness_score = round(uniqueness_score, 1)
    
    # 3. Validity Calculation (Max 25 points)
    # Penalize columns that are completely null, constant (zero variance), or contain high anomaly counts
    validity_deductions = 0.0
    issues = []
    
    for col in df.columns:
        series = df[col]
        col_missing = series.isna().sum()
        col_missing_pct = (col_missing / max(1, row_count)) * 100
        
        # High missing rate
        if col_missing_pct > 60:
            validity_deductions += 5.0
            issues.append({
                "severity": "critical",
                "category": "Completeness",
                "column": str(col),
                "title": f"Excessive Missing Values ({col_missing_pct:.1f}%)",
                "impact": f"Over 60% of entries in '{col}' are missing.",
                "action": f"Consider dropping column '{col}' or collecting more data."
            })
        elif col_missing_pct > 5:
            issues.append({
                "severity": "warning",
                "category": "Completeness",
                "column": str(col),
                "title": f"Missing Values ({col_missing_pct:.1f}%)",
                "impact": f"{col_missing} rows have null values in '{col}'.",
                "action": f"Apply imputation (median for numeric, mode for categorical)."
            })
            
        # Constant / Zero Variance
        unique_vals = series.dropna().nunique()
        if unique_vals <= 1 and len(series.dropna()) > 0:
            validity_deductions += 4.0
            issues.append({
                "severity": "warning",
                "category": "Validity",
                "column": str(col),
                "title": f"Zero Variance / Constant Column",
                "impact": f"Column '{col}' only has 1 unique value across all records.",
                "action": f"Drop '{col}' as it provides zero variance/information for ML or analysis."
            })
            
        # Check for empty strings in object columns
        if series.dtype == 'object':
            empty_str_count = int((series.astype(str).str.strip() == '').sum())
            if empty_str_count > 0:
                validity_deductions += 2.0
                issues.append({
                    "severity": "warning",
                    "category": "Validity",
                    "column": str(col),
                    "title": f"Empty Whitespace Strings ({empty_str_count} rows)",
                    "impact": f"Blank string entries detected in text column '{col}'.",
                    "action": f"Replace blank whitespace with proper NaN nulls."
                })
                
    validity_score = max(0.0, min(25.0, 25.0 - validity_deductions))
    validity_score = round(validity_score, 1)
    
    # 4. Consistency Calculation (Max 15 points)
    consistency_deductions = 0.0
    # Check for mixed types or high cardinality ID columns
    for col in df.columns:
        series = df[col]
        if series.dtype == 'object':
            # Check if numbers are stored as strings
            sample_clean = series.dropna().head(20)
            numeric_like = 0
            for v in sample_clean:
                try:
                    float(str(v).replace('$', '').replace(',', '').strip())
                    numeric_like += 1
                except ValueError:
                    pass
            if numeric_like > len(sample_clean) * 0.8 and len(sample_clean) > 5:
                consistency_deductions += 3.0
                issues.append({
                    "severity": "info",
                    "category": "Consistency",
                    "column": str(col),
                    "title": f"Numeric Data Stored as Text",
                    "impact": f"Column '{col}' appears numeric but formatted as text strings.",
                    "action": f"Cast '{col}' to numeric datatype for mathematical operations."
                })
                
    consistency_score = max(0.0, min(15.0, 15.0 - consistency_deductions))
    consistency_score = round(consistency_score, 1)
    
    # Duplicate rows issue
    if duplicate_rows > 0:
        issues.append({
            "severity": "warning" if duplicate_ratio < 0.1 else "critical",
            "category": "Uniqueness",
            "column": "Global (Entire Row)",
            "title": f"{duplicate_rows:,} Duplicate Records Detected",
            "impact": f"{duplicate_ratio * 100:.1f}% duplicate row redundancy.",
            "action": "Use drop_duplicates() to remove identical rows."
        })
        
    total_score = round(completeness_score + uniqueness_score + validity_score + consistency_score, 1)
    
    if total_score >= 90:
        grade = "Excellent"
        grade_badge = "bg-emerald-100 text-emerald-800 border-emerald-300"
        summary_text = "The dataset has high fidelity, minimal missing values, and high structural validity. Ready for production modeling."
    elif total_score >= 75:
        grade = "Good"
        grade_badge = "bg-blue-100 text-blue-800 border-blue-300"
        summary_text = "The dataset is solid with minor data hygiene opportunities. Basic imputation or deduplication is advised."
    elif total_score >= 55:
        grade = "Moderate"
        grade_badge = "bg-amber-100 text-amber-800 border-amber-300"
        summary_text = "Noticeable data hygiene issues detected (missing data or duplicates). Preprocessing recommended before training models."
    else:
        grade = "Needs Attention"
        grade_badge = "bg-rose-100 text-rose-800 border-rose-300"
        summary_text = "Significant data quality anomalies found. Requires cleaning, null handling, and type corrections."

    # Automated cleaning suggestions list
    recommendations = []
    if total_missing > 0:
        recommendations.append("Handle missing values: apply median imputation for numeric features and mode/unknown for categorical.")
    if duplicate_rows > 0:
        recommendations.append("Deduplicate dataset: drop exact duplicate rows to prevent overfitting and sample weighting distortions.")
    recommendations.append("Scale numerical features (StandardScaler or MinMaxScaler) before training distance-based ML models.")
    recommendations.append("One-Hot Encode nominal categorical features for machine learning pipelines.")

    return {
        "overall_score": total_score,
        "grade": grade,
        "grade_badge": grade_badge,
        "summary_text": summary_text,
        "breakdown": {
            "completeness": {
                "score": completeness_score,
                "max": 35,
                "percentage": round((completeness_score / 35) * 100, 1),
                "description": "Evaluates missing, null, and NaN entries across all features."
            },
            "uniqueness": {
                "score": uniqueness_score,
                "max": 25,
                "percentage": round((uniqueness_score / 25) * 100, 1),
                "description": "Measures row duplication and entity record redundancy."
            },
            "validity": {
                "score": validity_score,
                "max": 25,
                "percentage": round((validity_score / 25) * 100, 1),
                "description": "Checks for constant features, extreme missing columns, and empty values."
            },
            "consistency": {
                "score": consistency_score,
                "max": 15,
                "percentage": round((consistency_score / 15) * 100, 1),
                "description": "Assesses datatype parsing integrity and column formatting coherence."
            }
        },
        "issues": sorted(issues, key=lambda x: 0 if x['severity']=='critical' else (1 if x['severity']=='warning' else 2)),
        "recommendations": recommendations
    }
