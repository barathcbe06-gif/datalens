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
  FolderOpen,
  RefreshCw,
  FileCheck
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12 sm:pb-16 w-full">
      {/* Header Section */}
      <div className="text-center space-y-2.5 px-2 sm:px-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>DATASET INGESTION PIPELINE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Upload Your Dataset
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-mono leading-relaxed">
          Upload any CSV or Excel file. Our Python analytics engine will automatically profile features, audit quality, conduct EDA, and train candidate ML models.
        </p>
      </div>

      {/* Error Alert */}
      {validationError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed animate-in fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <strong className="font-semibold block mb-0.5 font-mono text-rose-200">Upload Error</strong>
            <span className="break-words">{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError('')}
            className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-500/20 cursor-pointer shrink-0 min-w-[32px] min-h-[32px] flex items-center justify-center transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
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

      {/* ==================================================================== */}
      {/* MAIN UPLOAD CONTAINER                                                */}
      {/* ==================================================================== */}
      {!selectedFile ? (
        /* STATE 1: DROPZONE CONTAINER */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group rounded-2xl border-2 border-dashed p-6 sm:p-10 md:p-12 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center backdrop-blur-md ${
            dragOver
              ? 'border-cyan-400 bg-cyan-950/30 shadow-2xl shadow-cyan-500/15 scale-[0.995]'
              : 'border-slate-800 hover:border-cyan-500/60 bg-slate-900/50 hover:bg-slate-900/70 shadow-xl'
          }`}
        >
          {/* Centered Glowing Icon */}
          <div
            className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 border transition-all duration-300 ${
              dragOver
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-lg shadow-cyan-500/25 scale-110'
                : 'bg-indigo-500/10 group-hover:bg-cyan-500/15 text-cyan-400 border-indigo-500/20 group-hover:border-cyan-500/40 shadow-inner group-hover:scale-105'
            }`}
          >
            <Upload className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:-translate-y-1 duration-200" />
          </div>

          {/* Heading */}
          <h2 className="text-base sm:text-xl font-bold text-white mb-1.5 sm:mb-2 tracking-tight group-hover:text-cyan-200 transition-colors">
            <span className="hidden sm:inline">Drag & drop your dataset here</span>
            <span className="sm:hidden">Tap to choose your dataset</span>
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-400 font-mono mb-5 sm:mb-6 max-w-md mx-auto leading-relaxed px-2 text-center">
            <span className="hidden sm:inline">or browse files from your computer to start automated analysis</span>
            <span className="sm:hidden">CSV & Excel files up to 50 MB</span>
          </p>

          {/* Prominent Browse Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-400/50 font-mono text-xs font-semibold shadow-md transition-all duration-150 cursor-pointer active:scale-95 mb-5 sm:mb-6"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Browse Files</span>
          </button>

          {/* Format Tags & Limits */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400 font-mono pt-4 sm:pt-5 border-t border-slate-800/80 w-full max-w-md">
            <span className="bg-slate-800/90 border border-slate-700/60 px-2.5 py-0.5 rounded text-slate-300 font-semibold">.CSV</span>
            <span className="bg-slate-800/90 border border-slate-700/60 px-2.5 py-0.5 rounded text-slate-300 font-semibold">.XLSX</span>
            <span className="bg-slate-800/90 border border-slate-700/60 px-2.5 py-0.5 rounded text-slate-300 font-semibold">.XLS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Max 50 MB</span>
          </div>
        </div>
      ) : (
        /* STATE 2: FILE SELECTED REVIEW CARD */
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/90 p-5 sm:p-7 md:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Selected Dataset</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Validated
            </span>
          </div>

          {/* File Information Row */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-cyan-500/30 shadow-lg shadow-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm sm:text-base font-bold text-white truncate font-mono">
                    {selectedFile.name}
                  </p>
                  <span className="shrink-0 bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold">
                    {selectedFile.name.split('.').pop()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>{formatSize(selectedFile.size)}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Ready for autonomous analytics</span>
                </div>
              </div>
            </div>

            {/* Change & Remove Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs cursor-pointer transition-colors disabled:opacity-50"
                title="Choose a different file"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Change File</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={isProcessing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 cursor-pointer transition-colors disabled:opacity-50"
                title="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar (during analysis) */}
          {isProcessing && (
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-slate-800 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-2 text-cyan-400 font-semibold truncate">
                  <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Parsing Dataset, Computing Quality & Training Models...</span>
                </span>
                <span className="shrink-0 font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isProcessing}
              className="w-full sm:w-auto min-h-[48px] justify-center inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{isProcessing ? 'Analyzing Dataset...' : 'Execute Data Intelligence'}</span>
              {!isProcessing && <ArrowRight className="w-4 h-4 shrink-0" />}
            </button>
          </div>
        </div>
      )}

      {/* Quick Sample Dataset Cards */}
      <div className="pt-2 sm:pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 px-1 sm:px-0">
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
              className="text-left bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-cyan-950/20 transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-1 mb-2.5">
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

              <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-semibold text-cyan-400 min-h-[30px]">
                <span>Load Sample</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
