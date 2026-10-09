import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const uploadDatasetFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return res.data;
};

export const getSampleDatasets = async () => {
  const res = await api.get('/sample-datasets');
  return res.data;
};

export const loadSampleDataset = async (sampleId) => {
  const res = await api.post(`/load-sample/${sampleId}`);
  return res.data;
};

// Auto Data Profiling
export const getDatasetProfile = async (datasetId) => {
  const res = await api.get(`/profile/${datasetId}`);
  return res.data;
};

// Data Quality Intelligence
export const getDatasetQuality = async (datasetId) => {
  const res = await api.get(`/quality/${datasetId}`);
  return res.data;
};

// Automated EDA
export const getDatasetEda = async (datasetId) => {
  const res = await api.get(`/eda/${datasetId}`);
  return res.data;
};

// Smart Visualizations
export const getDatasetVisualizations = async (datasetId) => {
  const res = await api.get(`/visualize/${datasetId}`);
  return res.data;
};

export const getCustomChart = async (params) => {
  const res = await api.post('/visualize/custom', params);
  return res.data;
};

// AI Insights
export const getDatasetInsights = async (datasetId) => {
  const res = await api.get(`/insights/${datasetId}`);
  return res.data;
};

// Ask Your Data
export const askDataQuery = async (datasetId, query) => {
  const res = await api.post('/ask', { dataset_id: datasetId, query });
  return res.data;
};

// Outlier Diagnostics
export const getDatasetOutliers = async (datasetId, contamination = 0.05) => {
  const res = await api.get(`/outliers/${datasetId}?contamination=${contamination}`);
  return res.data;
};

// AutoML
export const checkMLSuitability = async (datasetId) => {
  const res = await api.get(`/ml/check/${datasetId}`);
  return res.data;
};

export const runAutoML = async (datasetId, targetColumn, problemType = 'auto') => {
  const res = await api.post('/automl', {
    dataset_id: datasetId,
    target_column: targetColumn,
    problem_type: problemType,
  });
  return res.data;
};

export const predictWhatIf = async (modelId, features) => {
  const res = await api.post('/ml/predict', {
    model_id: modelId,
    features,
  });
  return res.data;
};

export const getExplainability = async (datasetId, targetColumn = null) => {
  const res = await api.post('/explain', {
    dataset_id: datasetId,
    target_column: targetColumn,
  });
  return res.data;
};

// Time-Series Forecasting
export const runForecasting = async (datasetId, dateCol = null, targetCol = null, horizon = 14) => {
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
  const res = await api.post('/report', {
    dataset_id: datasetId,
    target_column: targetColumn,
  });
  return res.data;
};

export const getReportDownloadUrl = (datasetId, targetColumn = null) => {
  let url = `/api/report/${datasetId}/download`;
  if (targetColumn) url += `?target_column=${encodeURIComponent(targetColumn)}`;
  return url;
};

export default api;