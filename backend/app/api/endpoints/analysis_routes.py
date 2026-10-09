from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException

from ...core.database import get_dataset_record
from ...analysis.profiler import profile_dataset
from ...analysis.quality import calculate_data_quality
from ...analysis.eda import perform_eda
from ...analysis.visualization import generate_auto_visualizations, execute_custom_chart
from ...analysis.insights import generate_ai_insights
from ...analysis.outliers import detect_outliers
from ...analysis.nlp_query import answer_data_query
from ...forecasting.forecasting import analyze_time_series

router = APIRouter()

def get_file_path(dataset_id: str) -> Path:
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset record not found in system.")
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found on disk.")
    return file_path

class DatasetIdReq(BaseModel):
    dataset_id: str

class CustomChartReq(BaseModel):
    dataset_id: str
    chart_type: str
    x_col: str
    y_col: Optional[str] = None
    aggregation: str = "none"
    limit: int = 50

class AskQueryReq(BaseModel):
    dataset_id: str
    query: str

class OutliersReq(BaseModel):
    dataset_id: str
    contamination: Optional[float] = 0.05

class ForecastReq(BaseModel):
    dataset_id: str
    date_col: Optional[str] = None
    target_col: Optional[str] = None
    horizon: Optional[int] = 14

# --- 1. PROFILING ---
@router.get("/profile/{dataset_id}")
@router.post("/profile/{dataset_id}")
def get_profile(dataset_id: str):
    file_path = get_file_path(dataset_id)
    try:
        return profile_dataset(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profiling failed: {str(e)}")

@router.post("/profile")
def post_profile(req: DatasetIdReq):
    return get_profile(req.dataset_id)

# Legacy alias
@router.get("/analyze/{dataset_id}")
@router.post("/analyze/{dataset_id}")
def legacy_analyze(dataset_id: str):
    return get_profile(dataset_id)

# --- 2. DATA QUALITY ---
@router.get("/quality/{dataset_id}")
@router.post("/quality/{dataset_id}")
def get_quality(dataset_id: str):
    file_path = get_file_path(dataset_id)
    try:
        return calculate_data_quality(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quality audit failed: {str(e)}")

@router.post("/quality")
def post_quality(req: DatasetIdReq):
    return get_quality(req.dataset_id)

# --- 3. EDA ---
@router.get("/eda/{dataset_id}")
@router.post("/eda/{dataset_id}")
def get_eda(dataset_id: str):
    file_path = get_file_path(dataset_id)
    try:
        return perform_eda(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"EDA calculation failed: {str(e)}")

@router.post("/eda")
def post_eda(req: DatasetIdReq):
    return get_eda(req.dataset_id)

# --- 4. VISUALIZATIONS ---
@router.get("/visualize/{dataset_id}")
@router.post("/visualize/{dataset_id}")
def get_visualizations(dataset_id: str):
    file_path = get_file_path(dataset_id)
    try:
        return generate_auto_visualizations(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visual analytics failed: {str(e)}")

@router.post("/visualize")
def post_visualize(req: DatasetIdReq):
    return get_visualizations(req.dataset_id)

@router.post("/visualize/custom")
def post_custom_chart(req: CustomChartReq):
    file_path = get_file_path(req.dataset_id)
    try:
        return execute_custom_chart(
            file_path=file_path,
            chart_type=req.chart_type,
            x_col=req.x_col,
            y_col=req.y_col,
            aggregation=req.aggregation,
            limit=req.limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Custom chart error: {str(e)}")

# --- 5. INSIGHTS ---
@router.get("/insights/{dataset_id}")
@router.post("/insights/{dataset_id}")
def get_insights(dataset_id: str):
    file_path = get_file_path(dataset_id)
    try:
        return generate_ai_insights(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight generation failed: {str(e)}")

@router.post("/insights")
def post_insights(req: DatasetIdReq):
    return get_insights(req.dataset_id)

# --- 6. ASK YOUR DATA ---
@router.post("/ask")
def ask_data(req: AskQueryReq):
    file_path = get_file_path(req.dataset_id)
    try:
        return answer_data_query(file_path, req.query)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Query error: {str(e)}")

# --- 7. OUTLIERS ---
@router.get("/outliers/{dataset_id}")
@router.post("/outliers/{dataset_id}")
def get_outliers(dataset_id: str, contamination: float = 0.05):
    file_path = get_file_path(dataset_id)
    try:
        return detect_outliers(file_path, contamination=contamination)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outlier detection failed: {str(e)}")

@router.post("/outliers")
def post_outliers(req: OutliersReq):
    return get_outliers(req.dataset_id, contamination=req.contamination or 0.05)

# --- 8. FORECASTING ---
@router.get("/forecast/{dataset_id}")
@router.post("/forecast/{dataset_id}")
def get_forecast(dataset_id: str, date_col: Optional[str] = None, target_col: Optional[str] = None, horizon: int = 14):
    file_path = get_file_path(dataset_id)
    try:
        return analyze_time_series(file_path, date_col=date_col, target_col=target_col, horizon=horizon)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")

@router.post("/forecast")
def post_forecast(req: ForecastReq):
    return get_forecast(
        dataset_id=req.dataset_id,
        date_col=req.date_col,
        target_col=req.target_col,
        horizon=req.horizon or 14
    )