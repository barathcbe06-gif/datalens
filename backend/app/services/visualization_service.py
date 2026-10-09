import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path
from .analysis_service import load_dataframe, detect_column_type

def generate_auto_visualizations(file_path: Path) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    
    numerical_cols = []
    categorical_cols = []
    
    for col in df.columns:
        ctype = detect_column_type(df[col])
        if ctype == 'numerical':
            numerical_cols.append(str(col))
        elif ctype in ['categorical', 'boolean']:
            categorical_cols.append(str(col))
            
    charts = []
    
    # 1. Categorical Distribution Charts (Bar & Donut)
    for col in categorical_cols[:4]:
        val_counts = df[col].dropna().astype(str).value_counts().head(8)
        data_points = [{"name": str(k), "count": int(v), "percentage": round((v / max(1, row_count)) * 100, 1)} for k, v in val_counts.items()]
        
        charts.append({
            "id": f"cat_bar_{col}",
            "type": "bar",
            "title": f"Distribution of {col}",
            "subtitle": f"Top categories in {col}",
            "category": "Categorical Breakdown",
            "x_label": col,
            "y_label": "Frequency Count",
            "data": data_points
        })
        
        # If <= 5 categories, also generate a pie chart
        if len(val_counts) <= 5:
            charts.append({
                "id": f"cat_pie_{col}",
                "type": "pie",
                "title": f"Category Share: {col}",
                "subtitle": f"Proportional composition of {col}",
                "category": "Composition",
                "data": data_points
            })

    # 2. Numerical Histograms (Distribution Bins)
    for col in numerical_cols[:4]:
        s = pd.to_numeric(df[col], errors='coerce').dropna()
        if len(s) > 5 and s.nunique() > 3:
            counts, bin_edges = np.histogram(s, bins=min(12, max(5, s.nunique())))
            hist_data = []
            for i in range(len(counts)):
                label = f"{bin_edges[i]:.1f} - {bin_edges[i+1]:.1f}"
                hist_data.append({
                    "bin": label,
                    "count": int(counts[i]),
                    "min": round(float(bin_edges[i]), 1),
                    "max": round(float(bin_edges[i+1]), 1)
                })
            charts.append({
                "id": f"num_hist_{col}",
                "type": "histogram",
                "title": f"{col} Distribution",
                "subtitle": f"Histogram bin frequencies for {col}",
                "category": "Numerical Distribution",
                "x_label": col,
                "y_label": "Frequency",
                "data": hist_data
            })

    # 3. Correlation Heatmap Matrix
    correlation_matrix = None
    if len(numerical_cols) >= 2:
        try:
            num_df = df[numerical_cols].apply(pd.to_numeric, errors='coerce')
            corr = num_df.corr().round(2)
            corr_cols = list(corr.columns)
            corr_rows = []
            for r_col in corr_cols:
                row_item = {"feature": r_col}
                for c_col in corr_cols:
                    val = corr.loc[r_col, c_col]
                    row_item[c_col] = 0.0 if np.isnan(val) else float(val)
                corr_rows.append(row_item)
            correlation_matrix = {
                "columns": corr_cols,
                "matrix": corr_rows
            }
        except Exception:
            pass

    # 4. Scatter Plots for Top Correlated Numerical Pairs
    scatter_charts = []
    if len(numerical_cols) >= 2:
        try:
            corr_df = df[numerical_cols].apply(pd.to_numeric, errors='coerce').corr()
            cols = list(corr_df.columns)
            pairs = []
            for i in range(len(cols)):
                for j in range(i + 1, len(cols)):
                    c1, c2 = cols[i], cols[j]
                    val = corr_df.loc[c1, c2]
                    if not np.isnan(val):
                        pairs.append((c1, c2, abs(val), val))
            pairs.sort(key=lambda x: x[2], reverse=True)
            
            for c1, c2, _, raw_corr in pairs[:2]:
                sub_df = df[[c1, c2]].dropna().head(150)
                scatter_data = []
                for _, row in sub_df.iterrows():
                    scatter_data.append({
                        "x": round(float(row[c1]), 2),
                        "y": round(float(row[c2]), 2)
                    })
                scatter_charts.append({
                    "id": f"scatter_{c1}_{c2}",
                    "type": "scatter",
                    "title": f"{c1} vs. {c2}",
                    "subtitle": f"Correlation r = {raw_corr:.2f}",
                    "category": "Bivariate Relationship",
                    "x_label": c1,
                    "y_label": c2,
                    "data": scatter_data
                })
        except Exception:
            pass

    return {
        "charts": charts,
        "scatter_charts": scatter_charts,
        "correlation_matrix": correlation_matrix,
        "numerical_columns": numerical_cols,
        "categorical_columns": categorical_cols,
        "all_columns": list(df.columns)
    }

def execute_custom_chart(file_path: Path, chart_type: str, x_col: str, y_col: Optional[str] = None, aggregation: str = "none", group_by: Optional[str] = None, limit: int = 50) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    if x_col not in df.columns:
        raise ValueError(f"Column '{x_col}' does not exist in dataset.")
        
    df_clean = df.copy()
    
    if chart_type in ['bar', 'line', 'area', 'pie']:
        if aggregation == 'count' or not y_col:
            val_counts = df_clean[x_col].astype(str).value_counts().head(limit)
            data = [{"name": str(k), "value": int(v)} for k, v in val_counts.items()]
            return {"data": data, "x_label": x_col, "y_label": "Count"}
        else:
            if y_col not in df_clean.columns:
                raise ValueError(f"Column '{y_col}' does not exist.")
            df_clean[y_col] = pd.to_numeric(df_clean[y_col], errors='coerce')
            
            if aggregation == 'sum':
                agg_df = df_clean.groupby(x_col)[y_col].sum().reset_index().head(limit)
            elif aggregation == 'avg':
                agg_df = df_clean.groupby(x_col)[y_col].mean().round(2).reset_index().head(limit)
            elif aggregation == 'min':
                agg_df = df_clean.groupby(x_col)[y_col].min().reset_index().head(limit)
            elif aggregation == 'max':
                agg_df = df_clean.groupby(x_col)[y_col].max().reset_index().head(limit)
            else:
                agg_df = df_clean[[x_col, y_col]].dropna().head(limit)
                
            data = [{"name": str(row[x_col]), "value": float(row[y_col]) if not np.isnan(row[y_col]) else 0} for _, row in agg_df.iterrows()]
            return {"data": data, "x_label": x_col, "y_label": f"{aggregation.upper()}({y_col})"}
            
    elif chart_type == 'scatter':
        if not y_col or y_col not in df_clean.columns:
            raise ValueError("Scatter chart requires both X and Y columns.")
        df_clean[x_col] = pd.to_numeric(df_clean[x_col], errors='coerce')
        df_clean[y_col] = pd.to_numeric(df_clean[y_col], errors='coerce')
        sub_df = df_clean[[x_col, y_col]].dropna().head(limit)
        data = [{"x": float(r[x_col]), "y": float(r[y_col])} for _, r in sub_df.iterrows()]
        return {"data": data, "x_label": x_col, "y_label": y_col}
        
    elif chart_type == 'histogram':
        s = pd.to_numeric(df_clean[x_col], errors='coerce').dropna()
        counts, bin_edges = np.histogram(s, bins=min(15, max(5, s.nunique())))
        data = []
        for i in range(len(counts)):
            data.append({
                "name": f"{bin_edges[i]:.1f} - {bin_edges[i+1]:.1f}",
                "value": int(counts[i])
            })
        return {"data": data, "x_label": x_col, "y_label": "Frequency"}

    return {"data": [], "x_label": x_col, "y_label": y_col or "Value"}
