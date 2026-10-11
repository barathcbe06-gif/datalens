import React from 'react';
import { AlertTriangle } from 'lucide-react';
import StatCard from '../ui/StatCard';

const OutliersTab = ({ outliersData }) => {
  if (!outliersData) return null;
  const colsWithOutliers = outliersData.columns_with_outliers || outliersData.column_breakdown || [];
  const totalOutliers = outliersData.total_outliers ?? outliersData.outlier_count ?? 0;
  const outlierPercentage = outliersData.outlier_percentage ?? 0;
  const cleanRecords = outliersData.clean_records ?? (outliersData.total_records ? outliersData.total_records - totalOutliers : 0);

  return (
    <div className="space-y-4 sm:space-y-6 font-mono w-full min-w-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard title="Total Outliers" value={totalOutliers} subtitle="Anomalous records" color="rose" />
        <StatCard title="Outlier Ratio" value={`${outlierPercentage}%`} subtitle="Of dataset rows" color="amber" />
        <StatCard title="Features With Outliers" value={colsWithOutliers.length} subtitle="Contaminated cols" color="violet" />
        <StatCard title="Clean Records" value={cleanRecords?.toLocaleString()} subtitle="Within normal bounds" color="emerald" />
      </div>

      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Multivariate & IQR Outlier Diagnostics</span>
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Identified using Interquartile Range (IQR = Q3 - Q1) beyond 1.5x whiskers across continuous dimensions.
        </p>

        <div className="overflow-x-auto touch-scroll rounded-xl border border-slate-800/80">
          <table className="w-full min-w-[600px] text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 backdrop-blur-md">
              <tr>
                <th className="p-2.5 sm:p-3">Feature Column</th>
                <th className="p-2.5 sm:p-3">Outlier Count</th>
                <th className="p-2.5 sm:p-3">Lower Bound</th>
                <th className="p-2.5 sm:p-3">Upper Bound</th>
                <th className="p-2.5 sm:p-3">Extreme Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {colsWithOutliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-400">
                    Zero statistical outliers detected beyond 1.5× IQR whiskers.
                  </td>
                </tr>
              ) : (
                colsWithOutliers.map((d) => (
                  <tr key={d.column} className="hover:bg-slate-800/30">
                    <td className="p-2.5 sm:p-3 font-bold text-white whitespace-nowrap">{d.column}</td>
                    <td className="p-2.5 sm:p-3 text-rose-400 font-bold whitespace-nowrap">
                      {d.outlier_count ?? d.count ?? 0} ({d.percentage ?? 0}%)
                    </td>
                    <td className="p-2.5 sm:p-3 text-slate-400 whitespace-nowrap">{d.lower_bound}</td>
                    <td className="p-2.5 sm:p-3 text-slate-400 whitespace-nowrap">{d.upper_bound}</td>
                    <td className="p-2.5 sm:p-3 text-cyan-300 text-[11px] truncate max-w-[200px]">
                      {Array.isArray(d.sample_values) ? d.sample_values.join(', ') : 'Boundary violations'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutliersTab;
