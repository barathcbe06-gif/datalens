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
  CheckCircle2
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
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Your Dataset</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-mono">
          Upload any CSV or Excel file. Our Python analytics engine will automatically profile features, audit quality, conduct EDA, and train candidate ML models.
        </p>
      </div>

      {/* Error Alert */}
      {validationError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block mb-0.5 font-mono">Upload Error</strong>
            {validationError}
          </div>
          <button onClick={() => setValidationError('')} className="text-rose-400 hover:text-rose-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dropzone Card */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 shadow-xl backdrop-blur-md">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
            dragOver
              ? 'border-cyan-400 bg-cyan-500/10 scale-[0.99]'
              : 'border-slate-700/80 hover:border-indigo-400 hover:bg-slate-800/40'
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

          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-inner">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            Drag & drop your dataset here
          </h3>
          <p className="text-xs text-slate-400 mb-4 font-mono">
            or <span className="text-cyan-400 font-semibold underline underline-offset-2">browse files</span> from your local machine
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">CSV</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">XLSX</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">XLS</span>
            <span>• Max 50 MB</span>
          </div>
        </div>

        {/* Selected File Card */}
        {selectedFile && (
          <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-700/80 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-cyan-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate font-mono">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {formatSize(selectedFile.size)} • Ready for automated data intelligence
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Parsing Dataset, Computing Quality & Training Models...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Analyzing Dataset...' : 'Execute Data Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Quick Sample Dataset Cards */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Or Test With Ready-Made Sample Data
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Zero file upload required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samplesList.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample.id)}
              disabled={isProcessing}
              className="text-left bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer disabled:opacity-50"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {sample.type.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {sample.category.split('/')[0].trim()}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono font-semibold text-cyan-400">
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