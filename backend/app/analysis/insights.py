import numpy as np
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path
from .profiler import load_dataframe, detect_column_type

def generate_ai_insights(file_path: Path) -> List[Dict[str, Any]]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    
    insights = []
    
    # 1. Dataset Dimensions & Architecture
    num_cols = [c for c in df.columns if detect_column_type(df[c]) == 'numerical']
    cat_cols = [c for c in df.columns if detect_column_type(df[c]) in ['categorical', 'text', 'boolean']]
    dt_cols = [c for c in df.columns if detect_column_type(df[c]) == 'datetime']
    
    insights.append({
        "type": "dimension",
        "title": "Dataset Architecture & Volume",
        "badge": "Structure",
        "text": f"The dataset encapsulates {row_count:,} records across {col_count} attributes ({len(num_cols)} numerical, {len(cat_cols)} categorical, {len(dt_cols)} temporal).",
        "evidence": {"rows": row_count, "cols": col_count, "num_cols": len(num_cols), "cat_cols": len(cat_cols)}
    })
    
    # 2. Missing Value Analysis
    total_missing = int(df.isna().sum().sum())
    total_cells = max(1, row_count * col_count)
    missing_pct = round((total_missing / total_cells) * 100, 2)
    
    if total_missing > 0:
        col_missing = df.isna().sum()
        worst_col = str(col_missing.idxmax())
        worst_col_count = int(col_missing.max())
        worst_col_pct = round((worst_col_count / row_count) * 100, 2)
        insights.append({
            "type": "missing",
            "title": "Data Incompleteness Identified",
            "badge": "Completeness",
            "text": f"A total of {total_missing:,} missing values ({missing_pct}% of all cells) were detected. Column '{worst_col}' exhibits the highest sparsity with {worst_col_count:,} nulls ({worst_col_pct}%).",
            "evidence": {"total_missing": total_missing, "worst_column": worst_col, "worst_pct": worst_col_pct}
        })
    else:
        insights.append({
            "type": "success",
            "title": "Perfect Data Completeness",
            "badge": "Completeness",
            "text": "100% record completeness across all rows and columns with zero missing or null cells.",
            "evidence": {"missing_count": 0}
        })

    # 3. Duplicate Records
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        dup_pct = round((dup_count / row_count) * 100, 2)
        insights.append({
            "type": "warning",
            "title": "Row Duplication Detected",
            "badge": "Integrity",
            "text": f"{dup_count:,} exact duplicate rows ({dup_pct}% of the dataset) were identified. Removing duplicates will avoid inflated evaluation metrics.",
            "evidence": {"duplicate_count": dup_count, "duplicate_pct": dup_pct}
        })

    # 4. Correlation Analysis
    if len(num_cols) >= 2:
        try:
            num_df = df[num_cols].apply(pd.to_numeric, errors='coerce')
            corr = num_df.corr()
            cols = list(corr.columns)
            pairs = []
            for i in range(len(cols)):
                for j in range(i + 1, len(cols)):
                    c1, c2 = cols[i], cols[j]
                    v = corr.loc[c1, c2]
                    if not np.isnan(v):
                        pairs.append((c1, c2, float(v), abs(float(v))))
            pairs.sort(key=lambda x: x[3], reverse=True)
            
            if pairs:
                top_p = pairs[0]
                if top_p[3] >= 0.5:
                    dir_str = "positive" if top_p[2] > 0 else "negative"
                    insights.append({
                        "type": "correlation",
                        "title": f"Strong {dir_str.capitalize()} Linear Relationship",
                        "badge": "Relationship",
                        "text": f"Strong {dir_str} correlation (Pearson r = {top_p[2]:.3f}) detected between '{top_p[0]}' and '{top_p[1]}'.",
                        "evidence": {"feature_1": top_p[0], "feature_2": top_p[1], "correlation": round(top_p[2], 3)}
                    })
                elif top_p[3] < 0.2:
                    insights.append({
                        "type": "correlation",
                        "title": "Low Linear Correlation Across Features",
                        "badge": "Relationship",
                        "text": f"Features exhibit near-orthogonality. Maximum linear correlation is r = {top_p[2]:.3f} between '{top_p[0]}' and '{top_p[1]}'. Tree-based non-linear models will capture interactions better.",
                        "evidence": {"max_correlation": round(top_p[2], 3)}
                    })
        except Exception:
            pass

    # 5. Categorical Dominance
    for col in cat_cols[:4]:
        s = df[col].dropna().astype(str)
        val_counts = s.value_counts()
        if len(val_counts) > 1:
            top_val = str(val_counts.index[0])
            top_cnt = int(val_counts.iloc[0])
            top_pct = round((top_cnt / max(1, len(s))) * 100, 2)
            if top_pct >= 60.0:
                insights.append({
                    "type": "category",
                    "title": f"High Class Dominance in '{col}'",
                    "badge": "Distribution",
                    "text": f"The dominant category '{top_val}' accounts for {top_pct}% ({top_cnt:,} rows) of '{col}', indicating substantial class imbalance.",
                    "evidence": {"column": col, "top_category": top_val, "percentage": top_pct}
                })
                break

    # 6. Skewness / Distribution Tails
    for col in num_cols[:4]:
        s = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(s) > 10:
            skew_val = float(s.skew())
            if abs(skew_val) >= 1.5:
                direction = "right-skewed (positive tail)" if skew_val > 0 else "left-skewed (negative tail)"
                insights.append({
                    "type": "distribution",
                    "title": f"Asymmetric Distribution: '{col}'",
                    "badge": "Distribution",
                    "text": f"Column '{col}' exhibits heavy skewness (Fisher-Pearson coefficient = {skew_val:.2f}, {direction}). Logarithmic or Box-Cox transformations are recommended for linear models.",
                    "evidence": {"column": col, "skewness": round(skew_val, 2)}
                })
                break

    # 7. Group Differences (Categorical vs Numerical)
    if cat_cols and num_cols:
        try:
            c_col = cat_cols[0]
            n_col = num_cols[0]
            grouped = df.groupby(c_col)[n_col].mean().dropna()
            if len(grouped) >= 2:
                highest_grp = str(grouped.idxmax())
                highest_avg = round(float(grouped.max()), 2)
                lowest_grp = str(grouped.idxmin())
                lowest_avg = round(float(grouped.min()), 2)
                
                if lowest_avg > 0 and (highest_avg / lowest_avg) >= 1.25:
                    pct_diff = round(((highest_avg - lowest_avg) / lowest_avg) * 100, 1)
                    insights.append({
                        "type": "bivariate",
                        "title": f"Significant Mean Disparity across '{c_col}'",
                        "badge": "Group Variance",
                        "text": f"Group '{highest_grp}' shows an average {n_col} of {highest_avg:,}, which is {pct_diff}% higher than '{lowest_grp}' ({lowest_avg:,}).",
                        "evidence": {"category_column": c_col, "numerical_column": n_col, "highest_group": highest_grp, "lowest_group": lowest_grp}
                    })
        except Exception:
            pass

    return insights