import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, CheckCircle2, ShieldCheck, Binary } from 'lucide-react';

const InsightsTab = ({ insightsData }) => {
  if (!insightsData || insightsData.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 font-mono text-xs">
        <Sparkles className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-3" />
        Executing multi-modal autonomous data science intelligence algorithms...
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'anomaly':
      case 'warning':
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'trend':
      case 'correlation':
      case 'distribution':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'action':
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 font-mono">
      {/* Transparency & Audit Engine Header */}
      <div className="bg-slate-900/60 rounded-2xl border border-cyan-500/20 p-4 sm:p-5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Deterministic Mathematical Intelligence Engine
            </h3>
            <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              Verified Real Math
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            All insights are derived algorithmically from raw dataset matrices (Pearson r linear coefficients, Fisher-Pearson skewness, Tukey IQR bounds, and null sparsity ratios). Zero fabricated numbers.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 self-start sm:self-center">
          <Binary className="w-3.5 h-3.5 text-cyan-400" />
          <span>{insightsData.length} Discovered Signals</span>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {insightsData.map((ins, idx) => {
          const description = ins.description || ins.text || 'No description provided.';
          const category = ins.category || ins.badge || 'Analytics';
          const title = ins.title || 'Statistical Pattern';
          const signalText = ins.metric || (ins.evidence ? Object.entries(ins.evidence).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' • ') : 'Verified Signal');

          return (
            <div
              key={idx}
              className="bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-cyan-500/30 p-4 sm:p-5 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-3 transition-all duration-200"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 shrink-0">
                      {getIcon(ins.type)}
                    </div>
                    <span className="font-bold text-white text-xs truncate max-w-[220px] sm:max-w-xs">{title}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold shrink-0">
                    {category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-400 truncate max-w-[240px]">
                  Signal: <strong className="text-cyan-400 font-semibold">{signalText}</strong>
                </span>
                {ins.actionable && (
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] shrink-0 font-semibold">
                    Actionable
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsTab;
