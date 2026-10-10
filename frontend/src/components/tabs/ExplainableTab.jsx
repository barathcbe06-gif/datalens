import React from 'react';
import { Cpu, HelpCircle, Activity } from 'lucide-react';

const ExplainableTab = ({ explainability }) => {
  if (!explainability) {
    return (
      <div className="p-8 sm:p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 font-mono shadow-xl backdrop-blur-md">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-cyan-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <Cpu className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Explainable AI Requires a Trained Model</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
          Navigate to the AutoML tab and run the model training pipeline to inspect SHAP global importances and permutation feature rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-mono w-full min-w-0">
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md shadow-lg space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Permutation & Gini Feature Importance Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Quantifies the marginal predictive contribution of each feature to the champion estimator's decisions.
          </p>
        </div>

        {/* Top Feature Importance Bars */}
        <div className="space-y-3 pt-2">
          {explainability.feature_importances.map((item) => (
            <div key={item.feature} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold truncate max-w-[140px] sm:max-w-[200px]">{item.feature}</span>
                <span className="text-cyan-400 shrink-0">{(item.importance * 100).toFixed(1)}% influence</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.importance * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Ranking Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3">
        <h4 className="text-xs font-bold text-white">Ranked Decision Sensitivity Table</h4>
        <div className="overflow-x-auto touch-scroll rounded-xl border border-slate-800/80">
          <table className="w-full min-w-[560px] text-left text-xs border-collapse font-mono">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 backdrop-blur-md">
              <tr>
                <th className="p-2.5 sm:p-3">Rank</th>
                <th className="p-2.5 sm:p-3">Feature Attribute</th>
                <th className="p-2.5 sm:p-3">Relative Importance</th>
                <th className="p-2.5 sm:p-3">Impact Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {explainability.feature_importances.map((item, idx) => (
                <tr key={item.feature} className="hover:bg-slate-800/30">
                  <td className="p-2.5 sm:p-3 text-cyan-400 font-bold">#{idx + 1}</td>
                  <td className="p-2.5 sm:p-3 text-white font-semibold whitespace-nowrap">{item.feature}</td>
                  <td className="p-2.5 sm:p-3 text-slate-300">{(item.importance * 100).toFixed(2)}%</td>
                  <td className="p-2.5 sm:p-3 text-slate-400 whitespace-nowrap">
                    {idx < 2 ? 'Strong Driver' : idx < 5 ? 'Moderate Factor' : 'Marginal Regularizer'}
                  </td>
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
