import React from 'react';
import { Cpu } from 'lucide-react';

const ExplainableTab = ({ explainability }) => {
  if (!explainability) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 font-mono text-xs text-slate-400">
        Please train an AutoML model in the 'AutoML & Models' tab to generate feature importance attributions.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-lg space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Feature Attribution & Decision Decomposition
          </h3>
          <span className="text-xs text-slate-400">{explainability.method}</span>
        </div>
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
          ?? {explainability.explanation}
        </div>
      </div>

      {/* Feature Importance Horizontal Bars */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-white">Relative Feature Decision Weights (%)</h4>
          <span className="text-[10px] text-slate-400 font-normal">{explainability.validation_method}</span>
        </div>
        <div className="space-y-3">
          {explainability.feature_importances.map((f) => (
            <div key={f.feature} className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-200 font-bold">{f.feature}</span>
                <span className="text-cyan-400 font-bold">{f.relative_contribution_pct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${f.relative_contribution_pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md">
        <h4 className="text-xs font-bold text-white mb-3">Model Attribution Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-2.5">Feature</th>
                <th className="p-2.5">Relative Decision Impact (%)</th>
                <th className="p-2.5">Raw Attribution Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {explainability.feature_importances.map((f) => (
                <tr key={f.feature} className="hover:bg-slate-800/30">
                  <td className="p-2.5 font-bold text-white">{f.feature}</td>
                  <td className="p-2.5 text-cyan-300 font-bold">{f.relative_contribution_pct}%</td>
                  <td className="p-2.5 text-slate-400">{f.importance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExplainableTab;
