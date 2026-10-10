import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  X,
  ArrowRight,
  Database,
  Sparkles,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

const UploadPage = () => {
  const navigate = useNavigate();
  const { uploadFile, loadSample, samplesList } = useDataset();

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB

  const handleFileSelection = (file) => {
    setValidationError('');
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setValidationError(`Invalid format "${ext}". Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.`);
      return;
    }

    if (file.size > maxSizeBytes) {
      setValidationError(`File size exceeds limit (${(file.size / (1024 * 1024)).toFixed(1)} MB > 50 MB).`);
      return;
    }

    if (file.size === 0) {
      setValidationError('Uploaded file is empty (0 bytes).');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setUploadProgress(20);
    try {
      await uploadFile(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      setUploadProgress(100);
      setTimeout(() => {
        navigate('/dashboard');
      }, 400);
    } catch (err) {
      setValidationError(err.message || 'Analysis failed.');
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleSampleClick = async (sampleId) => {
    setIsProcessing(true);
    try {
      await loadSample(sampleId);
      navigate('/dashboard');
    } catch (err) {
      setValidationError(err.message || 'Failed to load sample dataset.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12 sm:pb-16 w-full">
      {/* Header */}
      <div className="text-center space-y-2 px-1 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Upload Your Dataset</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-mono leading-relaxed">
          Upload any CSV or Excel file. Our Python analytics engine will automatically profile features, audit quality, conduct EDA, and train candidate ML models.
        </p>
      </div>

      {/* Error Alert */}
      {validationError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 sm:p-4 rounded-xl flex items-start gap-2.5 sm:gap-3 text-xs leading-relaxed animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <strong className="font-semibold block mb-0.5 font-mono">Upload Error</strong>
            <span className="break-words">{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError('')}
            className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-500/20 cursor-pointer shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dropzone Card */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 sm:p-8 md:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
            dragOver
              ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99]'
              : 'border-slate-700/80 hover:border-indigo-400 hover:bg-slate-800/40 active:bg-slate-800/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-cyan-400 flex items-center justify-center mb-3 sm:mb-4 border border-indigo-500/20 shadow-inner">
            <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white mb-1">
            <span className="hidden sm:inline">Drag & drop your dataset here or </span>
            <span className="sm:hidden">Tap to choose your dataset</span>
          </h3>
          <p className="text-xs text-slate-400 mb-3 sm:mb-4 font-mono">
            <span className="hidden sm:inline">or <span className="text-cyan-400 font-semibold underline underline-offset-2">browse files</span> from your local machine</span>
            <span className="sm:hidden">Select CSV or Excel files from your phone or device</span>
          </p>

          {/* Dedicated Tap-Friendly Browse Button for Mobile */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="sm:hidden inline-flex items-center justify-center gap-2 px-5 py-2.5 mb-3.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 active:from-indigo-600/50 text-cyan-300 border border-indigo-500/40 font-mono text-xs font-semibold cursor-pointer min-h-[44px] shadow-sm active:scale-95 transition-transform"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Browse Files</span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-mono">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">CSV</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">XLSX</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">XLS</span>
            <span className="text-slate-500 sm:text-slate-400">• Max 50 MB</span>
          </div>
        </div>

        {/* Selected File Card */}
        {selectedFile && (
          <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-700/80 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-500/10 text-cyan-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-white truncate font-mono">{selectedFile.name}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                  {formatSize(selectedFile.size)} • Ready for automated data intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="text-slate-400 hover:text-white p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-800 cursor-pointer shrink-0 transition-colors"
              title="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-4 sm:mt-6 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-2 text-cyan-400 font-semibold truncate">
                <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Parsing Dataset, Computing Quality & Training Models...</span>
              </span>
              <span className="shrink-0">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button: Full-width on mobile, auto on desktop */}
        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isProcessing}
            className="w-full sm:w-auto min-h-[46px] sm:min-h-[auto] justify-center flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{isProcessing ? 'Analyzing Dataset...' : 'Execute Data Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Dataset Cards */}
      <div className="pt-2 sm:pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 sm:mb-4 px-1 sm:px-0">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Or Test With Ready-Made Sample Data</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Zero file upload required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {samplesList.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample.id)}
              disabled={isProcessing}
              className="text-left bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {sample.type.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20 truncate max-w-[120px]">
                    {sample.category.split('/')[0].trim()}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono font-semibold text-cyan-400 min-h-[30px]">
                <span>Load Sample</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
