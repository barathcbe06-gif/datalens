import React from 'react';
import { TableProperties, Database } from 'lucide-react';
import StatCard from '../ui/StatCard';
import DataTable from '../ui/DataTable';

const OverviewTab = ({ profileData }) => {
  if (!profileData) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Observations" value={profileData.summary.row_count?.toLocaleString()} subtitle="Total Records" color="indigo" />
        <StatCard title="Features" value={profileData.summary.col_count} subtitle={`${profileData.summary.numerical_cols_count} num, ${profileData.summary.categorical_cols_count} cat`} color="cyan" />
        <StatCard title="Missing Cells" value={`${profileData.summary.missing_pct}%`} subtitle={`${profileData.summary.total_missing?.toLocaleString()} cells`} color="rose" />
        <StatCard title="Duplicates" value={profileData.summary.duplicate_count} subtitle={`${profileData.summary.duplicate_pct}% redundant`} color="amber" />
        <StatCard title="Constant Cols" value={profileData.summary.constant_cols_count} subtitle="Zero Variance" color="emerald" />
        <StatCard title="ID Features" value={profileData.summary.id_cols_count} subtitle="High Cardinality" color="violet" />
      </div>

      {/* Schema Profiling Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-cyan-400" />
            Feature Taxonomy & Auto-Inferred Schema
          </h3>
          <span className="text-[11px] font-mono text-slate-400">{profileData.columns.length} Total Columns</span>
        </div>

        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 font-mono text-slate-400">
              <tr>
                <th className="p-2.5">Feature</th>
                <th className="p-2.5">Detected Type</th>
                <th className="p-2.5">Missing Count (%)</th>
                <th className="p-2.5">Unique Count (%)</th>
                <th className="p-2.5">Role / Property</th>
                <th className="p-2.5">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {profileData.columns.map((c) => (
                <tr key={c.name} className="hover:bg-slate-800/30">
                  <td className="p-2.5 font-bold text-white">{c.name}</td>
                  <td className="p-2.5">
                    <span className="bg-slate-800 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded text-[10px]">
                      {c.type}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-300">
                    {c.missing_count} ({c.missing_pct}%)
                  </td>
                  <td className="p-2.5 text-slate-300">
                    {c.unique_count} ({c.unique_pct}%)
                  </td>
                  <td className="p-2.5">
                    {c.is_id && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] mr-1">ID Column</span>}
                    {c.is_constant && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9px] mr-1">Constant</span>}
                    {!c.is_id && !c.is_constant && <span className="text-slate-400 text-[10px]">Predictive Feature</span>}
                  </td>
                  <td className="p-2.5 text-slate-400 text-[11px] truncate max-w-[220px]">
                    {c.sample_values?.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Interactive Preview Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Sanitized Dataset Records Preview (First 100 Rows)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real In-Memory Table</span>
        </div>
        <DataTable columns={profileData.columns} data={profileData.preview_data} />
      </div>
    </div>
  );
};

export default OverviewTab;
