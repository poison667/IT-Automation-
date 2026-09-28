import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { MetricCard } from '../components/MetricCard';

export const AnalyticsView: React.FC = () => {
  const [days, setDays] = useState(30);
  const [telemetry, setTelemetry] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getTelemetry(days);
        setTelemetry(res);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [days]);

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header & Time Horizon Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Grounded Business Telemetry & Analytical Insights
          </h2>
          <p className="text-xs text-slate-400">Deterministic metrics mathematically segregated from analytical inferences and recommendations</p>
        </div>

        <div className="flex items-center bg-panel border border-border-subtle rounded p-0.5 text-xs">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                days === d ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Facts: Deterministic Measurements */}
      {telemetry && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {telemetry.facts.map((f: any, idx: number) => (
              <MetricCard
                key={idx}
                title={f.metric}
                value={f.value}
                source={f.source}
                icon={BarChart3}
              />
            ))}
          </div>

          {/* Core Segregation Grid: Inferences vs Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Analytical Inferences */}
            <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                  Analytical Inferences (Correlation Matrix)
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                {telemetry.inferences.map((inf: any, idx: number) => (
                  <div key={idx} className="p-3 bg-canvas border border-border-subtle rounded space-y-1">
                    <div className="font-semibold text-slate-200">{inf.observation}</div>
                    <div className="text-slate-400 leading-relaxed text-[11px]">{inf.correlation}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioritized Recommendations */}
            <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                  Actionable Engineering Priorities
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                {telemetry.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="p-3 bg-canvas border border-border-subtle rounded flex items-start gap-3">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px] font-bold">
                      {rec.priority}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-mono text-[10px] uppercase text-blue-400">{rec.area}</div>
                      <div className="text-slate-300 text-[11.5px] leading-relaxed">{rec.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
