import React from 'react';
import QualityGauge from '../ui/QualityGauge';

const QualityTab = ({ qualityData }) => {
  if (!qualityData) return null;
  const issues = qualityData.issues || [];
  const recommendations = qualityData.recommendations || [];
  const breakdown = qualityData.breakdown || {};

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Radial Score Gauge Card */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-lg">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Overall Quality Score</h3>
          <div className="my-1">
            <QualityGauge score={qualityData.overall_score} grade={qualityData.grade} size={170} />
          </div>
          <p className="text-xs text-slate-400 mt-3 sm:mt-4 leading-relaxed max-w-xs font-mono">
            {qualityData.summary_text}
          </p>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="md:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md space-y-3 sm:space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
            <span>Four Pillars of Data Fidelity</span>
            <span className="text-[11px] font-normal text-slate-400">Total: 100 Points</span>
          </h3>

          <div className="space-y-3 sm:space-y-4 pt-1">
            {Object.entries(breakdown).map(([key, item]) => (
              <div key={key} className="space-y-1 sm:space-y-1.5 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-slate-300 font-semibold">{key}</span>
                  <span className="text-cyan-400 font-bold">{item.score} / {item.max} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Identified Issues */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md space-y-3 sm:space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
            <span>Detected Data Hygiene Anomalies ({issues.length})</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Audit Log</span>
          </h3>

          {issues.length === 0 ? (
            <div className="p-6 text-center text-emerald-400 font-mono text-xs">
              Zero data hygiene anomalies identified. Flawless data fidelity!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 touch-scroll">
              {issues.map((iss, i) => (
                <div key={i} className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white truncate">{iss.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                      iss.severity === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      iss.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {iss.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{iss.impact}</p>
                  <div className="text-[10px] text-cyan-400 pt-0.5 break-words">
                    <strong>Action:</strong> {iss.action}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md space-y-3 sm:space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white font-mono">
            Systematic Cleaning & Preprocessing Guidance
          </h3>
          <div className="space-y-2.5 font-mono">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-3 sm:p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-start gap-2.5">
                <span className="text-cyan-400 font-bold shrink-0 mt-0.5">#{i + 1}</span>
                <span className="text-slate-300 leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityTab;
