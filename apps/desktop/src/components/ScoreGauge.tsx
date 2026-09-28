import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label, size = 'md' }) => {
  const normScore = Math.min(100, Math.max(0, Math.round(score)));
  
  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
  if (normScore < 60) colorClass = 'text-rose-400 border-rose-500/30 bg-rose-950/20';
  else if (normScore < 85) colorClass = 'text-amber-400 border-amber-500/30 bg-amber-950/20';

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-xl'
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`rounded-full flex items-center justify-center font-mono font-bold border-2 ${sizeClasses[size]} ${colorClass}`}>
        {normScore}
      </div>
      {label && <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{label}</span>}
    </div>
  );
};
