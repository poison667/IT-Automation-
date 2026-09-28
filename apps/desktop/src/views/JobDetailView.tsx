import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { TerminalStream, LogMessage } from '../components/TerminalStream';
import { Job } from '../types';
import { api } from '../lib/api';

interface JobDetailViewProps {
  jobId: string;
  onBack: () => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ jobId, onBack }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'FINDINGS' | 'RAW_OUTPUT' | 'INPUTS'>('FINDINGS');
  const [isLoading, setIsLoading] = useState(true);

  // Poll / fetch job status
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const j = await api.getJob(jobId);
        if (isMounted) setJob(j);
      } catch (e) {
        console.error("Failed to load job:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [jobId]);

  // Connect to SSE stream
  useEffect(() => {
    const eventSource = new EventSource(`/api/v1/jobs/${jobId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          setLogs(prev => [...prev, {
            timestamp: data.timestamp || new Date().toISOString(),
            level: data.level || 'INFO',
            message: data.message,
            stage: data.stage,
            progress_pct: data.progress_pct
          }]);
        }
      } catch {
        // Heartbeat or ping
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  if (isLoading && !job) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading job execution telemetry...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-xs text-rose-400">Job #{jobId} could not be located in worker ledger.</p>
        <button onClick={onBack} className="px-3 py-1 bg-panel border rounded text-xs text-slate-200">
          Return to Queue
        </button>
      </div>
    );
  }

  const stages = ['VALIDATING', 'QUEUED', 'RUNNING', 'ANALYZING', 'QUALITY_CHECK', 'COMPLETED'];
  const currentStageIndex = stages.indexOf(job.status === 'COMPLETED' ? 'COMPLETED' : job.current_stage || 'RUNNING');

  const output = job.output_data || {};
  const score = output.health_score || output.seo_score || output.performance_score || output.accessibility_score || output.security_score;

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded bg-panel hover:bg-panel-elevated border border-border-subtle text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100 font-mono">Job #{job.id}</h2>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Service: <span className="font-semibold text-slate-300">{job.service_id.replace('srv_', '').toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'COMPLETED' && (
            <a
              href={`/api/v1/reports/rep_${job.id}/download`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF Report
            </a>
          )}
        </div>
      </div>

      {/* 5-Stage Visual Execution Pipeline */}
      <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>PIPELINE STAGES</span>
          <span>{job.progress_pct}% COMPLETED</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {stages.map((stage, idx) => {
            const isPassed = job.status === 'COMPLETED' || idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex && job.status !== 'COMPLETED';
            return (
              <div
                key={stage}
                className={`p-2 rounded border text-center font-mono text-[11px] uppercase transition-colors ${
                  isPassed
                    ? 'bg-blue-950/40 border-blue-800 text-blue-300 font-semibold'
                    : isCurrent
                    ? 'bg-amber-950/40 border-amber-800 text-amber-300 animate-pulse'
                    : 'bg-canvas border-border-subtle text-slate-400'
                }`}
              >
                <div className="text-[9px] text-slate-400 mb-0.5">STEP {idx + 1}</div>
                {stage.replace('_', ' ')}
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Streaming Terminal Console */}
      <TerminalStream
        logs={logs}
        title={`Live Worker Telemetry Console [Job #${job.id}]`}
        isStreaming={job.status !== 'COMPLETED' && job.status !== 'FAILED'}
      />

      {/* Findings & Output Analytics */}
      {job.status === 'COMPLETED' && (
        <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2 text-xs">
              {['FINDINGS', 'RAW_OUTPUT', 'INPUTS'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeTab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>

            {score !== undefined && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 uppercase font-mono">Computed Health Grade</span>
                <ScoreGauge score={score} size="sm" />
              </div>
            )}
          </div>

          {activeTab === 'FINDINGS' && (
            <div className="space-y-3 text-xs">
              {/* Evidence & Findings Table */}
              {output.issues || output.violations ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Detected Observations & Anomalies ({(output.issues || output.violations).length})
                  </h4>
                  <div className="divide-y divide-border-subtle border border-border-subtle rounded bg-canvas overflow-hidden">
                    {(output.issues || output.violations).map((iss: any, i: number) => (
                      <div key={i} className="p-3 hover:bg-panel/40 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-semibold ${
                              iss.severity === 'CRITICAL' || iss.impact === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {iss.severity || iss.impact || 'OBSERVATION'}
                            </span>
                            <span className="font-semibold text-slate-200">{iss.title || iss.wcag_criterion}</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed">{iss.description || iss.fix}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center bg-canvas rounded border border-border-subtle text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-200">Zero Critical Anomalies Detected</p>
                  <p className="text-[11px] text-slate-400 mt-1">All evaluated assertions passed automated quality control verification.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'RAW_OUTPUT' && (
            <pre className="p-3 bg-canvas border border-border-subtle rounded font-mono text-[11px] text-slate-300 overflow-x-auto max-h-96">
              {JSON.stringify(job.output_data, null, 2)}
            </pre>
          )}

          {activeTab === 'INPUTS' && (
            <pre className="p-3 bg-canvas border border-border-subtle rounded font-mono text-[11px] text-slate-300 overflow-x-auto">
              {JSON.stringify(job.input_params, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
