import React from 'react';

const EdaTab = ({ edaData }) => {
  if (!edaData) return null;

  return (
    <div className="space-y-6">
      {/* Numerical Parametric & Non-Parametric Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md">
        <h3 className="text-sm font-bold text-white font-mono mb-4 flex items-center justify-between">
          <span>Parametric & Non-Parametric Continuous Statistics</span>
          <span className="text-xs text-slate-400 font-normal font-mono">Quartiles, Dispersion & Shape Coefficients</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 border-b border-slate-800 font-mono text-slate-400">
              <tr>
                <th className="p-2.5">Feature</th>
                <th className="p-2.5">Mean</th>
                <th className="p-2.5">Median</th>
                <th className="p-2.5">Std Dev</th>
                <th className="p-2.5">Min</th>
                <th className="p-2.5">Q25</th>
                <th className="p-2.5">Q75</th>
                <th className="p-2.5">Max</th>
                <th className="p-2.5">IQR</th>
                <th className="p-2.5">Skewness</th>
                <th className="p-2.5">Kurtosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {Object.entries(edaData.numerical_stats).map(([col, s]) => (
                <tr key={col} className="hover:bg-slate-800/30">
                  <td className="p-2.5 font-bold text-white">{col}</td>
                  <td className="p-2.5 text-cyan-300 font-semibold">{s.mean}</td>
                  <td className="p-2.5 text-slate-300">{s.median}</td>
                  <td className="p-2.5 text-slate-400">{s.std}</td>
                  <td className="p-2.5 text-slate-400">{s.min}</td>
                  <td className="p-2.5 text-slate-300">{s.q25}</td>
                  <td className="p-2.5 text-slate-300">{s.q75}</td>
                  <td className="p-2.5 text-slate-400">{s.max}</td>
                  <td className="p-2.5 text-indigo-300 font-bold">{s.iqr}</td>
                  <td className="p-2.5 text-slate-300">{s.skewness}</td>
                  <td className="p-2.5 text-slate-300">{s.kurtosis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categorical Breakdown Cards */}
      {Object.keys(edaData.categorical_stats).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white font-mono">
            Categorical Feature Distributions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(edaData.categorical_stats).map(([col, c]) => (
              <div key={col} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 font-mono shadow-md backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-white text-xs">{col}</h4>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                    {c.unique_count} Unique
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Dominant: <strong className="text-slate-200">{c.top_category}</strong> ({c.top_pct}%)
                </p>
                <div className="space-y-1.5">
                  {c.distribution.slice(0, 4).map((d) => (
                    <div key={d.category} className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between text-slate-300">
                        <span className="truncate max-w-[140px]">{d.category}</span>
                        <span>{d.count} ({d.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${d.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Matrix Table */}
      {edaData.correlations.length > 0 && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md">
          <h3 className="text-sm font-bold text-white font-mono mb-3">
            Top Pairwise Pearson Linear Correlations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {edaData.correlations.slice(0, 9).map((corr, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">{corr.feature_1} ? {corr.feature_2}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    corr.correlation > 0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    r = {corr.correlation}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{corr.relationship}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EdaTab;
