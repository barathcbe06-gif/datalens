import React from 'react';

const QualityGauge = ({ score, grade, size = 180 }) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // Emerald
  let bgBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (score < 55) {
    strokeColor = '#f43f5e'; // Rose
    bgBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (score < 75) {
    strokeColor = '#f59e0b'; // Amber
    bgBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (score < 90) {
    strokeColor = '#38bdf8'; // Sky/Cyan
    bgBadge = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-white tracking-tight font-sans">
          {score}
        </span>
        <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
          out of 100
        </span>
        {grade && (
          <span className={`mt-1.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${bgBadge}`}>
            {grade}
          </span>
        )}
      </div>
    </div>
  );
};

export default QualityGauge;