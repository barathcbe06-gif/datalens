import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from .config import DB_PATH

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        row_count INTEGER DEFAULT 0,
        col_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trained_models (
        id TEXT PRIMARY KEY,
        dataset_id TEXT NOT NULL,
        target_column TEXT NOT NULL,
        problem_type TEXT NOT NULL,
        model_name TEXT NOT NULL,
        metrics_json TEXT NOT NULL,
        feature_names_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(dataset_id) REFERENCES datasets(id)
    )
    ''')
    
    conn.commit()
    conn.close()

def save_dataset_record(dataset_id: str, filename: str, original_name: str, file_size: int, file_path: str, file_type: str, row_count: int, col_count: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO datasets (id, filename, original_name, file_size, file_path, file_type, row_count, col_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        row_count=excluded.row_count,
        col_count=excluded.col_count
    ''', (dataset_id, filename, original_name, file_size, file_path, file_type, row_count, col_count, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def get_dataset_record(dataset_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM datasets WHERE id = ?', (dataset_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def list_all_datasets() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM datasets ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def save_trained_model(model_id: str, dataset_id: str, target_column: str, problem_type: str, model_name: str, metrics: dict, feature_names: list):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO trained_models (id, dataset_id, target_column, problem_type, model_name, metrics_json, feature_names_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (model_id, dataset_id, target_column, problem_type, model_name, json.dumps(metrics), json.dumps(feature_names), datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
