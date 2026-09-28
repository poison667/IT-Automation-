import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  source?: string;
  icon?: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  source,
  icon: Icon,
  trend,
  className = ''
}) => {
  return (
    <div className={`bg-panel border border-border-subtle rounded-md p-4 flex flex-col justify-between hover:border-border-strong transition-colors ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      
      <div className="my-2">
        <div className="text-2xl font-semibold text-slate-100 font-mono tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      </div>

      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border-subtle text-slate-400">
        {source && <span>Src: {source}</span>}
        {trend && (
          <span className={`font-mono font-medium ${
            trend.direction === 'up' ? 'text-emerald-400' : trend.direction === 'down' ? 'text-rose-400' : 'text-slate-400'
          }`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
