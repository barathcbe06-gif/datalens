from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from ...core.database import get_dataset_record
from ...services.ml_service import check_ml_suitability, train_ml_pipeline, predict_single

router = APIRouter()

class TrainMLRequest(BaseModel):
    dataset_id: str
    target_column: str
    problem_type: Optional[str] = "auto"
    model_algorithm: Optional[str] = "random_forest"

class PredictRequest(BaseModel):
    model_id: str
    features: Dict[str, Any]

@router.get("/ml/check/{dataset_id}")
def check_suitability(dataset_id: str):
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing.")
        
    try:
        return check_ml_suitability(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML suitability check failed: {str(e)}")

@router.post("/ml/train")
def train_model(req: TrainMLRequest):
    record = get_dataset_record(req.dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing.")
        
    try:
        results = train_ml_pipeline(
            file_path=file_path,
            target_col=req.target_column,
            problem_type=req.problem_type,
            model_algo=req.model_algorithm or "random_forest"
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ML training failed: {str(e)}")

@router.post("/ml/predict")
def predict_model(req: PredictRequest):
    try:
        return predict_single(req.model_id, req.features)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")
