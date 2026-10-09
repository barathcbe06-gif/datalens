from pathlib import Path
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException

from ...core.database import get_dataset_record
from ...ml.automl import inspect_ml_targets, run_automl_pipeline, predict_single_what_if

router = APIRouter()

def get_file_path(dataset_id: str) -> Path:
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset record not found in system.")
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found on disk.")
    return file_path

class AutoMLReq(BaseModel):
    dataset_id: str
    target_column: str
    problem_type: Optional[str] = "auto"

class PredictReq(BaseModel):
    model_id: str
    features: Dict[str, Any]

class ExplainReq(BaseModel):
    dataset_id: str
    target_column: Optional[str] = None

@router.get("/ml/check/{dataset_id}")
def check_ml_eligibility(dataset_id: str):
    file_path = get_file_path(dataset_id)
    try:
        return inspect_ml_targets(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML inspection error: {str(e)}")

@router.post("/automl")
def run_automl(req: AutoMLReq):
    file_path = get_file_path(req.dataset_id)
    try:
        return run_automl_pipeline(
            file_path=file_path,
            target_col=req.target_column,
            problem_type=req.problem_type
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"AutoML execution failed: {str(e)}")

# Legacy train alias
@router.post("/ml/train")
def legacy_train(req: AutoMLReq):
    return run_automl(req)

@router.post("/ml/predict")
def predict_what_if(req: PredictReq):
    try:
        return predict_single_what_if(req.model_id, req.features)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@router.post("/explain")
def get_explain(req: ExplainReq):
    file_path = get_file_path(req.dataset_id)
    target = req.target_column
    if not target:
        targets_info = inspect_ml_targets(file_path)
        if not targets_info.get("targets"):
            raise HTTPException(status_code=400, detail="No suitable target column available for model explanation.")
        target = targets_info["targets"][0]["column"]
    try:
        automl_res = run_automl_pipeline(file_path, target)
        return automl_res["explainability"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Explainability calculation error: {str(e)}")