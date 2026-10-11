import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  BarChart3,
  BrainCircuit,
  FileText,
  Upload,
  Home,
  MessageSquareCode,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Cpu,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const Sidebar = () => {
  const { currentDataset, clearDataset, isMobileMenuOpen, closeMobileMenu } = useDataset();
  const navigate = useNavigate();

  const navItems = [
    {
      name: 'Overview & Profiling',
      path: '/dashboard',
      icon: LayoutDashboard,
      requiresDataset: true,
      badge: 'Core'
    },
    {
      name: 'Data Quality Health',
      path: '/quality',
      icon: ShieldCheck,
      requiresDataset: true,
      badge: null
    },
    {
      name: 'Automated EDA',
      path: '/eda',
      icon: BarChart3,
      requiresDataset: true,
      badge: null
    },
    {
      name: 'Smart Visualizations',
      path: '/visualizations',
      icon: Sparkles,
      requiresDataset: true,
      badge: null
    },
    {
      name: 'AI-Driven Insights',
      path: '/insights',
      icon: Lightbulb,
      requiresDataset: true,
      badge: null
    },
    {
      name: 'Ask Your Data',
      path: '/ask',
      icon: MessageSquareCode,
      requiresDataset: true,
      badge: 'NLP'
    },
    {
      name: 'AutoML & Leaderboard',
      path: '/ml',
      icon: BrainCircuit,
      requiresDataset: true,
      badge: 'ML'
    },
    {
      name: 'Explainable AI',
      path: '/explain',
      icon: Cpu,
      requiresDataset: true,
      badge: 'XAI'
    },
    {
      name: 'Outlier Detection',
      path: '/outliers',
      icon: AlertTriangle,
      requiresDataset: true,
      badge: null
    },
    {
      name: 'Time-Series Forecast',
      path: '/forecasting',
      icon: TrendingUp,
      requiresDataset: true,
      badge: 'TS'
    },
    {
      name: 'Research Report',
      path: '/report',
      icon: FileText,
      requiresDataset: true,
      badge: 'PDF'
    },
  ];

  const renderNavLinks = (isMobile = false) => (
    <div className="p-4 space-y-6">
      {/* Mobile-only Current Dataset Status Header */}
      {isMobile && currentDataset && (
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold truncate">
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="truncate">{currentDataset.filename}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>{currentDataset.row_count?.toLocaleString()} rows • {currentDataset.col_count} cols</span>
            <button
              onClick={() => {
                closeMobileMenu();
                clearDataset();
                navigate('/upload');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Switch
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2">
          Navigation
        </div>
        <nav className="space-y-1">
          <NavLink
            to="/"
            onClick={isMobile ? closeMobileMenu : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`
            }
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Platform Home</span>
          </NavLink>
          <NavLink
            to="/upload"
            onClick={isMobile ? closeMobileMenu : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`
            }
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Upload Dataset</span>
          </NavLink>
        </nav>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
          <span>Intelligence Modules</span>
          {currentDataset && (
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono px-1.5 py-0.5 rounded">
              DATASET LOADED
            </span>
          )}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const disabled = item.requiresDataset && !currentDataset;
            
            if (disabled) {
              return (
                <div
                  key={item.path}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed opacity-50"
                  title="Upload or load a dataset first"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={isMobile ? closeMobileMenu : undefined}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (visible on lg screens, hidden on mobile/tablet) */}
      <aside className="hidden lg:flex w-64 bg-[#090d16]/95 border-r border-slate-800/80 flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] no-print sticky top-[61px] self-start h-[calc(100vh-61px)] overflow-y-auto no-scrollbar">
        {renderNavLinks(false)}

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between font-mono font-semibold text-slate-300">
              <span>DataLens Core</span>
              <span className="text-cyan-400 text-[10px]">v2.0 PG</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              FastAPI + Scikit-Learn analytical pipeline. 100% verified mathematics.
            </p>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Navigation Drawer (lg:hidden) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            className="relative z-50 w-72 max-w-[85vw] bg-[#090d16] border-r border-slate-800/90 shadow-2xl flex flex-col justify-between h-full overflow-y-auto no-scrollbar touch-scroll animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Top Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1 leading-none">
                    <span className="font-extrabold text-white text-sm">DataLens</span>
                    <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent font-black text-sm">AI</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">Mobile Navigation</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {renderNavLinks(true)}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
              <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-mono font-semibold text-slate-300 text-[11px]">
                  <span>DataLens Core</span>
                  <span className="text-cyan-400 text-[10px]">v2.0 PG</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-tight">
                  Autonomous Data Science Intelligence Engine
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
