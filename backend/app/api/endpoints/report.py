from pathlib import Path
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import HTMLResponse
from ...core.database import get_dataset_record
from ...services.report_service import generate_html_report

router = APIRouter()

@router.get("/report/{dataset_id}/preview", response_class=HTMLResponse)
def preview_report(dataset_id: str):
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing.")
        
    try:
        html_content = generate_html_report(file_path, record["original_name"])
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

@router.get("/report/{dataset_id}/download")
def download_report(dataset_id: str):
    record = get_dataset_record(dataset_id)
    if not record:
        raise HTTPException(status_code=404, detail="Dataset not found.")
        
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset file missing.")
        
    try:
        html_content = generate_html_report(file_path, record["original_name"])
        safe_name = Path(record["original_name"]).stem
        return Response(
            content=html_content,
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename=DataLens_Report_{safe_name}.html"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report download error: {str(e)}")
