import React, { useState } from 'react';
import { BrainCircuit, Trophy, Sliders, CheckCircle2, Sparkles, Cpu, Activity } from 'lucide-react';
import { predictWhatIf } from '../../services/api';

const AutoMlTab = ({ mlEligibility, automlResult, onRunAutoML, loading }) => {
  const [selectedTarget, setSelectedTarget] = useState(
    mlEligibility?.targets?.[0]?.column || ''
  );
  const [simulatorInputs, setSimulatorInputs] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  if (!mlEligibility?.is_suitable) {
    return (
      <div className="p-8 sm:p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 font-mono shadow-xl backdrop-blur-md">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Dataset Ineligible for Automated Machine Learning</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
          {mlEligibility?.reason || 'The dataset requires at least 2 features and 15 observations with sufficient variance.'}
        </p>
      </div>
    );
  }

  const handleSimulatePredict = async () => {
    if (!automlResult?.model_id) return;
    setPredicting(true);
    try {
      const res = await predictWhatIf(automlResult.model_id, simulatorInputs);
      setPredictionResult(res);
    } catch (err) {
      console.error('Simulation prediction error:', err);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-mono w-full min-w-0">
      {/* Target Column Selector Banner */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Autonomous Machine Learning Engine</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Trains Scikit-Learn estimators (Random Forest, Gradient Boosting, Ridge, Logistic/Linear Regression) with stratified cross-validation.
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none min-h-[42px]"
          >
            {mlEligibility.targets.map((t) => (
              <option key={t.column} value={t.column}>
                Target: {t.column} ({t.recommended_problem})
              </option>
            ))}
          </select>
          <button
            onClick={() => onRunAutoML(selectedTarget)}
            disabled={loading || !selectedTarget}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{loading ? 'Training Candidate Models...' : 'Run AutoML'}</span>
          </button>
        </div>
      </div>

      {automlResult && (
        <div className="space-y-4 sm:space-y-6">
          {/* Champion Model Victory Banner */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/60 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-cyan-300 rounded-xl border border-indigo-500/30 shrink-0">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold block">
                    Champion Estimator Selected
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                    {automlResult.champion_model.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target Feature:</span>
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
                  {automlResult.target_column} ({automlResult.problem_type})
                </span>
              </div>
            </div>

            {/* Performance Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
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
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3">
            <h4 className="text-xs font-bold text-white">Model Experiment Benchmark Leaderboard</h4>
            <div className="overflow-x-auto touch-scroll rounded-xl border border-slate-800/80">
              <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 backdrop-blur-md">
                  <tr>
                    <th className="p-2.5 sm:p-3">Model Candidate</th>
                    <th className="p-2.5 sm:p-3">Primary Metric</th>
                    <th className="p-2.5 sm:p-3">Detailed Performance Breakdown</th>
                    <th className="p-2.5 sm:p-3">Training Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {automlResult.leaderboard.map((m) => {
                    const isChamp = m.model_name === automlResult.champion_model.name;
                    return (
                      <tr key={m.model_name} className={isChamp ? 'bg-indigo-950/20' : 'hover:bg-slate-800/30'}>
                        <td className="p-2.5 sm:p-3 font-bold text-white flex items-center gap-2 whitespace-nowrap">
                          <span>{m.model_name}</span>
                          {isChamp && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-bold">BEST</span>}
                        </td>
                        <td className="p-2.5 sm:p-3 text-cyan-300 font-bold whitespace-nowrap">
                          {automlResult.problem_type === 'classification'
                            ? `F1: ${m.metrics.f1_score}%`
                            : `R²: ${m.metrics.r2_score}`}
                        </td>
                        <td className="p-2.5 sm:p-3 text-slate-300 text-[11px] whitespace-nowrap">
                          {automlResult.problem_type === 'classification'
                            ? `Acc: ${m.metrics.accuracy}% | Prec: ${m.metrics.precision}% | Rec: ${m.metrics.recall}%`
                            : `MAE: ${m.metrics.mae} | RMSE: ${m.metrics.rmse}`}
                        </td>
                        <td className="p-2.5 sm:p-3 text-slate-400 whitespace-nowrap">{m.metrics.training_time_ms} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive What-If Scenario Simulator */}
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-6 backdrop-blur-md shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Live What-If Prediction Simulator</span>
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
                  Adjust feature inputs below to simulate real-time model inference from the champion estimator.
                </p>
              </div>
              <button
                onClick={handleSimulatePredict}
                disabled={predicting}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50 min-h-[40px] flex items-center justify-center active:scale-[0.98]"
              >
                {predicting ? 'Predicting...' : 'Simulate Prediction'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
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
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded p-1.5 min-h-[34px]"
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
              <div className="p-4 bg-indigo-950/30 rounded-xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in">
                <div>
                  <span className="text-xs text-slate-400 block">Predicted Outcome:</span>
                  <span className="text-xl sm:text-2xl font-black text-cyan-300 font-sans">{predictionResult.prediction}</span>
                </div>

                {predictionResult.confidence && (
                  <div>
                    <span className="text-xs text-slate-400 block">Model Confidence:</span>
                    <span className="text-lg sm:text-xl font-bold text-emerald-400">{predictionResult.confidence}%</span>
                  </div>
                )}

                {predictionResult.class_probabilities?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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
