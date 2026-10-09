import numpy as np
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path
from .profiler import load_dataframe, detect_column_type

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
    validity_deductions = 0.0
    issues = []
    recommendations = []
    
    # Check outlier count using IQR across numerical columns
    total_outlier_count = 0
    outlier_affected_rows = set()
    num_cols = []
    
    for col in df.columns:
        series = df[col]
        col_missing = int(series.isna().sum())
        col_missing_pct = round((col_missing / max(1, row_count)) * 100, 2)
        
        # High missing rate
        if col_missing_pct > 50:
            validity_deductions += 6.0
            issues.append({
                "severity": "critical",
                "category": "Completeness",
                "column": str(col),
                "title": f"Excessive Missing Data ({col_missing_pct}%)",
                "impact": f"Over 50% of values in '{col}' are null ({col_missing:,} missing rows).",
                "action": f"Consider dropping '{col}' or investigating data pipeline extraction errors."
            })
            recommendations.append(f"Column '{col}' contains {col_missing_pct}% missing values. Drop column or apply targeted domain imputation.")
        elif col_missing_pct > 5:
            validity_deductions += 2.0
            issues.append({
                "severity": "warning",
                "category": "Completeness",
                "column": str(col),
                "title": f"Missing Values Detected ({col_missing_pct}%)",
                "impact": f"{col_missing:,} missing records in column '{col}'.",
                "action": f"Apply imputation (median for numeric, mode for categorical)."
            })
            recommendations.append(f"Impute missing values in '{col}' ({col_missing_pct}% null) prior to model training.")
            
        # Constant / Zero Variance
        unique_vals = series.dropna().nunique()
        if unique_vals <= 1 and len(series.dropna()) > 1:
            validity_deductions += 5.0
            issues.append({
                "severity": "warning",
                "category": "Validity",
                "column": str(col),
                "title": f"Constant Feature / Zero Variance",
                "impact": f"Column '{col}' contains only 1 unique value across all records.",
                "action": f"Remove '{col}' from machine learning pipelines to eliminate zero-variance redundancy."
            })
            recommendations.append(f"Column '{col}' is constant (zero variance). Drop it from feature matrices.")
            
        # High Cardinality / Potential ID
        ctype = detect_column_type(series)
        unique_pct = (unique_vals / max(1, row_count)) * 100
        if unique_pct > 80 and ctype in ['text', 'categorical'] and row_count > 25:
            issues.append({
                "severity": "info",
                "category": "Validity",
                "column": str(col),
                "title": f"High Cardinality / Potential Identifier ({unique_vals} unique)",
                "impact": f"Column '{col}' has {unique_pct:.1f}% unique values, characteristic of an entity ID.",
                "action": f"Exclude '{col}' from predictive modeling to prevent artificial overfitting."
            })
            recommendations.append(f"Column '{col}' contains unusually high cardinality ({unique_pct:.1f}% unique). Exclude from ML encoding.")

        # Outlier detection for numerical columns
        if ctype == 'numerical':
            num_cols.append(str(col))
            s_clean = pd.to_numeric(series, errors='coerce').dropna()
            if len(s_clean) >= 10:
                q25 = float(s_clean.quantile(0.25))
                q75 = float(s_clean.quantile(0.75))
                iqr = q75 - q25
                if iqr > 0:
                    lower_bound = q25 - 1.5 * iqr
                    upper_bound = q75 + 1.5 * iqr
                    outliers_in_col = s_clean[(s_clean < lower_bound) | (s_clean > upper_bound)]
                    c_outlier_count = len(outliers_in_col)
                    if c_outlier_count > 0:
                        total_outlier_count += c_outlier_count
                        for idx in outliers_in_col.index:
                            outlier_affected_rows.add(idx)
                        c_outlier_pct = round((c_outlier_count / len(s_clean)) * 100, 2)
                        if c_outlier_pct > 8.0:
                            issues.append({
                                "severity": "warning",
                                "category": "Outliers",
                                "column": str(col),
                                "title": f"Significant Outlier Ratio ({c_outlier_pct}%)",
                                "impact": f"{c_outlier_count} values lie outside 1.5*IQR bounds in '{col}'.",
                                "action": f"Review distribution in '{col}'. Use RobustScaler or Winsorization."
                            })
                            recommendations.append(f"Column '{col}' contains {c_outlier_pct}% potential outliers. Consider robust scaling or quantile clipping.")

    validity_score = max(0.0, min(25.0, 25.0 - validity_deductions))
    validity_score = round(validity_score, 1)
    
    # 4. Consistency Calculation (Max 15 points)
    consistency_deductions = 0.0
    for col in df.columns:
        series = df[col]
        if series.dtype == 'object':
            sample_clean = series.dropna().head(25)
            num_like = 0
            for v in sample_clean:
                clean_v = str(v).replace('$', '').replace(',', '').replace('%', '').strip()
                try:
                    float(clean_v)
                    num_like += 1
                except ValueError:
                    pass
            if num_like > len(sample_clean) * 0.75 and len(sample_clean) > 5:
                consistency_deductions += 3.0
                issues.append({
                    "severity": "info",
                    "category": "Consistency",
                    "column": str(col),
                    "title": f"Numeric Data Formatted as Text",
                    "impact": f"Values in '{col}' appear numeric but are stored as strings.",
                    "action": f"Cast '{col}' to numeric float/int for mathematical aggregation."
                })
                recommendations.append(f"Format consistency: Column '{col}' contains numeric values stored as text. Cast to numeric.")

    consistency_score = max(0.0, min(15.0, 15.0 - consistency_deductions))
    consistency_score = round(consistency_score, 1)
    
    # Duplicate rows issue
    if duplicate_rows > 0:
        issues.append({
            "severity": "critical" if duplicate_ratio > 0.1 else "warning",
            "category": "Uniqueness",
            "column": "Dataset Rows",
            "title": f"{duplicate_rows:,} Duplicate Rows Detected ({duplicate_ratio * 100:.1f}%)",
            "impact": f"Exact duplicate rows can cause data leakage and artificially inflate evaluation metrics.",
            "action": f"Apply df.drop_duplicates() to sanitize identical observations."
        })
        recommendations.append(f"Deduplicate records: Found {duplicate_rows} duplicate rows ({duplicate_ratio * 100:.1f}%). Deduplication recommended.")
        
    overall_score = round(completeness_score + uniqueness_score + validity_score + consistency_score, 1)
    overall_score = min(100.0, max(0.0, overall_score))
    
    outlier_pct = round((len(outlier_affected_rows) / max(1, row_count)) * 100, 2)
    
    if overall_score >= 90:
        grade = "Excellent"
        grade_badge = "emerald"
        summary_text = "The dataset demonstrates exceptional integrity, minimal missing values, and high structural validity. Highly suitable for production analytics and machine learning."
    elif overall_score >= 75:
        grade = "Good"
        grade_badge = "blue"
        summary_text = "The dataset is solid with minor data hygiene opportunities. Standard imputation or deduplication is advised before deep modeling."
    elif overall_score >= 55:
        grade = "Moderate"
        grade_badge = "amber"
        summary_text = "Noticeable data quality anomalies detected (missing values, potential outliers, or duplicates). Preprocessing pipeline required."
    else:
        grade = "Needs Attention"
        grade_badge = "rose"
        summary_text = "Significant data quality anomalies found. Requires systematic cleaning, null handling, and type corrections prior to any statistical reliance."

    if not recommendations:
        recommendations.append("Dataset passed all quality audits with high marks. Ready for automated feature engineering.")

    return {
        "overall_score": overall_score,
        "grade": grade,
        "grade_badge": grade_badge,
        "summary_text": summary_text,
        "metrics": {
            "completeness_score": completeness_score,
            "uniqueness_score": uniqueness_score,
            "validity_score": validity_score,
            "consistency_score": consistency_score,
            "missing_cells_pct": round(missing_ratio * 100, 2),
            "duplicate_rows_pct": round(duplicate_ratio * 100, 2),
            "outlier_rows_pct": outlier_pct,
            "outlier_rows_count": len(outlier_affected_rows)
        },
        "breakdown": {
            "completeness": {
                "score": completeness_score,
                "max": 35,
                "percentage": round((completeness_score / 35.0) * 100, 1),
                "description": "Evaluates null, NaN, and missing entries across all features."
            },
            "uniqueness": {
                "score": uniqueness_score,
                "max": 25,
                "percentage": round((uniqueness_score / 25.0) * 100, 1),
                "description": "Measures row duplication and entity record redundancy."
            },
            "validity": {
                "score": validity_score,
                "max": 25,
                "percentage": round((validity_score / 25.0) * 100, 1),
                "description": "Checks for constant features, extreme missing columns, and empty values."
            },
            "consistency": {
                "score": consistency_score,
                "max": 15,
                "percentage": round((consistency_score / 15.0) * 100, 1),
                "description": "Assesses datatype parsing integrity and column formatting coherence."
            }
        },
        "issues": sorted(issues, key=lambda x: 0 if x['severity'] == 'critical' else (1 if x['severity'] == 'warning' else 2)),
        "recommendations": recommendations[:6]
    }