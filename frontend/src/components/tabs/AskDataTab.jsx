import React, { useState } from 'react';
import { MessageSquareCode, Send, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { askDataQuery } from '../../services/api';

const AskDataTab = ({ datasetId, profileData }) => {
  const [queryInput, setQueryInput] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const handleRunQuery = async (qText) => {
    const q = qText || queryInput;
    if (!q.trim() || queryLoading || !datasetId) return;
    setQueryLoading(true);
    try {
      const res = await askDataQuery(datasetId, q);
      setQueryResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Natural Language Query Box */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Ask Your Data in Plain English</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
            Enter any natural-language analytical question. The engine dynamically computes answers directly from the dataset.
          </p>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 font-mono text-[11px]">
          <span className="text-slate-400 py-1 w-full sm:w-auto">Quick Inquiries:</span>
          {[
            `What is the average of ${profileData?.numerical_cols?.[0] || 'Price'}?`,
            `Which ${profileData?.categorical_cols?.[0] || 'Department'} has the highest average ${profileData?.numerical_cols?.[0] || 'Sales'}?`,
            'Which column has the most missing values?',
            `Show top 5 records by ${profileData?.numerical_cols?.[0] || 'Value'}`,
            'Total count of records in dataset'
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setQueryInput(chip);
                handleRunQuery(chip);
              }}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700/80 transition-all cursor-pointer text-left active:scale-95 text-[10px] sm:text-[11px]"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Query Input Bar: Stacks cleanly on mobile */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
            placeholder="e.g. Which department has highest average marks? or What is average Monthly_Charges?"
            className="flex-1 bg-slate-950/90 border border-slate-700 rounded-xl px-4 py-2.5 sm:py-3 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 min-h-[42px]"
          />
          <button
            onClick={() => handleRunQuery()}
            disabled={queryLoading || !queryInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-semibold rounded-xl text-xs font-mono shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98]"
          >
            {queryLoading ? <Sparkles className="w-4 h-4 animate-spin shrink-0" /> : <Send className="w-4 h-4 shrink-0" />}
            <span>Execute Query</span>
          </button>
        </div>
      </div>

      {/* Query Answer Card */}
      {queryResult && (
        <div className="bg-slate-900/60 rounded-2xl border border-indigo-500/30 p-4 sm:p-6 backdrop-blur-md shadow-xl space-y-4 font-mono animate-in fade-in">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">Query Result:</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
              queryResult.success ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {queryResult.success ? 'Computed from Data' : 'Clarification Required'}
            </span>
          </div>

          <div className="text-sm font-sans font-medium text-white leading-relaxed bg-slate-950/60 p-3.5 sm:p-4 rounded-xl border border-slate-800 break-words">
            {queryResult.answer}
          </div>

          {/* Data Table Supporting Proof */}
          {queryResult.data_table && queryResult.data_table.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs text-slate-400 font-bold">Data Evidence Matrix:</h4>
              <div className="overflow-x-auto touch-scroll max-h-[220px] rounded-xl border border-slate-800/80">
                <table className="w-full min-w-[360px] text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-slate-400">
                    <tr>
                      {Object.keys(queryResult.data_table[0]).map((k) => (
                        <th key={k} className="p-2 whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {queryResult.data_table.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        {Object.values(row).map((v, cIdx) => (
                          <td key={cIdx} className="p-2 text-slate-300 whitespace-nowrap">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supporting Mini Chart */}
          {queryResult.chart && queryResult.chart.data && (
            <div className="h-44 sm:h-48 w-full pt-2 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queryResult.chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#f8fafc', fontSize: 12 }} />
                  <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AskDataTab;
