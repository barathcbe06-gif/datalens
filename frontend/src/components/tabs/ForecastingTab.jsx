import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import StatCard from '../ui/StatCard';

const ForecastingTab = ({ forecastingData, onRunForecast, loadSample }) => {
  const [horizon, setHorizon] = useState(14);

  if (!forecastingData?.is_suitable) {
    return (
      <div className="p-6 sm:p-10 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 font-mono shadow-xl backdrop-blur-md w-full">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 text-cyan-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-white">Time-Series Forecasting Not Applicable</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto font-sans leading-relaxed">
          {forecastingData?.reason || 'The uploaded dataset does not contain a sequential chronological datetime attribute and continuous numerical feature.'}
        </p>
        <div className="pt-2">
          <button
            onClick={() => loadSample('retail_sales_timeseries')}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white rounded-xl text-xs font-mono font-semibold shadow-md cursor-pointer transition-all min-h-[44px] flex items-center justify-center mx-auto"
          >
            Load Omnichannel Retail Time-Series Benchmark
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-mono w-full min-w-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard title="Trend Direction" value={forecastingData.trend_summary.direction} subtitle={`${forecastingData.trend_summary.change_pct}% overall change`} color="cyan" />
        <StatCard title="Historical MAE" value={forecastingData.model_performance.mae} subtitle="Mean Absolute Error" color="indigo" />
        <StatCard title="Historical RMSE" value={forecastingData.model_performance.rmse} subtitle="Root Mean Squared Error" color="violet" />
        <StatCard title="Historical MAPE" value={`${forecastingData.model_performance.mape}%`} subtitle="Percentage Error" color="emerald" />
      </div>

      {/* Time Series Chart */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md shadow-lg space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Historical Chronological Series & Extrapolated Forecast</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              Target: <strong>{forecastingData.target_column}</strong> | Date Index: <strong>{forecastingData.date_column}</strong> ({forecastingData.total_observations} steps)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Horizon:</span>
            {[7, 14, 30].map((h) => (
              <button
                key={h}
                onClick={() => {
                  setHorizon(h);
                  onRunForecast(forecastingData.date_column, forecastingData.target_column, h);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all min-h-[32px] ${
                  horizon === h
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {h}d
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full pt-2 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                ...(forecastingData.historical_data || forecastingData.historical_points || []).map((d) => ({ date: d.date, actual: d.actual ?? d.value, moving_average: d.moving_average ?? d.value })),
                ...(forecastingData.forecast_data || forecastingData.forecast_points || []).map((d) => ({ date: d.date, forecast: d.forecast, lower_bound: d.lower_bound, upper_bound: d.upper_bound }))
              ]}
              margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={false} name="Actual Historical" />
              <Line type="monotone" dataKey="moving_average" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="7-Day Moving Avg" />
              <Line type="monotone" dataKey="forecast" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} name="Projected Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ForecastingTab;
