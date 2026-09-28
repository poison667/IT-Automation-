import React, { useState } from 'react';
import { Play, Clock, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const AutomationBuilderView: React.FC = () => {
  const [workflows] = useState([
    {
      id: "wf_weekly_audit",
      name: "Weekly Enterprise Site Quality & Performance Pipeline",
      trigger: "Cron: Every Monday at 08:00 UTC",
      steps: [
        { name: "Execute WEB-01 Complete Audit", service: "srv_web_audit_complete" },
        { name: "Profile Core Web Vitals & Waterfall", service: "srv_perf_core_web_vitals" },
        { name: "Audit SSL/TLS Cipher Suites", service: "srv_sec_tls_certificate" }
      ],
      last_run: "2026-09-28 08:00:00"
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const handleExecute = async (wfId: string) => {
    setIsRunning(true);
    try {
      const res = await api.executeWorkflow(wfId);
      setExecutionResult(res);
    } catch (e: any) {
      alert("Workflow execution failed: " + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Automation Engine & Visual DAG Pipelines
          </h2>
          <p className="text-xs text-slate-400">Construct event-driven and scheduled multi-step IT service execution workflows</p>
        </div>
      </div>

      {/* Visual Workflow DAG Cards */}
      <div className="space-y-4">
        {workflows.map(wf => (
          <div key={wf.id} className="bg-panel border border-border-subtle rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{wf.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>{wf.trigger}</span>
                </div>
              </div>

              <button
                onClick={() => handleExecute(wf.id)}
                disabled={isRunning}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                {isRunning ? 'Executing Steps...' : 'Run Pipeline Now'}
              </button>
            </div>

            {/* Visual DAG Nodes */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-canvas border border-border-subtle rounded text-xs font-mono">
              <div className="px-3 py-1.5 rounded bg-surface border border-border-strong text-slate-200">
                <span className="text-blue-400 font-semibold">[TRIGGER]</span> Cron 08:00
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              {wf.steps.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="px-3 py-1.5 rounded bg-surface border border-border-strong text-slate-200">
                    <span className="text-amber-400 font-semibold">[STEP {i + 1}]</span> {s.name}
                  </div>
                  {i < wf.steps.length - 1 && <ArrowRight className="w-4 h-4 text-slate-400" />}
                </React.Fragment>
              ))}
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold">
                [OUTPUT] Signed PDF & Alert
              </div>
            </div>

            {/* Execution Result Log */}
            {executionResult && (
              <div className="p-3 bg-surface border border-border-subtle rounded space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Pipeline Execution Completed
                  </span>
                  <span className="text-slate-400">Duration: {executionResult.duration_seconds}s</span>
                </div>

                <div className="divide-y divide-border-subtle">
                  {executionResult.execution_log.map((log: any, idx: number) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-200">Step {log.step_index}: {log.name}</span>
                      <span className="text-emerald-400 font-semibold">{log.status} ({log.duration_seconds}s)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
