# DataLens AI ? Postgraduate-Level Data Science Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Platform-DataLens%20AI%20v2.0-indigo?style=for-the-badge&logo=python" alt="DataLens AI Platform" />
  <img src="https://img.shields.io/badge/Architecture-FastAPI%20%2B%20React%20%2B%20Scikit--Learn-06b6d4?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge" alt="Status" />
</p>

DataLens AI is a full-stack, postgraduate-level Data Science and Dataset Intelligence platform. Engineered with a modular Python analytical pipeline (FastAPI, Pandas, NumPy, Scikit-Learn) and a futuristic, glassmorphic React interface, DataLens AI automates the complete data science lifecycle?from dataset ingestion and exploratory data analysis to competitive AutoML benchmarks, explainable AI, outlier diagnostics, and autoregressive time-series forecasting.

---

## 1. Project Overview & Problem Statement

Modern data workflows require extensive manual effort to profile schemas, evaluate hygiene, generate statistical summaries, detect anomalies, train and compare models, compute feature attributions, and author comprehensive research reports. 

Existing dataset analysis tools often suffer from:
1. **Superficial Metrics**: Basic shape counts and mean values without rigorous non-parametric quartiles, dispersion indices, or skewness metrics.
2. **Hardcoded or Synthetic Results**: Simulated model scores and artificial insights unsupported by the underlying distribution.
3. **Black-Box Modeling**: Silently transforming features without an audit trail or explainability attributions.
4. **Disjointed Interfaces**: Disconnected tools requiring multiple external libraries for EDA, ML, forecasting, and reporting.

**DataLens AI** resolves these limitations by delivering a unified, production-grade intelligence platform that computes 100% of metrics directly from the uploaded dataset with full algorithmic transparency.

---

## 2. Platform Architecture & Core Flow

```
+-------------------------------------------------------------------------+
|                              DATASET UPLOAD                             |
|           Supports CSV, XLSX, and XLS formats (up to 50 MB)             |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                           AUTO DATA PROFILING                           |
|  Type Detection (Num/Cat/Date/Bool), Sparsity, Cardinality, ID & Const  |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                        DATA QUALITY INTELLIGENCE                        |
|  Completeness, Uniqueness, Validity, Consistency, 0-100 Score, Health   |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                          AUTOMATED EDA ENGINE                           |
|  Mean, Median, Mode, Std, Var, Min, Max, Quartiles, IQR, Skew, Kurtosis |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                        VISUAL ANALYTICS ENGINE                          |
|  Category Breakdown, Histograms, Scatter Plots, Correlation Heatmap     |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                            AI INSIGHT ENGINE                            |
|  Data-Backed Findings: Strong/Weak Correlations, Class Imbalance, Tails |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                              ASK YOUR DATA                              |
|  Natural-Language Semantic Querying with Exact Mathematical Evidence    |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                        AUTOML & MODEL COMPARISON                        |
|  Classification (Logistic, Decision Tree, RF) vs Regression (Ridge, RF) |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                             EXPLAINABLE AI                              |
|  MDI Gini Importances & Scikit-Learn Test-Set Permutation Attributions  |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                        OUTLIER & ANOMALY ENGINE                         |
|  Parametric IQR Outlier Bounds vs Multivariate Isolation Forest Trees   |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                          TIME-SERIES FORECAST                           |
|  7-Day Rolling Moving Averages, Autoregressive Lag Model, 95% CI Bands  |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                      RESEARCH-STYLE DATASET REPORT                      |
|  13-Section Formal Thesis Document (Downloadable HTML & Print-Ready PDF)|
+-------------------------------------------------------------------------+
```

---

## 3. Key Modules & Technical Capabilities

### 1. Auto Data Profiling
- **Type Discovery**: Automatically classifies columns into numerical, categorical, datetime, boolean, and text.
- **Structural Integrity**: Computes total records, features, missing cells percentage, duplicate row count, and deep memory footprint.
- **Identifier & Constant Detection**: Identifies zero-variance features and high-cardinality entity IDs to guard against model overfitting.
- **Sanitized Preview**: Generates clean, JSON-safe 100-row preview matrix with search, sorting, and pagination.

### 2. Data Quality Intelligence
- **4-Pillar Scoring Model**:
  - **Completeness (35 pts)**: Penalizes missing cells and sparse features.
  - **Uniqueness (25 pts)**: Evaluates row duplication and record redundancy.
  - **Validity (25 pts)**: Detects zero-variance constants, excessive missingness (>50%), and empty whitespace strings.
  - **Consistency (15 pts)**: Identifies numeric values stored as text and mixed format anomalies.
- **Quality Health Rating**: Categorizes datasets into *Excellent* ($\ge 90$), *Good* ($75-89$), *Moderate* ($55-74$), or *Needs Attention* ($<55$).
- **Prescriptive Guidance**: Formulates concrete data hygiene recommendations (e.g. median imputation, deduplication, robust scaling).

### 3. Automated EDA Engine
- **Parametric & Non-Parametric Statistics**: Calculates Mean, Median, Mode, Standard Deviation, Variance, Min, Max, Range, Q25, Q50 (Median), Q75, Interquartile Range (IQR), Fisher-Pearson Skewness, Fisher's Excess Kurtosis, and Zero Count.
- **Categorical Breakdown**: Top categories, modal percentages, and frequency distributions.
- **Correlation Engine**: Computes pairwise Pearson correlation coefficients with qualitative strength descriptors (*Very Strong*, *Strong*, *Moderate*, *Weak*).

### 4. Smart Visualization & Studio
- **Intelligent Recommendations**: Auto-selects histograms for continuous variables, bar and donut charts for categorical dimensions, scatter plots for correlated pairs, and correlation heatmaps.
- **Custom Chart Studio**: Enables users to configure chart types (Bar, Line, Scatter, Pie, Histogram), select features, and execute on-the-fly aggregations (`AVG`, `SUM`, `MIN`, `MAX`, `COUNT`).

### 5. AI Insight Engine
- Generates verified, human-readable insights derived strictly from mathematical calculations:
  - Strong positive and negative linear correlations ($|r| \ge 0.5$).
  - Distribution tail skewness ($|skew| \ge 1.5$) recommending log transformations.
  - Categorical dominance ($> 60\%$) alerting to class imbalance.
  - Bivariate mean disparities across groups.

### 6. Ask Your Data (Natural-Language Querying)
- Natural language query parser with semantic keyword extraction and fuzzy column matching.
- Evaluates queries such as:
  - *"What is the average Monthly_Charges?"*
  - *"Which department has the highest average marks?"*
  - *"Which column has the most missing values?"*
  - *"Show the top 5 records by Price"*
  - *"What is the relationship between Tenure and Total_Charges?"*
- Returns direct conversational answers, supporting numerical values, evidentiary data tables, and mini charts.

### 7. AutoML & Competitive Model Leaderboard
- **Automatic Problem Ingestion**: Auto-detects classification vs regression based on target cardinality and data type.
- **Preprocessing Audit Trail**: Imputation (median for numeric, mode for categorical), StandardScaler, OneHotEncoder, and feature filtering.
- **Competitive Benchmarks**:
  - **Classification**: Compares Logistic Regression, Decision Tree Classifier, and Random Forest Classifier. Evaluates Accuracy, Precision (weighted), Recall (weighted), and F1-Score (weighted) with confusion matrices.
  - **Regression**: Compares Linear Regression (Ridge), Decision Tree Regressor, and Random Forest Regressor. Evaluates MAE, RMSE, and $R^2$ with actual vs predicted scatter plots.
- **Transparent Champion Selection**: Selects champion based on primary metric (F1 for classification, $R^2$ for regression) with clear technical justification.
- **Live What-If Simulator**: Interactive parameter sliders allowing real-time inference on the champion estimator with confidence probabilities.

### 8. Explainable AI (XAI)
- **Model-Native Attribution**: Computes Mean Decrease in Impurity (Gini / MDI) for tree ensembles and standardized linear coefficients ($|\beta|$).
- **Model-Agnostic Validation**: Computes Scikit-Learn Permutation Feature Importance ($n=5$ repeats) on test data.
- **Ranked Feature Weights**: Visualizes relative percentage contributions and plain-English summaries.

### 9. Outlier Diagnostics
- **Dual-Paradigm Anomaly Detection**:
  - **Univariate IQR Gating**: Evaluates lower bound ($Q1 - 1.5 \times IQR$) and upper bound ($Q3 + 1.5 \times IQR$) per feature.
  - **Multivariate Isolation Forest**: Trees isolate anomalies in multi-dimensional space, reporting contamination percentage and outlier rows.
- **Statistical Context**: Clearly distinguishes statistical outliers from confirmed data errors.

### 10. Time-Series Analysis & Forecasting
- Evaluates temporal continuity when valid date/time and continuous target features exist ($\ge 10$ sequential observations).
- Generates trend direction, moving average curves (7-period rolling mean), and multi-step autoregressive lag Ridge forecasts with 95% confidence intervals.
- Evaluates historical fit with MAE, RMSE, and MAPE.

### 11. Research-Style Dataset Report
- Automated generation of a 13-section, publication-grade dataset report containing:
  1. Executive Summary
  2. Dataset Description
  3. Data Quality Assessment
  4. Automated EDA
  5. Visual Analysis
  6. Key Insights
  7. Outlier Analysis
  8. ML Experiment
  9. Model Comparison Leaderboard
  10. Explainable AI
  11. Forecasting (if applicable)
  12. Conclusions
  13. Recommendations
- Includes one-click Download HTML and Print / PDF styling.

---

## 4. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Recharts |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, SQLite3 |
| **Analytics & ML** | Pandas, NumPy, Scikit-Learn, SciPy, OpenPyXL, Jinja2 |
| **Theme / Aesthetic** | Obsidian Dark Futuristic Theme, Cyber-Glassmorphism, Indigo/Cyan Accents |

---

## 5. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & system status |
| `POST` | `/api/upload` | Upload CSV / Excel dataset (up to 50 MB) |
| `GET` | `/api/datasets` | List uploaded datasets |
| `GET` | `/api/sample-datasets` | List preloaded sample benchmarks |
| `POST` | `/api/load-sample/{sample_id}` | Load sample dataset instantly |
| `GET/POST`| `/api/profile/{dataset_id}` | Auto Data Profiling and schema summary |
| `GET/POST`| `/api/quality/{dataset_id}` | 4-pillar data quality intelligence score |
| `GET/POST`| `/api/eda/{dataset_id}` | Parametric & non-parametric EDA statistics |
| `GET/POST`| `/api/visualize/{dataset_id}` | Recommended chart distributions & scatter plots |
| `POST` | `/api/visualize/custom` | Custom chart aggregation studio |
| `GET/POST`| `/api/insights/{dataset_id}` | Data-backed AI insights and findings |
| `POST` | `/api/ask` | Natural-language conversational data query engine |
| `GET/POST`| `/api/outliers/{dataset_id}` | IQR and Isolation Forest anomaly diagnostics |
| `GET` | `/api/ml/check/{dataset_id}` | Inspect candidate target features |
| `POST` | `/api/automl` | Run multi-model benchmark leaderboard |
| `POST` | `/api/ml/predict` | Live What-If scenario simulation inference |
| `POST` | `/api/explain` | Feature importance and permutation attributions |
| `GET/POST`| `/api/forecast/{dataset_id}` | Time-series moving averages and lag forecasts |
| `POST` | `/api/report` | Generate 13-section research report |
| `GET` | `/api/report/{dataset_id}/preview` | Preview HTML report in browser |
| `GET` | `/api/report/{dataset_id}/download`| Download standalone HTML report file |

---

## 6. Installation & Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the platform.

---

## 7. Sample Datasets Included

1. **Customer Churn & Retention** (`customers_churn.csv`): 350 customer profiles with contract tenure, monthly fees, and churn outcomes. (Classification)
2. **Real Estate House Valuation** (`house_prices.csv`): 300 property dimensions, bedrooms, age, and valuation prices. (Regression)
3. **Employee Performance & Compensation** (`employee_performance.xlsx`): 250 workforce records with experience, satisfaction scores, and salary bands in Excel format. (Multi-class / Regression)
4. **Omnichannel Retail Sales & Demand** (`retail_sales_timeseries.csv`): 180 sequential daily transactions with foot traffic, promotional discounts, and holiday flags. (Time-Series Forecasting)

---

## 8. License & Attribution

Developed as a postgraduate-level Data Science Intelligence Platform. All statistical formulas, metrics, and models adhere to peer-reviewed data science methodologies.
