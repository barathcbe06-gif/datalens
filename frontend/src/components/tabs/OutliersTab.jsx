import React from 'react';
import { AlertTriangle } from 'lucide-react';
import StatCard from '../ui/StatCard';

const OutliersTab = ({ outliersData }) => {
  if (!outliersData) return null;

  return (
    <div className="space-y-6 font-mono">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="IQR Outlier Rows" value={outliersData.iqr_method.total_outliers_rows} subtitle={`${outliersData.iqr_method.outliers_percentage}% affected`} color="rose" />
        <StatCard title="Affected Columns" value={outliersData.iqr_method.columns_with_outliers_count} subtitle="Columns exceeding 1.5*IQR" color="amber" />
        <StatCard title="Isolation Forest" value={outliersData.isolation_forest.total_outliers_rows} subtitle="Multivariate Anomalies" color="violet" />
        <StatCard title="Contamination" value={`${outliersData.isolation_forest.outliers_percentage}%`} subtitle="Anomaly Ratio" color="cyan" />
      </div>

      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-md space-y-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            Feature-by-Feature Interquartile Range (IQR) Boundaries
          </h3>
          <span className="text-xs text-slate-400">Q1 - 1.5?IQR / Q3 + 1.5?IQR</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-2.5">Numerical Feature</th>
                <th className="p-2.5">Outlier Count (%)</th>
                <th className="p-2.5">Lower Bound</th>
                <th className="p-2.5">Upper Bound</th>
                <th className="p-2.5">Min/Max Extreme Outliers</th>
                <th className="p-2.5">Sample Outlier Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.entries(outliersData.iqr_method.column_details).map(([col, d]) => (
                <tr key={col} className="hover:bg-slate-800/30">
                  <td className="p-2.5 font-bold text-white">{col}</td>
                  <td className="p-2.5 text-rose-400 font-bold">{d.outlier_count} ({d.outlier_percentage}%)</td>
                  <td className="p-2.5 text-slate-400">{d.lower_bound}</td>
                  <td className="p-2.5 text-slate-400">{d.upper_bound}</td>
                  <td className="p-2.5 text-slate-300">[{d.min_outlier} , {d.max_outlier}]</td>
                  <td className="p-2.5 text-cyan-300 text-[11px] truncate max-w-[200px]">{d.sample_values?.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 pt-2 font-sans">
          ?? {outliersData.interpretation}
        </p>
      </div>
    </div>
  );
};

export default OutliersTab;
