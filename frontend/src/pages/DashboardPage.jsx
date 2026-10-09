import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  BarChart3,
  BrainCircuit,
  FileText,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  MessageSquareCode,
  Cpu,
  Database,
  ArrowRight
} from 'lucide-react';

import { useDataset } from '../context/DatasetContext';
import OverviewTab from '../components/tabs/OverviewTab';
import QualityTab from '../components/tabs/QualityTab';
import EdaTab from '../components/tabs/EdaTab';
import VizTab from '../components/tabs/VizTab';
import InsightsTab from '../components/tabs/InsightsTab';
import AskDataTab from '../components/tabs/AskDataTab';
import AutoMlTab from '../components/tabs/AutoMlTab';
import ExplainableTab from '../components/tabs/ExplainableTab';
import OutliersTab from '../components/tabs/OutliersTab';
import ForecastingTab from '../components/tabs/ForecastingTab';
import ReportTab from '../components/tabs/ReportTab';

const DashboardPage = ({ defaultTab = 'overview' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentDataset,
    profileData,
    qualityData,
    edaData,
    vizData,
    insightsData,
    outliersData,
    mlEligibility,
    automlResult,
    forecastingData,
    loading,
    loadingMessage,
    executeAutoML,
    executeForecast,
    loadSample
  } = useDataset();

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const path = location.pathname.replace('/', '');
    const tabMap = {
      dashboard: 'overview',
      quality: 'quality',
      eda: 'eda',
      visualizations: 'viz',
      insights: 'insights',
      ask: 'ask',
      ml: 'automl',
      explain: 'explain',
      outliers: 'outliers',
      forecasting: 'forecasting',
      report: 'report'
    };
    if (tabMap[path]) {
      setActiveTab(tabMap[path]);
    }
  }, [location.pathname]);

  if (!currentDataset) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-6 bg-slate-900/60 p-10 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-indigo-500/20">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">No Active Dataset Loaded</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto font-mono">
          Upload your data file or choose a ready-made sample dataset to initialize the Data Science Intelligence Platform.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <span>Upload Dataset Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck, badge: qualityData ? `${qualityData.overall_score}` : null },
    { id: 'eda', label: 'Automated EDA', icon: BarChart3 },
    { id: 'viz', label: 'Visualizations', icon: Sparkles },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb, badge: insightsData ? `${insightsData.length}` : null },
    { id: 'ask', label: 'Ask Your Data', icon: MessageSquareCode, badge: 'NLP' },
    { id: 'automl', label: 'AutoML & Models', icon: BrainCircuit, badge: 'ML' },
    { id: 'explain', label: 'Explainable AI', icon: Cpu },
    { id: 'outliers', label: 'Outliers', icon: AlertTriangle },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'report', label: 'Research Report', icon: FileText }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Dataset Overview Strip */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white font-mono">{currentDataset.filename}</h1>
              <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Active Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {profileData?.summary.row_count?.toLocaleString()} rows ? {profileData?.summary.col_count} columns ? {profileData?.summary.memory_usage_str} memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {qualityData && (
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-slate-400">Quality:</span>
              <span className="font-bold text-cyan-400">{qualityData.overall_score}/100</span>
              <span className="text-slate-500">({qualityData.grade})</span>
            </div>
          )}
          <button
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/25 text-cyan-300 border border-indigo-500/40 font-bold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 text-center space-y-2 backdrop-blur-md animate-pulse">
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{loadingMessage || 'Processing data science algorithms...'}</span>
          </div>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === 'overview' && <OverviewTab profileData={profileData} />}
      {activeTab === 'quality' && <QualityTab qualityData={qualityData} />}
      {activeTab === 'eda' && <EdaTab edaData={edaData} />}
      {activeTab === 'viz' && <VizTab vizData={vizData} datasetId={currentDataset.dataset_id} />}
      {activeTab === 'insights' && <InsightsTab insightsData={insightsData} />}
      {activeTab === 'ask' && <AskDataTab datasetId={currentDataset.dataset_id} profileData={profileData} />}
      {activeTab === 'automl' && (
        <AutoMlTab
          mlEligibility={mlEligibility}
          automlResult={automlResult}
          onRunAutoML={executeAutoML}
          loading={loading}
        />
      )}
      {activeTab === 'explain' && <ExplainableTab explainability={automlResult?.explainability} />}
      {activeTab === 'outliers' && <OutliersTab outliersData={outliersData} />}
      {activeTab === 'forecasting' && (
        <ForecastingTab
          forecastingData={forecastingData}
          onRunForecast={executeForecast}
          loadSample={loadSample}
        />
      )}
      {activeTab === 'report' && (
        <ReportTab
          datasetId={currentDataset.dataset_id}
          targetCol={automlResult?.target_column}
        />
      )}
    </div>
  );
};

export default DashboardPage;
