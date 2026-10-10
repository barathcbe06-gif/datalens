import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, PlusCircle, Sparkles, Menu, X } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const Navbar = () => {
  const { currentDataset, clearDataset, isMobileMenuOpen, toggleMobileMenu } = useDataset();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/80 px-2.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between no-print w-full">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle Button (lg:hidden) */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-cyan-400" />
          ) : (
            <Menu className="w-5 h-5 text-slate-300" />
          )}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 text-white font-bold tracking-tight hover:opacity-90 group min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 leading-tight">
              <span className="font-extrabold text-white text-xs sm:text-base">DataLens</span>
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent font-black text-xs sm:text-base">AI</span>
              <span className="hidden sm:inline text-[9px] sm:text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-mono">v2.0</span>
            </div>
            <span className="hidden sm:inline text-[10px] text-slate-400 font-mono tracking-wider uppercase truncate">Dataset Intelligence</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {currentDataset ? (
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Desktop Dataset Stats Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-300 shadow-inner">
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold text-white truncate max-w-[140px] lg:max-w-[190px]">
                {currentDataset.filename}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{currentDataset.row_count?.toLocaleString()} rows</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{currentDataset.col_count} cols</span>
            </div>

            {/* Switch Dataset Button */}
            <button
              onClick={() => {
                clearDataset();
                navigate('/upload');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 text-[11px] sm:text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all border border-slate-700 cursor-pointer min-h-[34px]"
              title="Switch or upload another dataset"
            >
              <PlusCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Switch</span>
              <span className="hidden md:inline">Dataset</span>
            </button>
          </div>
        ) : (
          <Link
            to="/upload"
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer min-h-[34px]"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Upload</span>
            <span className="hidden sm:inline">Dataset</span>
          </Link>
        )}

        <div className="hidden xs:block h-3.5 w-[1px] bg-slate-800" />

        {/* Engine Status Badge: Compact dot on mobile */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-emerald-400 font-mono bg-emerald-950/40 px-2 sm:px-3 py-1 rounded-full border border-emerald-500/30 shrink-0">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400 shrink-0" />
          <span className="hidden sm:inline font-semibold">Engine Active</span>
          <span className="sm:hidden font-semibold text-[9px]">Live</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
