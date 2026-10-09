import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from ...core.config import UPLOADS_DIR, SAMPLE_DATA_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES
from ...core.database import save_dataset_record, get_dataset_record, list_all_datasets
from ...analysis.profiler import load_dataframe

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")
        
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Please upload a .csv, .xlsx, or .xls file."
        )
        
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size of 50 MB.")
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    dataset_id = str(uuid.uuid4())
    safe_filename = f"{dataset_id}{ext}"
    saved_path = UPLOADS_DIR / safe_filename
    
    with open(saved_path, "wb") as f:
        f.write(contents)
        
    try:
        df = load_dataframe(saved_path)
        rows, cols = df.shape
    except Exception as e:
        if saved_path.exists():
            saved_path.unlink()
        raise HTTPException(status_code=400, detail=f"Failed to parse dataset: {str(e)}")
        
    save_dataset_record(
        dataset_id=dataset_id,
        filename=safe_filename,
        original_name=file.filename,
        file_size=len(contents),
        file_path=str(saved_path),
        file_type=ext.replace(".", ""),
        row_count=rows,
        col_count=cols
    )
    
    return {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "file_size": len(contents),
        "row_count": rows,
        "col_count": cols,
        "message": "Dataset uploaded and verified successfully."
    }

@router.get("/datasets")
def get_datasets_history():
    return list_all_datasets()

@router.get("/sample-datasets")
def get_sample_datasets():
    return [
        {
            "id": "customers_churn",
            "name": "Customer Churn & Retention",
            "filename": "customers_churn.csv",
            "description": "Telecom customer subscriber profiles, contract tenure, payment methods, and churn outcomes.",
            "type": "csv",
            "category": "Classification / Business Analytics",
            "suggested_target": "Churn"
        },
        {
            "id": "house_prices",
            "name": "Real Estate House Valuation",
            "filename": "house_prices.csv",
            "description": "Property dimensions, bedrooms, location type, age, and market valuation prices.",
            "type": "csv",
            "category": "Regression / Pricing Model",
            "suggested_target": "Price"
        },
        {
            "id": "employee_performance",
            "name": "Employee Performance & Compensation",
            "filename": "employee_performance.xlsx",
            "description": "Workforce department metrics, experience years, satisfaction scores, and salary bands in Excel format.",
            "type": "xlsx",
            "category": "Multi-class Classification / HR Analytics",
            "suggested_target": "Performance_Rating"
        },
        {
            "id": "retail_sales_timeseries",
            "name": "Omnichannel Retail Sales & Demand",
            "filename": "retail_sales_timeseries.csv",
            "description": "180 days of daily store transactions, sales volume, foot traffic, promotional discounts, and holiday flags.",
            "type": "csv",
            "category": "Time-Series Forecasting / Retail Analytics",
            "suggested_target": "Daily_Sales"
        }
    ]

@router.post("/load-sample/{sample_id}")
def load_sample_dataset(sample_id: str):
    mapping = {
        "customers_churn": "customers_churn.csv",
        "house_prices": "house_prices.csv",
        "employee_performance": "employee_performance.xlsx",
        "retail_sales_timeseries": "retail_sales_timeseries.csv"
    }
    
    if sample_id not in mapping:
        raise HTTPException(status_code=404, detail="Sample dataset not found.")
        
    src_filename = mapping[sample_id]
    src_path = SAMPLE_DATA_DIR / src_filename
    
    if not src_path.exists():
        raise HTTPException(status_code=404, detail="Sample dataset file is missing.")
        
    ext = src_path.suffix.lower()
    dataset_id = str(uuid.uuid4())
    dest_filename = f"{dataset_id}{ext}"
    dest_path = UPLOADS_DIR / dest_filename
    
    shutil.copyfile(src_path, dest_path)
    df = load_dataframe(dest_path)
    rows, cols = df.shape
    
    save_dataset_record(
        dataset_id=dataset_id,
        filename=dest_filename,
        original_name=src_filename,
        file_size=dest_path.stat().st_size,
        file_path=str(dest_path),
        file_type=ext.replace(".", ""),
        row_count=rows,
        col_count=cols
    )
    
    return {
        "dataset_id": dataset_id,
        "filename": src_filename,
        "file_size": dest_path.stat().st_size,
        "row_count": rows,
        "col_count": cols,
        "message": f"Sample dataset '{src_filename}' loaded successfully."
    }