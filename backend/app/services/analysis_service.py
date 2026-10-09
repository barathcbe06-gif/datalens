import io
import csv
import warnings
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from pathlib import Path

def load_dataframe(file_path: Path) -> pd.DataFrame:
    suffix = file_path.suffix.lower()
    if suffix == '.csv':
        encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
        df = None
        for enc in encodings:
            try:
                with open(file_path, 'r', encoding=enc, errors='replace') as f:
                    sample = f.read(4096)
                    try:
                        dialect = csv.Sniffer().sniff(sample)
                        sep = dialect.delimiter
                    except Exception:
                        sep = ','
                df = pd.read_csv(file_path, sep=sep, encoding=enc, engine='python')
                break
            except Exception:
                try:
                    df = pd.read_csv(file_path, encoding=enc)
                    break
                except Exception:
                    continue
        if df is None:
            raise ValueError("Unable to parse CSV file with supported encodings.")
        return df
    elif suffix in ['.xlsx', '.xls']:
        return pd.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {suffix}")

def detect_column_type(series: pd.Series) -> str:
    valid = series.dropna()
    if len(valid) == 0:
        return 'text'
    
    if pd.api.types.is_bool_dtype(series):
        return 'boolean'
    elif pd.api.types.is_datetime64_any_dtype(series):
        return 'datetime'
    elif pd.api.types.is_numeric_dtype(series):
        return 'numerical'
    else:
        # Check if date string
        try:
            sample_str = valid.iloc[:10].astype(str)
            # Only test if string looks like a date (contains -, /, or :)
            if all(any(c in s for c in ['-', '/', ':']) and 8 <= len(s) <= 25 for s in sample_str):
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    pd.to_datetime(sample_str, format='mixed', errors='raise')
                return 'datetime'
        except Exception:
            pass
        
        unique_ratio = series.nunique() / max(1, len(series))
        if unique_ratio > 0.85 and series.nunique() > 50:
            return 'text'
        return 'categorical'

def format_memory_size(bytes_size: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f'{bytes_size:.1f} {unit}'
        bytes_size /= 1024.0
    return f'{bytes_size:.1f} TB'

def analyze_dataset(file_path: Path) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    
    row_count, col_count = df.shape
    if row_count == 0 or col_count == 0:
        raise ValueError("The uploaded dataset contains 0 rows or 0 columns.")
        
    total_cells = row_count * col_count
    duplicate_count = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_count / row_count) * 100, 2)
    
    total_missing = int(df.isna().sum().sum())
    missing_pct = round((total_missing / total_cells) * 100, 2)
    
    memory_usage = int(df.memory_usage(deep=True).sum())
    memory_str = format_memory_size(memory_usage)
    
    columns_meta = []
    numerical_cols = []
    categorical_cols = []
    datetime_cols = []
    
    numerical_stats = {}
    categorical_stats = {}
    
    for col in df.columns:
        series = df[col]
        col_type = detect_column_type(series)
        missing_count = int(series.isna().sum())
        col_missing_pct = round((missing_count / row_count) * 100, 2)
        unique_count = int(series.nunique(dropna=True))
        unique_pct = round((unique_count / row_count) * 100, 2)
        
        samples = series.dropna().head(5).astype(str).tolist()
        is_id = (unique_pct > 80 and col_type in ['text', 'categorical'] and row_count > 30) or ('id' in str(col).lower() and unique_pct > 60)
        
        meta = {
            "name": str(col),
            "type": col_type,
            "dtype": str(series.dtype),
            "missing_count": missing_count,
            "missing_pct": col_missing_pct,
            "unique_count": unique_count,
            "unique_pct": unique_pct,
            "is_id": is_id,
            "sample_values": samples
        }
        columns_meta.append(meta)
        
        if col_type == 'numerical':
            numerical_cols.append(str(col))
            s_clean = pd.to_numeric(series, errors='coerce').dropna()
            if len(s_clean) > 0:
                numerical_stats[str(col)] = {
                    "count": int(len(s_clean)),
                    "mean": round(float(s_clean.mean()), 3),
                    "median": round(float(s_clean.median()), 3),
                    "std": round(float(s_clean.std()), 3) if len(s_clean) > 1 else 0.0,
                    "min": round(float(s_clean.min()), 3),
                    "q25": round(float(s_clean.quantile(0.25)), 3),
                    "q75": round(float(s_clean.quantile(0.75)), 3),
                    "max": round(float(s_clean.max()), 3),
                    "skewness": round(float(s_clean.skew()), 3) if len(s_clean) > 2 else 0.0,
                    "zeros_count": int((s_clean == 0).sum())
                }
        elif col_type in ['categorical', 'boolean']:
            categorical_cols.append(str(col))
            val_counts = series.dropna().astype(str).value_counts()
            top_val = str(val_counts.index[0]) if len(val_counts) > 0 else 'N/A'
            top_count = int(val_counts.iloc[0]) if len(val_counts) > 0 else 0
            
            top_distribution = []
            for val, cnt in val_counts.head(8).items():
                top_distribution.append({
                    "value": str(val),
                    "count": int(cnt),
                    "percentage": round((cnt / row_count) * 100, 2)
                })
                
            categorical_stats[str(col)] = {
                "count": int(series.dropna().count()),
                "unique_count": unique_count,
                "top_category": top_val,
                "top_count": top_count,
                "top_pct": round((top_count / row_count) * 100, 2) if row_count > 0 else 0.0,
                "distribution": top_distribution
            }
        elif col_type == 'datetime':
            datetime_cols.append(str(col))
            
    correlations = []
    if len(numerical_cols) >= 2:
        try:
            corr_df = df[numerical_cols].apply(pd.to_numeric, errors='coerce').corr()
            cols = list(corr_df.columns)
            for i in range(len(cols)):
                for j in range(i + 1, len(cols)):
                    c1, c2 = cols[i], cols[j]
                    val = corr_df.loc[c1, c2]
                    if not np.isnan(val):
                        correlations.append({
                            "col1": c1,
                            "col2": c2,
                            "correlation": round(float(val), 3),
                            "abs_corr": round(float(abs(val)), 3)
                        })
            correlations.sort(key=lambda x: x["abs_corr"], reverse=True)
        except Exception:
            pass

    insights = []
    
    insights.append({
        "type": "dimension",
        "title": "Dataset Architecture",
        "badge": "Structure",
        "text": f"The dataset contains {row_count:,} records across {col_count} features ({len(numerical_cols)} numerical, {len(categorical_cols)} categorical, {len(datetime_cols)} temporal), consuming {memory_str} of memory."
    })
    
    if duplicate_count > 0:
        insights.append({
            "type": "warning",
            "title": "Duplicate Rows Detected",
            "badge": "Integrity",
            "text": f"Found {duplicate_count:,} duplicate rows ({duplicate_pct}% of the dataset). Consider deduplicating to prevent model bias."
        })
        
    if total_missing > 0:
        cols_with_missing = [c for c in columns_meta if c['missing_count'] > 0]
        worst_col = max(cols_with_missing, key=lambda x: x['missing_pct'])
        insights.append({
            "type": "missing",
            "title": "Missing Values Overview",
            "badge": "Completeness",
            "text": f"Total {total_missing:,} missing values ({missing_pct}% overall). Column '{worst_col['name']}' has the highest missing rate ({worst_col['missing_pct']}%)."
        })
    else:
        insights.append({
            "type": "success",
            "title": "Zero Missing Values",
            "badge": "Completeness",
            "text": "All columns have 100% complete records with no null or missing cells."
        })
        
    strong_corrs = [c for c in correlations if c['abs_corr'] >= 0.5]
    if strong_corrs:
        top_corr = strong_corrs[0]
        direction = "positive" if top_corr['correlation'] > 0 else "negative"
        insights.append({
            "type": "correlation",
            "title": f"Strong {direction.capitalize()} Correlation",
            "badge": "Relationship",
            "text": f"Strong {direction} linear relationship detected between '{top_corr['col1']}' and '{top_corr['col2']}' (r = {top_corr['correlation']})."
        })
        
    if categorical_stats:
        dominant_cats = []
        for col_name, c_data in categorical_stats.items():
            if c_data['top_pct'] > 60:
                dominant_cats.append(f"'{col_name}' ({c_data['top_category']}: {c_data['top_pct']}%)")
        if dominant_cats:
            insights.append({
                "type": "category",
                "title": "Dominant Categories Observed",
                "badge": "Distribution",
                "text": f"High category dominance found in: {', '.join(dominant_cats[:3])}."
            })
            
    skewed_cols = []
    for col_name, s_data in numerical_stats.items():
        if abs(s_data['skewness']) > 1.5:
            skewed_cols.append(f"'{col_name}' (skew: {s_data['skewness']})")
    if skewed_cols:
        insights.append({
            "type": "distribution",
            "title": "Skewed Numerical Distributions",
            "badge": "Distribution",
            "text": f"Heavy distribution tail or skewness detected in: {', '.join(skewed_cols[:3])}. Log transformation may benefit linear ML models."
        })

    preview_df = df.head(100).replace({np.nan: None, pd.NaT: None})
    preview_records = preview_df.to_dict(orient='records')
    for row in preview_records:
        for k, v in row.items():
            if isinstance(v, (np.integer, np.int64)):
                row[k] = int(v)
            elif isinstance(v, (np.floating, np.float64)):
                row[k] = None if np.isnan(v) else round(float(v), 4)
            elif isinstance(v, (pd.Timestamp, np.datetime64)):
                row[k] = str(v)

    return {
        "summary": {
            "row_count": row_count,
            "col_count": col_count,
            "total_cells": total_cells,
            "duplicate_count": duplicate_count,
            "duplicate_pct": duplicate_pct,
            "total_missing": total_missing,
            "missing_pct": missing_pct,
            "memory_usage_str": memory_str,
            "numerical_cols_count": len(numerical_cols),
            "categorical_cols_count": len(categorical_cols),
            "datetime_cols_count": len(datetime_cols),
        },
        "columns": columns_meta,
        "numerical_cols": numerical_cols,
        "categorical_cols": categorical_cols,
        "datetime_cols": datetime_cols,
        "numerical_stats": numerical_stats,
        "categorical_stats": categorical_stats,
        "correlations": correlations[:20],
        "insights": insights,
        "preview_data": preview_records
    }
