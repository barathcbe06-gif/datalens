from pathlib import Path
from fastapi import APIRouter, HTTPException
from ...core.database import get_dataset_record
from ...services.quality_service import calculate_data_quality

router = APIRouter()

@router.get("/quality/{dataset_id}")
def get_quality_score(dataset_id: str):
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file not found on disk.")
        
    try:
        return calculate_data_quality(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quality calculation error: {str(e)}")
