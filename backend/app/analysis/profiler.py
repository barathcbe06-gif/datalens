import csv
import warnings
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List

def load_dataframe(file_path: Path) -> pd.DataFrame:
    suffix = file_path.suffix.lower()
    if suffix == '.csv':
        encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252']
        df = None
        for enc in encodings:
            try:
                with open(file_path, 'r', encoding=enc, errors='replace') as f:
                    sample = f.read(8192)
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
        raise ValueError(f"Unsupported file format: {suffix}")

def detect_column_type(series: pd.Series) -> str:
    valid = series.dropna()
    if len(valid) == 0:
        return 'text'
    
    if pd.api.types.is_bool_dtype(series):
        return 'boolean'
    elif pd.api.types.is_datetime64_any_dtype(series):
        return 'datetime'
    elif pd.api.types.is_numeric_dtype(series):
        if series.nunique() == 2 and set(valid.unique()).issubset({0, 1, 0.0, 1.0}):
            return 'boolean'
        return 'numerical'
    else:
        try:
            sample_str = valid.iloc[:15].astype(str)
            if all(any(c in s for c in ['-', '/', ':']) and 8 <= len(s) <= 30 for s in sample_str):
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

def profile_dataset(file_path: Path) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    
    row_count, col_count = df.shape
    if row_count == 0 or col_count == 0:
        raise ValueError("Dataset is empty (0 rows or 0 columns).")
        
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
    boolean_cols = []
    constant_cols = []
    id_cols = []
    
    for col in df.columns:
        series = df[col]
        col_type = detect_column_type(series)
        missing_count = int(series.isna().sum())
        col_missing_pct = round((missing_count / row_count) * 100, 2)
        unique_count = int(series.nunique(dropna=True))
        unique_pct = round((unique_count / row_count) * 100, 2)
        
        is_constant = bool(unique_count <= 1 and row_count > 1)
        is_id = bool((unique_pct > 80 and col_type in ['text', 'categorical'] and row_count > 25) or (('id' in str(col).lower() or 'code' in str(col).lower()) and unique_pct > 60))
        
        if is_constant:
            constant_cols.append(str(col))
        if is_id:
            id_cols.append(str(col))
            
        samples = series.dropna().head(5).astype(str).tolist()
        
        meta = {
            "name": str(col),
            "type": col_type,
            "dtype": str(series.dtype),
            "missing_count": missing_count,
            "missing_pct": col_missing_pct,
            "unique_count": unique_count,
            "unique_pct": unique_pct,
            "is_id": is_id,
            "is_constant": is_constant,
            "sample_values": samples
        }
        columns_meta.append(meta)
        
        if col_type == 'numerical':
            numerical_cols.append(str(col))
        elif col_type in ['categorical', 'text']:
            categorical_cols.append(str(col))
        elif col_type == 'datetime':
            datetime_cols.append(str(col))
        elif col_type == 'boolean':
            boolean_cols.append(str(col))
            
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
            "memory_usage_bytes": memory_usage,
            "memory_usage_str": memory_str,
            "numerical_cols_count": len(numerical_cols),
            "categorical_cols_count": len(categorical_cols),
            "datetime_cols_count": len(datetime_cols),
            "boolean_cols_count": len(boolean_cols),
            "constant_cols_count": len(constant_cols),
            "id_cols_count": len(id_cols)
        },
        "columns": columns_meta,
        "numerical_cols": numerical_cols,
        "categorical_cols": categorical_cols,
        "datetime_cols": datetime_cols,
        "boolean_cols": boolean_cols,
        "constant_cols": constant_cols,
        "id_cols": id_cols,
        "preview_data": preview_records
    }