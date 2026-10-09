from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
from pathlib import Path

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

try:
    from app.core.database import init_db
    from app.api.endpoints import dataset, analysis_routes, ml_routes, report_routes
except ImportError:
    from .core.database import init_db
    from .api.endpoints import dataset, analysis_routes, ml_routes, report_routes

# Ensure database tables exist
init_db()

app = FastAPI(
    title="DataLens AI - Postgraduate Dataset Analysis & Insight Platform",
    description="Full-stack AI-driven Dataset Intelligence Engine with Automated Profiling, Quality Auditing, EDA, Visualizations, AI Insights, NL Querying, AutoML, Explainability, Outlier Diagnostics, and Time-Series Forecasting.",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DataLens AI Intelligence Platform",
        "version": "2.0.0",
        "engine": "FastAPI + Pandas + Scikit-Learn + NumPy"
    }

# Include Modular Routers
app.include_router(dataset.router, prefix="/api", tags=["Dataset Management"])
app.include_router(analysis_routes.router, prefix="/api", tags=["Analysis & Intelligence Engine"])
app.include_router(ml_routes.router, prefix="/api", tags=["Machine Learning & Explainable AI"])
app.include_router(report_routes.router, prefix="/api", tags=["Research-Style Report Generator"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Analysis execution error: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True, app_dir=str(backend_dir))