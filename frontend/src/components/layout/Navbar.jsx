import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, PlusCircle, Sparkles, Database, Terminal } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const Navbar = () => {
  const { currentDataset, clearDataset } = useDataset();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between no-print">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 text-white font-bold text-lg tracking-tight hover:opacity-90 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-extrabold text-white text-base">DataLens</span>
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent font-black text-base">AI</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-mono">PG-v2.0</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Dataset Intelligence Platform</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {currentDataset ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-300 shadow-inner">
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white truncate max-w-[190px]">
                {currentDataset.filename}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{currentDataset.row_count?.toLocaleString()} rows</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{currentDataset.col_count} cols</span>
            </div>

            <button
              onClick={() => {
                clearDataset();
                navigate('/upload');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
              Switch Dataset
            </button>
          </div>
        ) : (
          <Link
            to="/upload"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Upload Dataset
          </Link>
        )}

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <span className="hidden md:inline font-semibold">Engine Active</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;