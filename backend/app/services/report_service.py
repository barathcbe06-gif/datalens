import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from jinja2 import Template
from .analysis_service import analyze_dataset
from .quality_service import calculate_data_quality

HTML_REPORT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DataLens AI - Analysis Report: {{ filename }}</title>
    <style>
        :root {
            --primary: #4f46e5;
            --primary-light: #eef2ff;
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
            line-height: 1.5;
            padding: 40px 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 32px;
            border-radius: 16px;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.2);
        }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { opacity: 0.9; font-size: 15px; }
        .meta-badges { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
        .badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
        }
        .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .card h2 {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 16px;
            border-bottom: 2px solid var(--primary-light);
            padding-bottom: 8px;
        }
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px; }
        .stat-box {
            background: #f8fafc;
            border: 1px solid var(--border);
            padding: 16px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-val { font-size: 24px; font-weight: 700; color: var(--primary); }
        .stat-lbl { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        
        .score-box {
            display: flex;
            align-items: center;
            gap: 24px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            margin-bottom: 16px;
        }
        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #4f46e5;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 12px;
        }
        th, td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }
        th {
            background: #f8fafc;
            font-weight: 600;
            color: var(--text-muted);
        }
        tr:hover { background: #fdfdfd; }
        .insight-item {
            padding: 12px 16px;
            border-radius: 8px;
            background: #f8fafc;
            border-left: 4px solid var(--primary);
            margin-bottom: 10px;
        }
        .insight-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }
        .insight-desc { font-size: 13px; color: #475569; }
        .footer { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 40px; }
        @media print {
            body { background: white; padding: 0; }
            .card { box-shadow: none; break-inside: avoid; }
            .header { background: #4f46e5 !important; -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DataLens AI - Comprehensive Dataset Report</h1>
            <p>Generated on {{ generated_at }} for <strong>{{ filename }}</strong></p>
            <div class="meta-badges">
                <span class="badge">{{ summary.row_count }} Rows</span>
                <span class="badge">{{ summary.col_count }} Columns</span>
                <span class="badge">{{ summary.memory_usage_str }} Size</span>
                <span class="badge">Quality Score: {{ quality.overall_score }}/100</span>
            </div>
        </div>

        <div class="card">
            <h2>1. Dataset Executive Summary</h2>
            <div class="grid-4">
                <div class="stat-box">
                    <div class="stat-val">{{ summary.row_count }}</div>
                    <div class="stat-lbl">Total Records</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ summary.col_count }}</div>
                    <div class="stat-lbl">Features</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ summary.total_missing }} ({{ summary.missing_pct }}%)</div>
                    <div class="stat-lbl">Missing Cells</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">{{ summary.duplicate_count }}</div>
                    <div class="stat-lbl">Duplicate Rows</div>
                </div>
            </div>
            <p style="font-size: 14px; color: #475569; margin-top: 8px;">
                Identified <strong>{{ summary.numerical_cols_count }}</strong> numerical variables, <strong>{{ summary.categorical_cols_count }}</strong> categorical features, and <strong>{{ summary.datetime_cols_count }}</strong> temporal columns.
            </p>
        </div>

        <div class="card">
            <h2>2. Data Quality & Integrity Assessment</h2>
            <div class="score-box">
                <div class="score-circle">{{ quality.overall_score }}</div>
                <div>
                    <h3 style="font-size: 18px; margin-bottom: 4px;">Health Status: {{ quality.grade }}</h3>
                    <p style="font-size: 14px; color: #64748b;">{{ quality.summary_text }}</p>
                </div>
            </div>
            <div class="grid-4" style="margin-top: 16px;">
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ quality.breakdown.completeness.score }} / 35</div>
                    <div class="stat-lbl">Completeness</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ quality.breakdown.uniqueness.score }} / 25</div>
                    <div class="stat-lbl">Uniqueness</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ quality.breakdown.validity.score }} / 25</div>
                    <div class="stat-lbl">Validity</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val" style="font-size: 18px;">{{ quality.breakdown.consistency.score }} / 15</div>
                    <div class="stat-lbl">Consistency</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>3. Automated Data Insights & Observations</h2>
            {% for item in insights %}
            <div class="insight-item">
                <div class="insight-title">{{ item.title }} [{{ item.badge }}]</div>
                <div class="insight-desc">{{ item.text }}</div>
            </div>
            {% endfor %}
        </div>

        <div class="card">
            <h2>4. Feature Schema & Column Profiling</h2>
            <table>
                <thead>
                    <tr>
                        <th>Feature Name</th>
                        <th>Type</th>
                        <th>Missing Count</th>
                        <th>Missing %</th>
                        <th>Unique Count</th>
                        <th>Key Samples</th>
                    </tr>
                </thead>
                <tbody>
                    {% for col in columns %}
                    <tr>
                        <td><strong>{{ col.name }}</strong></td>
                        <td><span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{{ col.type }}</span></td>
                        <td>{{ col.missing_count }}</td>
                        <td>{{ col.missing_pct }}%</td>
                        <td>{{ col.unique_count }}</td>
                        <td style="color: #64748b; font-size: 12px;">{{ col.sample_values|join(', ') }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>

        {% if numerical_stats %}
        <div class="card">
            <h2>5. Numerical Descriptive Statistics</h2>
            <table>
                <thead>
                    <tr>
                        <th>Column</th>
                        <th>Mean</th>
                        <th>Median</th>
                        <th>Std Dev</th>
                        <th>Min</th>
                        <th>Q25</th>
                        <th>Q75</th>
                        <th>Max</th>
                        <th>Skewness</th>
                    </tr>
                </thead>
                <tbody>
                    {% for name, s in numerical_stats.items() %}
                    <tr>
                        <td><strong>{{ name }}</strong></td>
                        <td>{{ s.mean }}</td>
                        <td>{{ s.median }}</td>
                        <td>{{ s.std }}</td>
                        <td>{{ s.min }}</td>
                        <td>{{ s.q25 }}</td>
                        <td>{{ s.q75 }}</td>
                        <td>{{ s.max }}</td>
                        <td>{{ s.skewness }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        {% endif %}

        <div class="footer">
            <p>DataLens AI Platform - Automated Analytics Engine. Powered by Python, Pandas & Scikit-Learn.</p>
        </div>
    </div>
</body>
</html>
"""

def generate_html_report(file_path: Path, filename: str) -> str:
    analysis = analyze_dataset(file_path)
    quality = calculate_data_quality(file_path)
    
    template = Template(HTML_REPORT_TEMPLATE)
    rendered = template.render(
        filename=filename,
        generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        summary=analysis["summary"],
        columns=analysis["columns"],
        numerical_stats=analysis["numerical_stats"],
        categorical_stats=analysis["categorical_stats"],
        insights=analysis["insights"],
        quality=quality
    )
    return rendered
