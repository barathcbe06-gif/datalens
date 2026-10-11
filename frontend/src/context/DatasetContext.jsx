import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_DATASETS_META } from '../services/dataEngine';
import {
  getDatasetProfile,
  getDatasetQuality,
  getDatasetEda,
  getDatasetVisualizations,
  getDatasetInsights,
  getDatasetOutliers,
  checkMLSuitability,
  runAutoML,
  runForecasting,
  loadSampleDataset,
  uploadDatasetFile,
  getSampleDatasets
} from '../services/api';

const DatasetContext = createContext();

export const DatasetProvider = ({ children }) => {
  const [currentDataset, setCurrentDataset] = useState(() => {
    try {
      const saved = localStorage.getItem('datalens_current_dataset');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profileData, setProfileData] = useState(null);
  const [qualityData, setQualityData] = useState(null);
  const [edaData, setEdaData] = useState(null);
  const [vizData, setVizData] = useState(null);
  const [insightsData, setInsightsData] = useState([]);
  const [outliersData, setOutliersData] = useState(null);
  const [mlEligibility, setMlEligibility] = useState(null);
  const [automlResult, setAutomlResult] = useState(null);
  const [forecastingData, setForecastingData] = useState(null);

  const [samplesList, setSamplesList] = useState(SAMPLE_DATASETS_META);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    getSampleDatasets()
      .then((data) => { if (Array.isArray(data) && data.length > 0) setSamplesList(data); })
      .catch((err) => console.error('Could not load samples list:', err));
  }, []);

  const resetAllData = () => {
    setProfileData(null);
    setQualityData(null);
    setEdaData(null);
    setVizData(null);
    setInsightsData([]);
    setOutliersData(null);
    setMlEligibility(null);
    setAutomlResult(null);
    setForecastingData(null);
  };

  const fetchAllAnalytics = async (datasetId) => {
    setLoading(true);
    setLoadingMessage('Executing automated profiling, quality intelligence, EDA, and insight discovery...');
    setError(null);
    try {
      const [prof, qual, eda, viz, ins, out, mlCheck, fc] = await Promise.all([
        getDatasetProfile(datasetId).catch((e) => { console.error('Profile err', e); return null; }),
        getDatasetQuality(datasetId).catch((e) => { console.error('Quality err', e); return null; }),
        getDatasetEda(datasetId).catch((e) => { console.error('EDA err', e); return null; }),
        getDatasetVisualizations(datasetId).catch((e) => { console.error('Viz err', e); return null; }),
        getDatasetInsights(datasetId).catch((e) => { console.error('Insights err', e); return []; }),
        getDatasetOutliers(datasetId).catch((e) => { console.error('Outliers err', e); return null; }),
        checkMLSuitability(datasetId).catch((e) => { console.error('ML check err', e); return null; }),
        runForecasting(datasetId).catch((e) => { console.error('Forecast err', e); return null; }),
      ]);

      setProfileData(prof);
      setQualityData(qual);
      setEdaData(eda);
      setVizData(viz);
      setInsightsData(ins || []);
      setOutliersData(out);
      setMlEligibility(mlCheck);
      setForecastingData(fc);

      // Auto-train default ML target if eligible and none trained yet
      if (mlCheck?.is_suitable && mlCheck?.targets?.length > 0 && !automlResult) {
        const defaultTarget = mlCheck.targets[0].column;
        runAutoML(datasetId, defaultTarget)
          .then((res) => setAutomlResult(res))
          .catch((err) => console.log('Auto-train default target skipped:', err));
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to analyze dataset.';
      setError(msg);
      console.error('Analysis fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  useEffect(() => {
    if (currentDataset?.dataset_id) {
      localStorage.setItem('datalens_current_dataset', JSON.stringify(currentDataset));
      fetchAllAnalytics(currentDataset.dataset_id);
    } else {
      localStorage.removeItem('datalens_current_dataset');
      resetAllData();
    }
  }, [currentDataset?.dataset_id]);

  const uploadFile = async (file, onProgress) => {
    setLoading(true);
    setLoadingMessage('Uploading & validating dataset payload...');
    setError(null);
    try {
      const res = await uploadDatasetFile(file, onProgress);
      setCurrentDataset(res);
      return res;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Upload failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const loadSample = async (sampleId) => {
    setLoading(true);
    setLoadingMessage('Provisioning verified sample dataset...');
    setError(null);
    try {
      const res = await loadSampleDataset(sampleId);
      setCurrentDataset(res);
      return res;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load sample dataset.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const executeAutoML = async (targetColumn, problemType = 'auto') => {
    if (!currentDataset?.dataset_id) return;
    setLoading(true);
    setLoadingMessage(`Training competitive candidate models for target '${targetColumn}'...`);
    setError(null);
    try {
      const res = await runAutoML(currentDataset.dataset_id, targetColumn, problemType);
      setAutomlResult(res);
      return res;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'AutoML training failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const executeForecast = async (dateCol = null, targetCol = null, horizon = 14) => {
    if (!currentDataset?.dataset_id) return;
    setLoading(true);
    setLoadingMessage('Computing time-series moving averages and autoregressive forecast...');
    try {
      const res = await runForecasting(currentDataset.dataset_id, dateCol, targetCol, horizon);
      setForecastingData(res);
      return res;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Forecasting failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const clearDataset = () => {
    setCurrentDataset(null);
    resetAllData();
    setError(null);
  };

  return (
    <DatasetContext.Provider
      value={{
        currentDataset,
        profileData,
        qualityData,
        edaData,
        vizData,
        insightsData,
        outliersData,
        mlEligibility,
        automlResult,
        setAutomlResult,
        forecastingData,
        samplesList,
        loading,
        loadingMessage,
        error,
        setError,
        uploadFile,
        loadSample,
        clearDataset,
        executeAutoML,
        executeForecast,
        refreshData: () => currentDataset?.dataset_id && fetchAllAnalytics(currentDataset.dataset_id),
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => useContext(DatasetContext);
