from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, HTTPException
from ...core.database import get_dataset_record
from ...services.visualization_service import generate_auto_visualizations, execute_custom_chart

router = APIRouter()

class CustomChartRequest(BaseModel):
    dataset_id: str
    chart_type: str
    x_col: str
    y_col: Optional[str] = None
    aggregation: str = "none"
    group_by: Optional[str] = None
    limit: int = 50

@router.get("/visualize/{dataset_id}")
@router.post("/visualize/{dataset_id}")
def get_visualizations(dataset_id: str):
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing.")
        
    try:
        return generate_auto_visualizations(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visualization failed: {str(e)}")

@router.post("/visualize/custom")
def post_custom_chart(req: CustomChartRequest):
    record = get_dataset_record(req.dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing.")
        
    try:
        return execute_custom_chart(
            file_path=file_path,
            chart_type=req.chart_type,
            x_col=req.x_col,
            y_col=req.y_col,
            aggregation=req.aggregation,
            group_by=req.group_by,
            limit=req.limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Custom chart error: {str(e)}")
