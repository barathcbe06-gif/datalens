import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', badge }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-5 backdrop-blur-md transition-all flex flex-col justify-between group shadow-sm hover:shadow-indigo-500/5 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 truncate">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5 sm:mt-1 tracking-tight font-sans truncate">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2 sm:p-2.5 rounded-xl ${scheme.bg} ${scheme.text} ${scheme.border} border group-hover:scale-105 transition-transform shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
      
      {(subtitle || badge) && (
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400">
          <span className="truncate max-w-[170px]">{subtitle}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
