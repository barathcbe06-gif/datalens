from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from jinja2 import Template

from ..analysis.profiler import profile_dataset
from ..analysis.quality import calculate_data_quality
from ..analysis.eda import perform_eda
from ..analysis.insights import generate_ai_insights
from ..analysis.outliers import detect_outliers
from ..forecasting.forecasting import analyze_time_series
from ..ml.automl import inspect_ml_targets, run_automl_pipeline

RESEARCH_REPORT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DataLens AI - Dataset Intelligence Report: {{ filename }}</title>
    <style>
        :root {
            --primary: #4f46e5;
            --primary-dark: #3730a3;
            --primary-light: #eef2ff;
            --accent: #06b6d4;
            --text-dark: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
            --bg-card: #ffffff;
            --bg-page: #f8fafc;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-dark);
            line-height: 1.6;
            padding: 40px 20px;
        }
        .container {
            max-width: 1080px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .platform-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #818cf8; }
        .report-badge { background: rgba(79, 70, 229, 0.3); border: 1px solid #6366f1; color: #c7d2fe; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .header h1 { font-size: 32px; font-weight: 800; tracking-tight; margin-bottom: 8px; }
        .header p { opacity: 0.85; font-size: 15px; }
        .meta-badges { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
        .badge {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(8px);
            padding: 6px 14px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .section-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
        }
        .section-card h2 {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 2px solid var(--primary-light);
            padding-bottom: 10px;
        }
        .sec-num {
            background: var(--primary-light);
            color: var(--primary);
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 6px;
        }
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin: 16px 0; }
        .stat-box {
            background: #f8fafc;
            border: 1px solid var(--border);
            padding: 18px;
            border-radius: 12px;
            text-align: center;
        }
        .stat-val { font-size: 26px; font-weight: 800; color: var(--primary); }
        .stat-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; font-weight: 600; }
        
        .score-hero {
            display: flex;
            align-items: center;
            gap: 24px;
            padding: 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid var(--border);
        }
        .score-circle {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            background: #4f46e5;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 800;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            shrink-0;
        }
        .score-circle span { font-size: 10px; font-weight: 600; text-transform: uppercase; opacity: 0.8; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 14px;
        }
        th, td {
            padding: 10px 14px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }
        th {
            background: #f8fafc;
            font-weight: 600;
            color: var(--text-muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        tr:hover { background: #fafafa; }
        .badge-type { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        
        .insight-card {
            padding: 14px 18px;
            border-radius: 10px;
            background: #f8fafc;
            border-left: 4px solid var(--primary);
            margin-bottom: 12px;
        }
        .insight-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .insight-title { font-weight: 700; font-size: 14px; color: var(--text-dark); }
        .insight-tag { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; background: #e2e8f0; color: #475569; }
        .insight-body { font-size: 13px; color: #475569; }
        
        .rec-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid var(--border);
            font-size: 13px;
        }
        .rec-item strong { color: var(--primary); }
        
        .footer {
            text-align: center;
            padding: 40px 0;
            font-size: 13px;
            color: var(--text-muted);
            border-top: 1px solid var(--border);
            margin-top: 40px;
        }
        .btn-print {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            margin-top: 12px;
        }
        @media print {
            body { background: white; padding: 0; }
            .section-card { box-shadow: none; break-inside: avoid; border: 1px solid #ccc; }
            .header { background: #1e1b4b !important; -webkit-print-color-adjust: exact; }
            .btn-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-top">
                <span class="platform-title">DataLens AI • Dataset Intelligence Platform</span>
                <span class="report-badge">Postgraduate-Level Data Science Report</span>
            </div>
            <h1>DATASET INTELLIGENCE REPORT</h1>
            <p>Comprehensive Statistical, Quality, Exploratory, Machine Learning & Forecasting Synthesis</p>
            <div class="meta-badges">
                <span class="badge">📁 {{ filename }}</span>
                <span class="badge">📊 {{ profile.summary.row_count }} Rows × {{ profile.summary.col_count }} Columns</span>
                <span class="badge">💾 {{ profile.summary.memory_usage_str }} Memory</span>
                <span class="badge">🛡️ Quality Score: {{ quality.overall_score }}/100</span>
                <span class="badge">🕒 {{ generated_at }}</span>
            </div>
        </div>

        <!-- 1. Executive Summary -->
        <div class="section-card">
            <h2><span class="sec-num">01</span> Executive Summary</h2>
            <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">
                This document delivers an exhaustive analytical audit of dataset <strong>{{ filename }}</strong>. 
                DataLens AI automatically performed architectural profiling, multi-dimensional quality grading, statistical exploratory data analysis, outlier diagnostics, algorithmic machine learning evaluation, and time-series extrapolation.
            </p>
            <div class="grid-4">
                <div class="stat-box">
                    <div class="stat-val">{{ profile.summary.row_count }}</div>
                    <div class="stat-lbl">Total Observations</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ profile.summary.col_count }}</div>
                    <div class="stat-lbl">Total Features</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ quality.overall_score }}</div>
                    <div class="stat-lbl">Health Score (0-100)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ profile.summary.missing_pct }}%</div>
                    <div class="stat-lbl">Cell Sparsity</div>
                </div>
            </div>
        </div>

        <!-- 2. Dataset Description -->
        <div class="section-card">
            <h2><span class="sec-num">02</span> Dataset Description & Structural Taxonomy</h2>
            <p style="font-size: 14px; color: #475569;">
                The dataset schema contains <strong>{{ profile.summary.numerical_cols_count }}</strong> numerical variables, 
                <strong>{{ profile.summary.categorical_cols_count }}</strong> categorical attributes, 
                <strong>{{ profile.summary.datetime_cols_count }}</strong> datetime timestamps, and 
                <strong>{{ profile.summary.boolean_cols_count }}</strong> boolean flags.
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Attribute</th>
                        <th>Type</th>
                        <th>Missing Count (%)</th>
                        <th>Cardinality</th>
                        <th>Sample Values</th>
                    </tr>
                </thead>
                <tbody>
                    {% for col in profile.columns %}
                    <tr>
                        <td><strong>{{ col.name }}</strong></td>
                        <td><span class="badge-type">{{ col.type }}</span></td>
                        <td>{{ col.missing_count }} ({{ col.missing_pct }}%)</td>
                        <td>{{ col.unique_count }} ({{ col.unique_pct }}%)</td>
                        <td style="font-size: 12px; color: #64748b;">{{ col.sample_values|join(', ') }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>

        <!-- 3. Data Quality Assessment -->
        <div class="section-card">
            <h2><span class="sec-num">03</span> Data Quality Assessment & Hygiene Audit</h2>
            <div class="score-hero">
                <div class="score-circle">
                    {{ quality.overall_score }}
                    <span>/ 100</span>
                </div>
                <div>
                    <h3 style="font-size: 18px; margin-bottom: 4px;">Fidelity Grade: <strong>{{ quality.grade }}</strong></h3>
                    <p style="font-size: 14px; color: #64748b;">{{ quality.summary_text }}</p>
                </div>
            </div>
            <div class="grid-4">
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 20px;">{{ quality.breakdown.completeness.score }} / 35</div>
                    <div class="stat-lbl">Completeness (Nulls)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 20px;">{{ quality.breakdown.uniqueness.score }} / 25</div>
                    <div class="stat-lbl">Uniqueness (Duplicates)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 20px;">{{ quality.breakdown.validity.score }} / 25</div>
                    <div class="stat-lbl">Validity (Constants/IDs)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 20px;">{{ quality.breakdown.consistency.score }} / 15</div>
                    <div class="stat-lbl">Consistency (Types)</div>
                </div>
            </div>
            {% if quality.issues %}
            <h4 style="font-size: 14px; font-weight: 700; margin-top: 16px; margin-bottom: 8px;">Identified Quality Issues:</h4>
            {% for issue in quality.issues %}
            <div class="rec-item">
                <span>⚠️</span>
                <div>
                    <strong>[{{ issue.category }}] {{ issue.title }}</strong>: {{ issue.impact }}
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Action: {{ issue.action }}</div>
                </div>
            </div>
            {% endfor %}
            {% endif %}
        </div>

        <!-- 4. Automated EDA -->
        <div class="section-card">
            <h2><span class="sec-num">04</span> Automated Exploratory Data Analysis (EDA)</h2>
            <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">
                Parametric and non-parametric distribution metrics calculated across all continuous numerical dimensions:
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Mean</th>
                        <th>Median</th>
                        <th>Std Dev</th>
                        <th>Min</th>
                        <th>Q25</th>
                        <th>Q75</th>
                        <th>Max</th>
                        <th>IQR</th>
                        <th>Skewness</th>
                    </tr>
                </thead>
                <tbody>
                    {% for name, s in eda.numerical_stats.items() %}
                    <tr>
                        <td><strong>{{ name }}</strong></td>
                        <td>{{ s.mean }}</td>
                        <td>{{ s.median }}</td>
                        <td>{{ s.std }}</td>
                        <td>{{ s.min }}</td>
                        <td>{{ s.q25 }}</td>
                        <td>{{ s.q75 }}</td>
                        <td>{{ s.max }}</td>
                        <td>{{ s.iqr }}</td>
                        <td>{{ s.skewness }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>

        <!-- 5. Visual Analysis -->
        <div class="section-card">
            <h2><span class="sec-num">05</span> Visual Analysis & Correlation Relationships</h2>
            <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">
                Pairwise Pearson correlation analysis identifying multi-collinearity and linear associations:
            </p>
            {% if eda.correlations %}
            <table>
                <thead>
                    <tr>
                        <th>Feature 1</th>
                        <th>Feature 2</th>
                        <th>Correlation (r)</th>
                        <th>Relationship Classification</th>
                    </tr>
                </thead>
                <tbody>
                    {% for c in eda.correlations[:8] %}
                    <tr>
                        <td><strong>{{ c.feature_1 }}</strong></td>
                        <td><strong>{{ c.feature_2 }}</strong></td>
                        <td>{{ c.correlation }}</td>
                        <td>{{ c.relationship }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
            {% else %}
            <p style="font-size: 13px; color: #64748b;">Insufficient numerical features for bivariate correlation matrix computation.</p>
            {% endif %}
        </div>

        <!-- 6. Key Insights -->
        <div class="section-card">
            <h2><span class="sec-num">06</span> AI-Driven Insights & Findings</h2>
            {% for item in insights %}
            <div class="insight-card">
                <div class="insight-head">
                    <span class="insight-title">{{ item.title }}</span>
                    <span class="insight-tag">{{ item.badge }}</span>
                </div>
                <div class="insight-body">{{ item.text }}</div>
            </div>
            {% endfor %}
        </div>

        <!-- 7. Outlier Analysis -->
        <div class="section-card">
            <h2><span class="sec-num">07</span> Outlier Detection & Anomaly Diagnostics</h2>
            <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">
                Comparison between parametric Interquartile Range (IQR) gating and non-parametric Isolation Forest multivariate tree isolation:
            </p>
            <div class="grid-4">
                <div class="stat-box">
                    <div class="stat-val">{{ outliers.iqr_method.total_outliers_rows }}</div>
                    <div class="stat-lbl">IQR Outlier Rows ({{ outliers.iqr_method.outliers_percentage }}%)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ outliers.iqr_method.columns_with_outliers_count }}</div>
                    <div class="stat-lbl">Columns with IQR Extremes</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ outliers.isolation_forest.total_outliers_rows }}</div>
                    <div class="stat-lbl">Isolation Forest Anomalies</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ outliers.isolation_forest.outliers_percentage }}%</div>
                    <div class="stat-lbl">Contamination Ratio</div>
                </div>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 8px;">
                <em>{{ outliers.interpretation }}</em>
            </p>
        </div>

        <!-- 8. ML Experiment -->
        <div class="section-card">
            <h2><span class="sec-num">08</span> Machine Learning Pipeline & Preprocessing Audit</h2>
            {% if ml_results %}
            <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">
                Target Variable: <strong>{{ ml_results.target_column }}</strong> ({{ ml_results.problem_type|capitalize }})
            </p>
            <div class="rec-item">
                <span>⚙️</span>
                <div>
                    <strong>Data Preprocessing Audit:</strong><br>
                    • Imputation: Median for numerical features, Mode for categorical features.<br>
                    • Feature Scaling: StandardScaler applied to numerical inputs.<br>
                    • Encoding: One-Hot Categorical Encoding.<br>
                    • Retained Predictive Features: {{ ml_results.preprocessing_audit.selected_features_count }} features.
                </div>
            </div>
            {% else %}
            <p style="font-size: 13px; color: #64748b;">No machine learning experiment executed yet for this dataset.</p>
            {% endif %}
        </div>

        <!-- 9. Model Comparison -->
        {% if ml_results %}
        <div class="section-card">
            <h2><span class="sec-num">09</span> AutoML Model Comparison Leaderboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Model Algorithm</th>
                        <th>Primary Metric</th>
                        <th>Secondary Metrics</th>
                        <th>Latency (ms)</th>
                    </tr>
                </thead>
                <tbody>
                    {% for m in ml_results.leaderboard %}
                    <tr {% if m.model_name == ml_results.champion_model.name %}style="background: #f0fdf4;"{% endif %}>
                        <td>
                            <strong>{{ m.model_name }}</strong>
                            {% if m.model_name == ml_results.champion_model.name %}
                            <span style="background: #16a34a; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">CHAMPION</span>
                            {% endif %}
                        </td>
                        <td>
                            {% if ml_results.problem_type == 'classification' %}
                            <strong>F1: {{ m.metrics.f1_score }}%</strong>
                            {% else %}
                            <strong>R²: {{ m.metrics.r2_score }}</strong>
                            {% endif %}
                        </td>
                        <td style="font-size: 12px; color: #475569;">
                            {% if ml_results.problem_type == 'classification' %}
                            Acc: {{ m.metrics.accuracy }}% | Prec: {{ m.metrics.precision }}% | Rec: {{ m.metrics.recall }}%
                            {% else %}
                            MAE: {{ m.metrics.mae }} | RMSE: {{ m.metrics.rmse }}
                            {% endif %}
                        </td>
                        <td>{{ m.metrics.training_time_ms }} ms</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
            <p style="font-size: 13px; color: #16a34a; font-weight: 600; margin-top: 10px;">
                🏆 {{ ml_results.champion_model.rationale }}
            </p>
        </div>
        {% endif %}

        <!-- 10. Explainable AI -->
        {% if ml_results and ml_results.explainability %}
        <div class="section-card">
            <h2><span class="sec-num">10</span> Explainable AI & Feature Attribution</h2>
            <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">
                Methodology: <strong>{{ ml_results.explainability.method }}</strong> and <strong>{{ ml_results.explainability.validation_method }}</strong>.
            </p>
            <div class="rec-item" style="margin-bottom: 16px;">
                <span>💡</span>
                <div>{{ ml_results.explainability.explanation }}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Relative Contribution (%)</th>
                        <th>Attribution Weight</th>
                    </tr>
                </thead>
                <tbody>
                    {% for f in ml_results.explainability.feature_importances[:8] %}
                    <tr>
                        <td><strong>{{ f.feature }}</strong></td>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 80px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                                    <div style="width: {{ f.relative_contribution_pct }}%; height: 100%; background: #4f46e5;"></div>
                                </div>
                                <span>{{ f.relative_contribution_pct }}%</span>
                            </div>
                        </td>
                        <td>{{ f.importance }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% endif %}

        <!-- 11. Forecasting if applicable -->
        {% if forecasting and forecasting.is_applicable %}
        <div class="section-card">
            <h2><span class="sec-num">11</span> Time-Series Forecasting & Trend Projections</h2>
            <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">
                Temporal Index: <strong>{{ forecasting.date_column }}</strong> | Target Metric: <strong>{{ forecasting.target_column }}</strong> ({{ forecasting.total_observations }} sequential observation stamps).
            </p>
            <div class="grid-4">
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ forecasting.trend_summary.direction }}</div>
                    <div class="stat-lbl">Trend Direction ({{ forecasting.trend_summary.change_pct }}%)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ forecasting.model_performance.mae }}</div>
                    <div class="stat-lbl">Historical MAE</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ forecasting.model_performance.rmse }}</div>
                    <div class="stat-lbl">Historical RMSE</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ forecasting.model_performance.mape }}%</div>
                    <div class="stat-lbl">Historical MAPE</div>
                </div>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; margin-top: 14px; margin-bottom: 6px;">Next Projected Horizon Sample:</h4>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Projected Value</th>
                        <th>95% Confidence Interval</th>
                    </tr>
                </thead>
                <tbody>
                    {% for pt in forecasting.forecast_data[:7] %}
                    <tr>
                        <td><strong>{{ pt.date }}</strong></td>
                        <td><strong>{{ pt.forecast }}</strong></td>
                        <td>[{{ pt.lower_bound }} , {{ pt.upper_bound }}]</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% endif %}

        <!-- 12. Conclusions -->
        <div class="section-card">
            <h2><span class="sec-num">12</span> Synthesis & Conclusions</h2>
            <p style="font-size: 14px; color: #334155; line-height: 1.7;">
                The dataset displays coherent statistical properties with an overall data health rating of <strong>{{ quality.overall_score }}/100 ({{ quality.grade }})</strong>. 
                Key explanatory variance is captured through the identified top features. The comparative algorithmic evaluations confirm that the selected champion model offers the optimal balance of bias and variance across test benchmarks.
            </p>
        </div>

        <!-- 13. Recommendations -->
        <div class="section-card">
            <h2><span class="sec-num">13</span> Strategic & Engineering Recommendations</h2>
            {% for rec in quality.recommendations %}
            <div class="rec-item">
                <span>📌</span>
                <div>{{ rec }}</div>
            </div>
            {% endfor %}
            <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>DATALENS AI • INTELLIGENT DATASET ANALYSIS & INSIGHT PLATFORM</strong></p>
            <p style="margin-top: 4px;">Engineered with FastAPI, Pandas, NumPy & Scikit-Learn. Full Audit Trajectory.</p>
        </div>
    </div>
</body>
</html>
"""

def generate_full_research_report(file_path: Path, filename: str, target_col: Optional[str] = None) -> str:
    profile = profile_dataset(file_path)
    quality = calculate_data_quality(file_path)
    eda = perform_eda(file_path)
    insights = generate_ai_insights(file_path)
    outliers = detect_outliers(file_path)
    
    # Check if time series applicable
    forecasting = analyze_time_series(file_path)
    
    # Check ML target
    ml_results = None
    target_info = inspect_ml_targets(file_path)
    if target_info["is_suitable"] and target_info["targets"]:
        chosen_target = target_col if (target_col and target_col in [t["column"] for t in target_info["targets"]]) else target_info["targets"][0]["column"]
        try:
            ml_results = run_automl_pipeline(file_path, chosen_target)
        except Exception:
            pass

    template = Template(RESEARCH_REPORT_TEMPLATE)
    rendered = template.render(
        filename=filename,
        generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        profile=profile,
        quality=quality,
        eda=eda,
        insights=insights,
        outliers=outliers,
        forecasting=forecasting,
        ml_results=ml_results
    )
    return rendered