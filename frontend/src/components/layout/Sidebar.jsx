import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Cpu
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const Sidebar = () => {
  const { currentDataset } = useDataset();

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

  return (
    <aside className="w-64 bg-[#090d16]/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)] no-print">
      <div className="p-4 space-y-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
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
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 cursor-not-allowed opacity-50"
                    title="Upload or load a dataset first"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
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
  );
};

export default Sidebar;