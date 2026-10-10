import React from 'react';
import { Database, FileText, Layers, Hash, CheckCircle2 } from 'lucide-react';
import StatCard from '../ui/StatCard';
import DataTable from '../ui/DataTable';

const OverviewTab = ({ profileData }) => {
  if (!profileData) return null;

  const summary = profileData.summary || {};
  const duplicateCount = summary.duplicate_count ?? summary.duplicate_rows ?? 0;
  const duplicatePct = summary.duplicate_pct ?? 0;
  const totalMissing = summary.total_missing ?? summary.total_missing_cells ?? 0;
  const missingPct = summary.missing_pct ?? summary.missing_cells_pct ?? 0;
  const numericCount = summary.numerical_cols_count ?? summary.numeric_cols_count ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* 6 High-Fidelity Executive Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <StatCard title="Total Rows" value={summary.row_count?.toLocaleString()} subtitle="Observations" color="cyan" />
        <StatCard title="Total Features" value={summary.col_count} subtitle="Attributes" color="indigo" />
        <StatCard title="Memory Footprint" value={summary.memory_usage_str} subtitle="RAM Allocation" color="violet" />
        <StatCard title="Duplicate Rows" value={duplicateCount} subtitle={`${duplicatePct}% duplicate`} color={duplicateCount > 0 ? "rose" : "emerald"} />
        <StatCard title="Missing Cells" value={totalMissing} subtitle={`${missingPct}% missing`} color={totalMissing > 0 ? "amber" : "emerald"} />
        <StatCard title="Numeric Features" value={numericCount} subtitle="Continuous math" color="emerald" />
      </div>

      {/* Dataset Schema & Data Types Breakdown */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Feature Types & Statistical Properties Catalog</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {profileData.columns.length} columns inspected
          </span>
        </div>

        {/* Scrollable Columns Table with touch-scroll */}
        <div className="overflow-x-auto touch-scroll max-h-[380px] rounded-xl border border-slate-800/80">
          <table className="w-full min-w-[640px] text-left text-xs border-collapse">
            <thead className="bg-slate-950/90 sticky top-0 border-b border-slate-800 font-mono text-slate-400 backdrop-blur-md">
              <tr>
                <th className="p-2.5 sm:p-3">Feature</th>
                <th className="p-2.5 sm:p-3">Detected Type</th>
                <th className="p-2.5 sm:p-3">Missing Count (%)</th>
                <th className="p-2.5 sm:p-3">Unique Count (%)</th>
                <th className="p-2.5 sm:p-3">Role / Property</th>
                <th className="p-2.5 sm:p-3">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {profileData.columns.map((c) => (
                <tr key={c.name} className="hover:bg-slate-800/30">
                  <td className="p-2.5 sm:p-3 font-bold text-white whitespace-nowrap">{c.name}</td>
                  <td className="p-2.5 sm:p-3 whitespace-nowrap">
                    <span className="bg-slate-800 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded text-[10px]">
                      {c.type}
                    </span>
                  </td>
                  <td className="p-2.5 sm:p-3 text-slate-300 whitespace-nowrap">
                    {c.missing_count} ({c.missing_pct}%)
                  </td>
                  <td className="p-2.5 sm:p-3 text-slate-300 whitespace-nowrap">
                    {c.unique_count} ({c.unique_pct}%)
                  </td>
                  <td className="p-2.5 sm:p-3 whitespace-nowrap">
                    {c.is_id && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] mr-1">ID Column</span>}
                    {c.is_constant && <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[9px] mr-1">Constant</span>}
                    {!c.is_id && !c.is_constant && <span className="text-slate-400 text-[10px]">Predictive Feature</span>}
                  </td>
                  <td className="p-2.5 sm:p-3 text-slate-400 text-[11px] truncate max-w-[220px]">
                    {c.sample_values?.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Interactive Preview Table */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Sanitized Dataset Records Preview (First 100 Rows)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real In-Memory Table</span>
        </div>
        <DataTable columns={profileData.columns} data={profileData.preview_data} />
      </div>
    </div>
  );
};

export default OverviewTab;
