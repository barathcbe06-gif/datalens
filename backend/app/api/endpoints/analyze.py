from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, HTTPException
from ...core.database import get_dataset_record
from ...services.analysis_service import analyze_dataset

router = APIRouter()

class AnalyzeRequest(BaseModel):
    dataset_id: str

@router.get("/analyze/{dataset_id}")
@router.post("/analyze/{dataset_id}")
def analyze_by_id(dataset_id: str):
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found. Please upload a dataset first.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found on disk.")
        
    try:
        results = analyze_dataset(file_path)
        results["dataset_meta"] = record
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/analyze")
def analyze_post_body(req: AnalyzeRequest):
    return analyze_by_id(req.dataset_id)
