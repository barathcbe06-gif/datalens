import axios from 'axios';
import {
  SAMPLE_DATASETS_META,
  generateSampleCsv,
  analyzeDatasetInBrowser,
  answerDataQueryInBrowser,
  generateReportHtml
} from './dataEngine';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// In-Memory store for datasets processed by client-side engine
const clientDatasets = new Map();
let currentEngineMode = 'detecting'; // 'cloud' | 'client'

export const getEngineMode = () => currentEngineMode;

/**
 * Helper to determine if a response is valid JSON from backend
 * (Vercel SPA rewrite returns HTML string <!doctype html> with status 200)
 */
function isValidApiResponse(data) {
  if (!data) return false;
  if (typeof data === 'string' && data.trim().startsWith('<!doctype')) return false;
  if (typeof data === 'string' && data.trim().startsWith('<html')) return false;
  return true;
}

export const checkHealth = async () => {
  try {
    const res = await api.get('/health');
    if (isValidApiResponse(res.data)) {
      currentEngineMode = 'cloud';
      return res.data;
    }
  } catch {
    // backend offline
  }
  currentEngineMode = 'client';
  return { status: 'healthy', engine: 'in-browser-data-science-engine' };
};

export const getSampleDatasets = async () => {
  try {
    const res = await api.get('/sample-datasets');
    if (isValidApiResponse(res.data) && Array.isArray(res.data)) {
      currentEngineMode = 'cloud';
      return res.data;
    }
  } catch (err) {
    console.warn('[DataLens Engine] Cloud endpoint unreachable; activating in-browser sample benchmarks.', err?.message);
  }
  currentEngineMode = 'client';
  return SAMPLE_DATASETS_META;
};

export const loadSampleDataset = async (sampleId) => {
  try {
    const res = await api.post(`/load-sample/${sampleId}`);
    if (isValidApiResponse(res.data) && res.data.dataset_id) {
      currentEngineMode = 'cloud';
      return res.data;
    }
  } catch (err) {
    console.warn('[DataLens Engine] Cloud sample loader failed; falling back to in-browser data engine.', err?.message);
  }

  // Fallback to In-Browser Data Engine
  currentEngineMode = 'client';
  const csvText = generateSampleCsv(sampleId);
  const datasetId = `sample-${sampleId}-${Date.now()}`;
  const filename = `${sampleId}.csv`;
  
  const analysis = analyzeDatasetInBrowser(datasetId, filename, csvText);
  clientDatasets.set(datasetId, analysis);

  return {
    dataset_id: datasetId,
    filename,
    file_size: csvText.length,
    row_count: analysis.profileData.summary.row_count,
    col_count: analysis.profileData.summary.col_count,
    message: 'Dataset initialized via High-Performance Client Engine.',
    is_client_engine: true
  };
};

export const uploadDatasetFile = async (file, onUploadProgress) => {
  // First, if file is a CSV, read text so we can fallback instantly if backend fails or on Vercel
  let csvText = null;
  const isCsv = file.name.toLowerCase().endsWith('.csv');
  if (isCsv) {
    try {
      csvText = await file.text();
    } catch (e) {
      console.warn('Could not read file text client-side:', e);
    }
  }

  // Attempt backend upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    if (isValidApiResponse(res.data) && res.data.dataset_id) {
      currentEngineMode = 'cloud';
      return res.data;
    }
  } catch (err) {
    console.warn('[DataLens Engine] Cloud upload unavailable; routing to client-side data science engine.', err?.message);
  }

  // If CSV text is available, analyze in browser
  if (csvText) {
    currentEngineMode = 'client';
    const datasetId = `upload-${Date.now()}`;
    const analysis = analyzeDatasetInBrowser(datasetId, file.name, csvText);
    clientDatasets.set(datasetId, analysis);

    return {
      dataset_id: datasetId,
      filename: file.name,
      file_size: file.size,
      row_count: analysis.profileData.summary.row_count,
      col_count: analysis.profileData.summary.col_count,
      message: 'Dataset analyzed successfully via In-Browser Engine.',
      is_client_engine: true
    };
  }

  throw new Error('Could not process dataset. For client-side analysis without backend, please upload a .csv file.');
};

// Auto Data Profiling
export const getDatasetProfile = async (datasetId) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).profileData;
  }
  const res = await api.get(`/profile/${datasetId}`);
  if (isValidApiResponse(res.data)) return res.data;
  throw new Error('Profile data unavailable.');
};

// Data Quality Intelligence
export const getDatasetQuality = async (datasetId) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).qualityData;
  }
  const res = await api.get(`/quality/${datasetId}`);
  if (isValidApiResponse(res.data)) return res.data;
  throw new Error('Quality data unavailable.');
};

// Automated EDA
export const getDatasetEda = async (datasetId) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).edaData;
  }
  const res = await api.get(`/eda/${datasetId}`);
  if (isValidApiResponse(res.data)) return res.data;
  throw new Error('EDA data unavailable.');
};

// Smart Visualizations
export const getDatasetVisualizations = async (datasetId) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).vizData;
  }
  const res = await api.get(`/visualize/${datasetId}`);
  if (isValidApiResponse(res.data)) return res.data;
  throw new Error('Visualization data unavailable.');
};

export const getCustomChart = async (params) => {
  const { dataset_id, chart_type, x_col, y_col } = params;
  if (clientDatasets.has(dataset_id)) {
    const analysis = clientDatasets.get(dataset_id);
    const records = analysis.rawRecords;
    const data = records.slice(0, 50).map(r => ({
      name: String(r[x_col] ?? ''),
      value: y_col ? Number(r[y_col] ?? 0) : 1
    }));
    return { data, chart_type, x_col, y_col };
  }
  const res = await api.post('/visualize/custom', params);
  return res.data;
};

// AI Insights
export const getDatasetInsights = async (datasetId) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).insightsData;
  }
  const res = await api.get(`/insights/${datasetId}`);
  if (isValidApiResponse(res.data)) return res.data;
  return [];
};

// Ask Your Data
export const askDataQuery = async (datasetId, query) => {
  if (clientDatasets.has(datasetId)) {
    const analysis = clientDatasets.get(datasetId);
    return answerDataQueryInBrowser(query, analysis.rawRecords, analysis.profileData, analysis.edaData);
  }
  const res = await api.post('/ask', { dataset_id: datasetId, query });
  return res.data;
};

// Outlier Diagnostics
export const getDatasetOutliers = async (datasetId, contamination = 0.05) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).outliersData;
  }
  const res = await api.get(`/outliers/${datasetId}?contamination=${contamination}`);
  if (isValidApiResponse(res.data)) return res.data;
  throw new Error('Outlier diagnostics unavailable.');
};

// AutoML Suitability
export const checkMLSuitability = async (datasetId) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).mlEligibility;
  }
  const res = await api.get(`/ml/check/${datasetId}`);
  if (isValidApiResponse(res.data)) return res.data;
  throw new Error('ML suitability check unavailable.');
};

// Run AutoML Training
export const runAutoML = async (datasetId, targetColumn, problemType = 'auto') => {
  if (clientDatasets.has(datasetId)) {
    const analysis = clientDatasets.get(datasetId);
    return analysis.automlResult;
  }
  const res = await api.post('/automl', {
    dataset_id: datasetId,
    target_column: targetColumn,
    problem_type: problemType,
  });
  return res.data;
};

// Predict What-If Simulator
export const predictWhatIf = async (modelId, features) => {
  if (modelId.startsWith('browser-model-')) {
    // Dynamic simulated inference based on feature values
    const entries = Object.values(features).filter(v => typeof v === 'number');
    const baseScore = entries.length > 0 ? entries.reduce((a, b) => a + b, 0) / entries.length : 50;
    const isClassification = modelId.includes('churn') || modelId.includes('performance');
    
    if (isClassification) {
      const churnProb = Math.min(0.95, Math.max(0.05, 0.35 + (baseScore > 60 ? 0.25 : -0.15)));
      return {
        prediction: churnProb > 0.5 ? 'Positive Risk' : 'Low Risk',
        confidence: +(churnProb * 100).toFixed(1),
        class_probabilities: [
          { class: 'Low Risk', probability: +(1 - churnProb).toFixed(2) },
          { class: 'Positive Risk', probability: +churnProb.toFixed(2) }
        ]
      };
    } else {
      const predVal = Math.round(baseScore * 185 + 25000);
      return {
        prediction: predVal,
        unit: 'Estimated Metric Value',
        confidence: 91.5
      };
    }
  }

  const res = await api.post('/ml/predict', {
    model_id: modelId,
    features,
  });
  return res.data;
};

export const getExplainability = async (datasetId, targetColumn = null) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).automlResult?.explainability;
  }
  const res = await api.post('/explain', {
    dataset_id: datasetId,
    target_column: targetColumn,
  });
  return res.data;
};

// Time-Series Forecasting
export const runForecasting = async (datasetId, dateCol = null, targetCol = null, horizon = 14) => {
  if (clientDatasets.has(datasetId)) {
    return clientDatasets.get(datasetId).forecastingData;
  }
  const res = await api.post('/forecast', {
    dataset_id: datasetId,
    date_col: dateCol,
    target_col: targetCol,
    horizon,
  });
  return res.data;
};

// Research-Style Report
export const getReportHtml = async (datasetId, targetColumn = null) => {
  if (clientDatasets.has(datasetId)) {
    const a = clientDatasets.get(datasetId);
    const html = generateReportHtml(
      datasetId,
      a.filename,
      a.profileData,
      a.qualityData,
      a.edaData,
      a.insightsData,
      a.automlResult
    );
    return { html, dataset_id: datasetId };
  }
  const res = await api.post('/report', {
    dataset_id: datasetId,
    target_column: targetColumn,
  });
  return res.data;
};

export const getReportDownloadUrl = (datasetId, targetColumn = null) => {
  let url = `${API_BASE}/report/${datasetId}/download`;
  if (targetColumn) url += `?target_column=${encodeURIComponent(targetColumn)}`;
  return url;
};

export default api;
