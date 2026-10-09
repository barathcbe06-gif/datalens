import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sliders, CheckCircle2 } from 'lucide-react';
import { predictWhatIf } from '../../services/api';

const AutoMlTab = ({ mlEligibility, automlResult, onRunAutoML, loading }) => {
  const [selectedTarget, setSelectedTarget] = useState('');
  const [simulatorInputs, setSimulatorInputs] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (mlEligibility?.targets?.length > 0 && !selectedTarget) {
      setSelectedTarget(mlEligibility.targets[0].column);
    }
  }, [mlEligibility]);

  useEffect(() => {
    if (automlResult?.simulator_features) {
      const defaults = {};
      automlResult.simulator_features.forEach((f) => {
        defaults[f.name] = f.default;
      });
      setSimulatorInputs(defaults);
      setPredictionResult(null);
    }
  }, [automlResult?.model_id]);

  const handleSimulatePredict = async () => {
    if (!automlResult?.model_id) return;
    setPredicting(true);
    try {
      const res = await predictWhatIf(automlResult.model_id, simulatorInputs);
      setPredictionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Target Selector & Run Trigger */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-semibold">Select Target Column:</label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer font-mono"
          >
            {mlEligibility?.targets?.map((t) => (
              <option key={t.column} value={t.column}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onRunAutoML(selectedTarget)}
          disabled={loading || !selectedTarget}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Train & Compare Models</span>
        </button>
      </div>

      {automlResult && (
        <div className="space-y-6">
          {/* Champion Showcase Card */}
          <div className="bg-gradient-to-r from-slate-900/80 via-indigo-950/40 to-slate-900/80 rounded-2xl border border-indigo-500/40 p-6 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  ?? WINNING CHAMPION
                </span>
                <span className="text-xs text-slate-400">Problem Type: <strong>{automlResult.problem_type.toUpperCase()}</strong></span>
              </div>
              <h3 className="text-2xl font-black text-white font-sans tracking-tight">
                {automlResult.champion_model.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono max-w-xl pt-1">
                {automlResult.champion_model.rationale}
              </p>
            </div>

            <div className="text-right bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">{automlResult.champion_model.metric_used}</span>
              <span className="text-3xl font-black text-cyan-400">
                {typeof automlResult.champion_model.metric_value === 'number'
                  ? automlResult.champion_model.metric_value.toLocaleString()
                  : automlResult.champion_model.metric_value}
                {automlResult.problem_type === 'classification' ? '%' : ''}
              </span>
            </div>
          </div>

          {/* Preprocessing Preview Audit */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Data Preprocessing & Transformation Audit</span>
              <span className="text-cyan-400 text-[11px] font-normal">Transparent Pipeline Steps</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Train Samples (80%)</span>
                <span className="font-bold text-white">{automlResult.champion_model.metrics.train_samples} rows</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Test Samples (20%)</span>
                <span className="font-bold text-white">{automlResult.champion_model.metrics.test_samples} rows</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Imputation</span>
                <span className="font-bold text-white">Median & Mode</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Feature Scaling</span>
                <span className="font-bold text-white">StandardScaler</span>
              </div>
            </div>
          </div>

          {/* Competitive Model Leaderboard Table */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-lg backdrop-blur-md space-y-3">
            <h4 className="text-xs font-bold text-white">Model Experiment Benchmark Leaderboard</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-2.5">Model Candidate</th>
                    <th className="p-2.5">Primary Metric</th>
                    <th className="p-2.5">Detailed Performance Breakdown</th>
                    <th className="p-2.5">Training Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {automlResult.leaderboard.map((m) => {
                    const isChamp = m.model_name === automlResult.champion_model.name;
                    return (
                      <tr key={m.model_name} className={isChamp ? 'bg-indigo-950/20' : 'hover:bg-slate-800/30'}>
                        <td className="p-2.5 font-bold text-white flex items-center gap-2">
                          <span>{m.model_name}</span>
                          {isChamp && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-bold">BEST</span>}
                        </td>
                        <td className="p-2.5 text-cyan-300 font-bold">
                          {automlResult.problem_type === 'classification'
                            ? `F1: ${m.metrics.f1_score}%`
                            : `R?: ${m.metrics.r2_score}`}
                        </td>
                        <td className="p-2.5 text-slate-300 text-[11px]">
                          {automlResult.problem_type === 'classification'
                            ? `Acc: ${m.metrics.accuracy}% | Prec: ${m.metrics.precision}% | Rec: ${m.metrics.recall}%`
                            : `MAE: ${m.metrics.mae} | RMSE: ${m.metrics.rmse}`}
                        </td>
                        <td className="p-2.5 text-slate-400">{m.metrics.training_time_ms} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive What-If Scenario Simulator */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 backdrop-blur-md shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Live What-If Prediction Simulator
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Adjust feature inputs below to simulate real-time model inference from the champion estimator.
                </p>
              </div>
              <button
                onClick={handleSimulatePredict}
                disabled={predicting}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {predicting ? 'Predicting...' : 'Simulate Prediction'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {automlResult.simulator_features.map((feat) => (
                <div key={feat.name} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-bold truncate max-w-[130px]">{feat.name}</span>
                    <span className="text-cyan-400 font-mono">{simulatorInputs[feat.name]}</span>
                  </div>
                  {feat.type === 'numerical' ? (
                    <input
                      type="range"
                      min={feat.min}
                      max={feat.max}
                      step={feat.step}
                      value={simulatorInputs[feat.name] ?? feat.default}
                      onChange={(e) => setSimulatorInputs({ ...simulatorInputs, [feat.name]: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  ) : (
                    <select
                      value={simulatorInputs[feat.name] ?? feat.default}
                      onChange={(e) => setSimulatorInputs({ ...simulatorInputs, [feat.name]: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded p-1"
                    >
                      {feat.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>

            {predictionResult && (
              <div className="p-4 bg-indigo-950/30 rounded-xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
                <div>
                  <span className="text-xs text-slate-400 block">Predicted Outcome:</span>
                  <span className="text-2xl font-black text-cyan-300 font-sans">{predictionResult.prediction}</span>
                </div>

                {predictionResult.confidence && (
                  <div>
                    <span className="text-xs text-slate-400 block">Model Confidence:</span>
                    <span className="text-xl font-bold text-emerald-400">{predictionResult.confidence}%</span>
                  </div>
                )}

                {predictionResult.class_probabilities?.length > 0 && (
                  <div className="flex gap-2">
                    {predictionResult.class_probabilities.map((cp) => (
                      <div key={cp.class} className="bg-slate-900 px-3 py-1 rounded border border-slate-700 text-xs">
                        <span className="text-slate-400">{cp.class}: </span>
                        <span className="font-bold text-white">{cp.probability_pct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoMlTab;
