import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = (status || 'UNKNOWN').toUpperCase();

  let dotColor = 'bg-slate-400';
  let bgColor = 'bg-slate-800/60 text-slate-300 border-slate-700';

  if (['HEALTHY', 'COMPLETED', 'PAID', 'SUCCESS', 'ACTIVE', 'RESOLVED', 'VERIFIED'].includes(norm)) {
    dotColor = 'bg-emerald-400';
    bgColor = 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60';
  } else if (['RUNNING', 'ANALYZING', 'QUALITY_CHECK', 'PROCESSING'].includes(norm)) {
    dotColor = 'bg-blue-400 animate-pulse';
    bgColor = 'bg-blue-950/50 text-blue-300 border-blue-800/60';
  } else if (['QUEUED', 'DEGRADED', 'TRIGGERED', 'PENDING', 'WARNING'].includes(norm)) {
    dotColor = 'bg-amber-400';
    bgColor = 'bg-amber-950/50 text-amber-300 border-amber-800/60';
  } else if (['DOWN', 'FAILED', 'CRITICAL', 'UNVERIFIED', 'ERROR'].includes(norm)) {
    dotColor = 'bg-rose-400';
    bgColor = 'bg-rose-950/50 text-rose-300 border-rose-800/60';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium font-mono uppercase tracking-wider border ${bgColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {norm}
    </span>
  );
};
