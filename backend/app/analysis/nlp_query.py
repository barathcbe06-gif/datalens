import re
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path
from .profiler import load_dataframe, detect_column_type

def match_column(query_lower: str, columns: List[str]) -> Optional[str]:
    for col in columns:
        col_clean = str(col).lower().replace('_', ' ').replace('-', ' ').strip()
        if col_clean in query_lower:
            return str(col)
        if str(col).lower() in query_lower:
            return str(col)
            
    words = set(re.findall(r'\b\w+\b', query_lower))
    best_col = None
    best_score = 0
    for col in columns:
        col_words = set(re.findall(r'\b\w+\b', str(col).lower().replace('_', ' ')))
        overlap = len(words.intersection(col_words))
        if overlap > best_score:
            best_score = overlap
            best_col = str(col)
            
    if best_score > 0:
        return best_col
    return None

def match_multiple_columns(query_lower: str, columns: List[str]) -> List[str]:
    matched = []
    for col in columns:
        col_clean = str(col).lower().replace('_', ' ')
        if col_clean in query_lower or str(col).lower() in query_lower:
            matched.append(str(col))
    return matched

def answer_data_query(file_path: Path, query: str) -> Dict[str, Any]:
    df = load_dataframe(file_path)
    row_count, col_count = df.shape
    columns = list(df.columns)
    
    q = query.strip()
    q_lower = q.lower()
    
    col_types = {col: detect_column_type(df[col]) for col in columns}
    num_cols = [c for c, t in col_types.items() if t == 'numerical']
    cat_cols = [c for c, t in col_types.items() if t in ['categorical', 'text', 'boolean']]
    dt_cols = [c for c, t in col_types.items() if t == 'datetime']
    
    # Intent 1: Missing values overview or column with most missing
    if any(k in q_lower for k in ['most missing', 'highest missing', 'null values', 'missing values', 'missing data']):
        missing_counts = df.isna().sum()
        total_missing = int(missing_counts.sum())
        if total_missing == 0:
            return {
                "success": True,
                "query": query,
                "answer": "The dataset contains 0 missing values. All records across all columns are 100% complete.",
                "metric_value": 0,
                "data_table": None,
                "chart": None
            }
        worst_col = str(missing_counts.idxmax())
        worst_cnt = int(missing_counts.max())
        worst_pct = round((worst_cnt / row_count) * 100, 2)
        
        breakdown = []
        for col, cnt in missing_counts[missing_counts > 0].items():
            breakdown.append({
                "column": str(col),
                "missing_count": int(cnt),
                "missing_percentage": f"{round((cnt / row_count) * 100, 2)}%"
            })
        breakdown.sort(key=lambda x: x["missing_count"], reverse=True)
        
        return {
            "success": True,
            "query": query,
            "answer": f"Column '{worst_col}' has the most missing values with {worst_cnt:,} null entries ({worst_pct}% of total records). Total missing cells across the entire dataset is {total_missing:,}.",
            "metric_value": worst_cnt,
            "data_table": breakdown,
            "chart": {
                "type": "bar",
                "x_label": "Column",
                "y_label": "Missing Count",
                "data": [{"name": r["column"], "value": r["missing_count"]} for r in breakdown[:8]]
            }
        }
        
    # Intent 2: Grouped query: "Which [category] has the highest/lowest average/total [metric]?"
    group_match = re.search(r'(highest|lowest|max|maximum|min|minimum|top)\s+(average|mean|total|sum|median)?\s*([a-zA-Z0-9_\s]+)\s+in\s+([a-zA-Z0-9_\s]+)', q_lower) or \
                  re.search(r'which\s+([a-zA-Z0-9_\s]+)\s+has\s+(the\s+)?(highest|lowest|max|maximum|min|minimum|best|worst)\s+([a-zA-Z0-9_\s]+)', q_lower)
                  
    if group_match or any(k in q_lower for k in ['highest average', 'lowest average', 'by department', 'by category', 'by group', 'highest mean', 'lowest mean']):
        matched_cols = match_multiple_columns(q_lower, columns)
        cat_match = next((c for c in matched_cols if c in cat_cols), None)
        num_match = next((c for c in matched_cols if c in num_cols), None)
        
        if not cat_match and cat_cols:
            cat_match = cat_cols[0]
        if not num_match and num_cols:
            num_match = num_cols[0]
            
        if cat_match and num_match:
            is_min = any(k in q_lower for k in ['lowest', 'minimum', 'min', 'worst', 'least'])
            is_sum = any(k in q_lower for k in ['total', 'sum'])
            
            sub = df[[cat_match, num_match]].dropna()
            sub[num_match] = pd.to_numeric(sub[num_match], errors='coerce')
            sub = sub.dropna()
            
            if is_sum:
                agg = sub.groupby(cat_match)[num_match].sum().reset_index()
                agg_label = "Total"
            else:
                agg = sub.groupby(cat_match)[num_match].mean().round(2).reset_index()
                agg_label = "Average"
                
            agg = agg.sort_values(by=num_match, ascending=is_min)
            top_row = agg.iloc[0]
            winner_cat = str(top_row[cat_match])
            winner_val = float(top_row[num_match])
            
            table_rows = [
                {"category": str(r[cat_match]), "calculated_value": round(float(r[num_match]), 2)}
                for _, r in agg.head(10).iterrows()
            ]
            
            extremum = "lowest" if is_min else "highest"
            answer_text = f"In '{cat_match}', '{winner_cat}' has the {extremum} {agg_label.lower()} '{num_match}' with a calculated value of {winner_val:,.2f}."
            
            return {
                "success": True,
                "query": query,
                "answer": answer_text,
                "metric_value": winner_val,
                "data_table": table_rows,
                "chart": {
                    "type": "bar",
                    "x_label": cat_match,
                    "y_label": f"{agg_label} {num_match}",
                    "data": [{"name": r["category"], "value": r["calculated_value"]} for r in table_rows]
                }
            }

    # Intent 3: Specific Column Aggregations (Average, Median, Sum, Max, Min)
    matched_col = match_column(q_lower, columns)
    
    if matched_col and matched_col in num_cols:
        s = pd.to_numeric(df[matched_col], errors='coerce').dropna()
        
        if any(k in q_lower for k in ['average', 'mean', 'avg']):
            val = round(float(s.mean()), 3)
            return {
                "success": True,
                "query": query,
                "answer": f"The average (mean) value of '{matched_col}' is {val:,.3f} across {len(s):,} valid records.",
                "metric_value": val,
                "data_table": [{"Metric": "Mean", "Value": val}, {"Metric": "Std Dev", "Value": round(float(s.std()), 3)}, {"Metric": "Median", "Value": round(float(s.median()), 3)}],
                "chart": None
            }
        elif any(k in q_lower for k in ['median', '50th percentile', 'middle value']):
            val = round(float(s.median()), 3)
            return {
                "success": True,
                "query": query,
                "answer": f"The median value of '{matched_col}' is {val:,.3f}.",
                "metric_value": val,
                "data_table": [{"Metric": "Median (Q50)", "Value": val}, {"Metric": "Q25", "Value": round(float(s.quantile(0.25)), 3)}, {"Metric": "Q75", "Value": round(float(s.quantile(0.75)), 3)}],
                "chart": None
            }
        elif any(k in q_lower for k in ['highest', 'maximum', 'max', 'peak']):
            val = round(float(s.max()), 3)
            return {
                "success": True,
                "query": query,
                "answer": f"The maximum value observed in '{matched_col}' is {val:,.3f}.",
                "metric_value": val,
                "data_table": [{"Metric": "Maximum", "Value": val}, {"Metric": "99th Percentile", "Value": round(float(s.quantile(0.99)), 3)}],
                "chart": None
            }
        elif any(k in q_lower for k in ['lowest', 'minimum', 'min']):
            val = round(float(s.min()), 3)
            return {
                "success": True,
                "query": query,
                "answer": f"The minimum value observed in '{matched_col}' is {val:,.3f}.",
                "metric_value": val,
                "data_table": [{"Metric": "Minimum", "Value": val}, {"Metric": "1st Percentile", "Value": round(float(s.quantile(0.01)), 3)}],
                "chart": None
            }
        elif any(k in q_lower for k in ['total', 'sum']):
            val = round(float(s.sum()), 3)
            return {
                "success": True,
                "query": query,
                "answer": f"The total sum of '{matched_col}' is {val:,.3f}.",
                "metric_value": val,
                "data_table": [{"Metric": "Sum", "Value": val}, {"Metric": "Count", "Value": len(s)}],
                "chart": None
            }
        elif any(k in q_lower for k in ['top 5', 'top 10', 'highest 5', 'highest 10', 'largest']):
            n = 10 if '10' in q_lower else 5
            top_records = df.sort_values(by=matched_col, ascending=False).head(n)[[matched_col] + [c for c in columns if c != matched_col][:3]]
            top_list = top_records.replace({np.nan: None}).to_dict(orient='records')
            return {
                "success": True,
                "query": query,
                "answer": f"Here are the top {n} records with the highest '{matched_col}' values (ranging from {float(s.max()):,.2f} down to {float(top_records[matched_col].iloc[-1]):,.2f}).",
                "metric_value": float(s.max()),
                "data_table": top_list,
                "chart": {
                    "type": "bar",
                    "x_label": "Record",
                    "y_label": matched_col,
                    "data": [{"name": f"Rank #{i+1}", "value": round(float(r[matched_col]), 2)} for i, r in enumerate(top_list)]
                }
            }

    # Intent 4: Categorical column frequency distribution
    if matched_col and matched_col in cat_cols:
        s = df[matched_col].dropna().astype(str)
        vc = s.value_counts()
        if any(k in q_lower for k in ['most common', 'dominant', 'highest category', 'highest frequency', 'top category']):
            top_cat = str(vc.index[0])
            top_cnt = int(vc.iloc[0])
            top_pct = round((top_cnt / len(s)) * 100, 2)
            return {
                "success": True,
                "query": query,
                "answer": f"In column '{matched_col}', the dominant category is '{top_cat}' with {top_cnt:,} occurrences ({top_pct}% of valid entries).",
                "metric_value": top_cnt,
                "data_table": [{"category": str(k), "count": int(v), "percentage": f"{round((v/len(s))*100, 1)}%"} for k, v in vc.head(6).items()],
                "chart": {
                    "type": "bar",
                    "x_label": matched_col,
                    "y_label": "Count",
                    "data": [{"name": str(k), "value": int(v)} for k, v in vc.head(6).items()]
                }
            }
        else:
            return {
                "success": True,
                "query": query,
                "answer": f"Column '{matched_col}' contains {len(vc)} unique categories across {len(s):,} entries. Most frequent is '{vc.index[0]}' ({vc.iloc[0]:,} times).",
                "metric_value": len(vc),
                "data_table": [{"category": str(k), "count": int(v), "percentage": f"{round((v/len(s))*100, 1)}%"} for k, v in vc.head(6).items()],
                "chart": {
                    "type": "bar",
                    "x_label": matched_col,
                    "y_label": "Count",
                    "data": [{"name": str(k), "value": int(v)} for k, v in vc.head(6).items()]
                }
            }

    # Intent 5: Relationship / Correlation between two features
    multi_matched = match_multiple_columns(q_lower, num_cols)
    if len(multi_matched) >= 2 or any(k in q_lower for k in ['correlation', 'relationship', 'associated', 'relate']):
        c1 = multi_matched[0] if len(multi_matched) > 0 else (num_cols[0] if len(num_cols) > 0 else None)
        c2 = multi_matched[1] if len(multi_matched) > 1 else (num_cols[1] if len(num_cols) > 1 else None)
        
        if c1 and c2 and c1 != c2:
            s1 = pd.to_numeric(df[c1], errors='coerce')
            s2 = pd.to_numeric(df[c2], errors='coerce')
            clean_mask = ~(s1.isna() | s2.isna())
            r_val = float(np.corrcoef(s1[clean_mask], s2[clean_mask])[0, 1])
            
            direction = "positive" if r_val > 0 else "negative"
            strength = "strong" if abs(r_val) >= 0.5 else ("moderate" if abs(r_val) >= 0.3 else "weak")
            
            return {
                "success": True,
                "query": query,
                "answer": f"The Pearson correlation between '{c1}' and '{c2}' is r = {r_val:.3f}. This signifies a {strength} {direction} linear relationship.",
                "metric_value": round(r_val, 3),
                "data_table": [{"Feature 1": c1, "Feature 2": c2, "Correlation (r)": round(r_val, 3), "Strength": strength.capitalize()}],
                "chart": None
            }

    # Intent 6: Dataset size / Row count / Dimensions
    if any(k in q_lower for k in ['how many rows', 'total records', 'how many columns', 'dataset size', 'shape', 'dimensions']):
        return {
            "success": True,
            "query": query,
            "answer": f"The dataset contains {row_count:,} rows and {col_count} columns ({len(num_cols)} numerical, {len(cat_cols)} categorical, {len(dt_cols)} datetime).",
            "metric_value": row_count,
            "data_table": [
                {"Dimension": "Total Rows", "Count": row_count},
                {"Dimension": "Total Columns", "Count": col_count},
                {"Dimension": "Numerical Features", "Count": len(num_cols)},
                {"Dimension": "Categorical Features", "Count": len(cat_cols)}
            ],
            "chart": None
        }

    # Fallback response explaining what was searched and how to formulate questions
    avail_cols = ", ".join([f"'{c}'" for c in columns[:8]])
    sample_num = num_cols[0] if num_cols else 'Column'
    sample_cat = cat_cols[0] if cat_cols else 'Category'
    sample_val = num_cols[0] if num_cols else 'Value'
    
    return {
        "success": False,
        "query": query,
        "answer": f"I couldn't locate a precise match for '{query}' in the current dataset schema. Available columns include: {avail_cols}. Try asking queries like: 'What is the average of {sample_num}?', 'Which {sample_cat} has the highest {sample_val}?', or 'Which column has the most missing values?'.",
        "metric_value": None,
        "data_table": None,
        "chart": None
    }