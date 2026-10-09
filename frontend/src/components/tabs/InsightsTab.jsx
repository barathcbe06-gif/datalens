import React from 'react';
import { Lightbulb } from 'lucide-react';

const InsightsTab = ({ insightsData }) => {
  if (!insightsData || insightsData.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 font-mono">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          Statistically-Validated Data Insights ({insightsData.length})
        </h3>
        <span className="text-xs text-slate-400">100% Derived From Actual Data</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insightsData.map((ins, i) => (
          <div key={i} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md space-y-2 font-mono flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs">{ins.title}</span>
                <span className="text-[10px] bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {ins.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                {ins.text}
              </p>
            </div>
            {ins.evidence && (
              <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex flex-wrap gap-2">
                {Object.entries(ins.evidence).map(([k, v]) => (
                  <span key={k} className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {k}: <strong className="text-cyan-400">{String(v)}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsTab;
