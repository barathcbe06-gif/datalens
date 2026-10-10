import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

const InsightsTab = ({ insightsData }) => {
  if (!insightsData || insightsData.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 font-mono text-xs">
        Generating multi-modal autonomous data science insights...
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'trend': return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'action': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <Lightbulb className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {insightsData.map((ins, idx) => (
          <div
            key={idx}
            className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-3 font-mono hover:border-slate-700 transition-all"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 shrink-0">
                    {getIcon(ins.type)}
                  </div>
                  <span className="font-bold text-white text-xs">{ins.title}</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold shrink-0">
                  {ins.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {ins.description}
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400 truncate max-w-[200px]">Signal: <strong className="text-cyan-400">{ins.metric}</strong></span>
              {ins.actionable && (
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] shrink-0 font-semibold">
                  Actionable Signal
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsTab;
