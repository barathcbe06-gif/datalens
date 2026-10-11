import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { getCustomChart } from '../../services/api';

const COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

const VizTab = ({ vizData, datasetId }) => {
  const [customChartType, setCustomChartType] = useState('bar');
  const [customX, setCustomX] = useState('');
  const [customY, setCustomY] = useState('');
  const [customAgg, setCustomAgg] = useState('avg');
  const [customChartData, setCustomChartData] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  if (!vizData) return null;

  const handleGenerateCustomChart = async () => {
    if (!customX || !datasetId) return;
    setCustomLoading(true);
    try {
      const res = await getCustomChart({
        dataset_id: datasetId,
        chart_type: customChartType,
        x_col: customX,
        y_col: customY || null,
        aggregation: customAgg
      });
      setCustomChartData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCustomLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {(vizData.distribution_charts || vizData.charts || []).map((c) => (
          <div key={c.column} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white font-mono truncate">{c.title}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{c.subtitle}</p>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700 shrink-0">
                {c.category}
              </span>
            </div>

            <div className="h-60 sm:h-64 w-full pt-2 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                {c.type === 'bar' ? (
                  <BarChart data={c.data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : c.type === 'pie' ? (
                  <PieChart>
                    <Pie data={c.data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={{ fontSize: 9, fill: '#cbd5e1' }}>
                      {c.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                  </PieChart>
                ) : (
                  <BarChart data={c.data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="bin" stroke="#64748b" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Scatter Plots */}
      {(vizData.scatter_charts || []).length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {(vizData.scatter_charts || []).map((sc) => (
            <div key={sc.id} className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white font-mono truncate">{sc.title}</h4>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5 truncate">{sc.subtitle}</p>
                </div>
              </div>
              <div className="h-60 sm:h-64 w-full pt-2 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" dataKey="x" name={sc.x_label} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name={sc.y_label} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                    <Scatter data={sc.data} fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Custom Chart Studio */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md space-y-4 shadow-lg font-mono">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Custom Analytics Chart Studio</span>
        </h3>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Chart Type</label>
            <select
              value={customChartType}
              onChange={(e) => setCustomChartType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white min-h-[38px]"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="pie">Pie Chart</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">X-Axis Column</label>
            <select
              value={customX}
              onChange={(e) => setCustomX(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white min-h-[38px]"
            >
              <option value="">Select Column</option>
              {vizData.all_columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Y-Axis Column (Optional)</label>
            <select
              value={customY}
              onChange={(e) => setCustomY(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white min-h-[38px]"
            >
              <option value="">None / Count</option>
              {vizData.numerical_columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Aggregation</label>
            <select
              value={customAgg}
              onChange={(e) => setCustomAgg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white min-h-[38px]"
            >
              <option value="none">None / Raw</option>
              <option value="avg">Average (Mean)</option>
              <option value="sum">Sum (Total)</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
              <option value="count">Count Frequency</option>
            </select>
          </div>

          <div className="flex items-end xs:col-span-2 sm:col-span-1">
            <button
              onClick={handleGenerateCustomChart}
              disabled={!customX || customLoading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md disabled:opacity-50 cursor-pointer min-h-[38px] active:scale-[0.98] transition-transform flex items-center justify-center"
            >
              {customLoading ? 'Rendering...' : 'Plot Chart'}
            </button>
          </div>
        </div>

        {customChartData && (
          <div className="h-64 sm:h-72 w-full pt-4 border-t border-slate-800 mt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {customChartType === 'line' ? (
                <LineChart data={customChartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : customChartType === 'scatter' ? (
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" dataKey="x" name={customChartData.x_label} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis type="number" dataKey="y" name={customChartData.y_label} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                  <Scatter data={customChartData.data} fill="#ec4899" />
                </ScatterChart>
              ) : (
                <BarChart data={customChartData.data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default VizTab;
