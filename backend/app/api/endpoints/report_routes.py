from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import HTMLResponse

from ...core.database import get_dataset_record
from ...reports.generator import generate_full_research_report

router = APIRouter()

def get_file_path_and_name(dataset_id: str):
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing from disk.")
    return file_path, record["original_name"]

class ReportReq(BaseModel):
    dataset_id: str
    target_column: Optional[str] = None

@router.post("/report")
def post_generate_report(req: ReportReq):
    file_path, filename = get_file_path_and_name(req.dataset_id)
    try:
        html = generate_full_research_report(file_path, filename, req.target_column)
        return {"success": True, "dataset_id": req.dataset_id, "filename": filename, "html": html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

@router.get("/report/{dataset_id}/preview", response_class=HTMLResponse)
def preview_report(dataset_id: str, target_column: Optional[str] = None):
    file_path, filename = get_file_path_and_name(dataset_id)
    try:
        html = generate_full_research_report(file_path, filename, target_column)
        return HTMLResponse(content=html, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report preview error: {str(e)}")

@router.get("/report/{dataset_id}/download")
def download_report(dataset_id: str, target_column: Optional[str] = None):
    file_path, filename = get_file_path_and_name(dataset_id)
    try:
        html = generate_full_research_report(file_path, filename, target_column)
        safe_name = Path(filename).stem
        return Response(
            content=html,
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename=DataLens_AI_Research_Report_{safe_name}.html"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report download error: {str(e)}")