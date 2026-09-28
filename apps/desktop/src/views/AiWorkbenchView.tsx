import React, { useState } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export const AiWorkbenchView: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [query, setQuery] = useState('Investigate why page loading latency spiked and verify SSL/TLS security posture.');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleRunInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl || !query) return;
    setIsInvestigating(true);
    try {
      const res = await api.queryAI(targetUrl, query);
      setResult(res);
    } catch (e: any) {
      alert("Investigation failed: " + e.message);
    } finally {
      setIsInvestigating(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
          Grounded AI Autonomous Investigator
        </h2>
        <p className="text-xs text-slate-400">ReAct Tool Execution: Dispatches real diagnostic engines and cites verified evidence chains</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Investigation Prompt Config */}
        <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Diagnostic Query & Scope
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-surface px-2 py-0.5 rounded border border-border-subtle flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Grounded ReAct
            </span>
          </div>

          <form onSubmit={handleRunInvestigation} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Asset URL</label>
              <input
                type="text"
                required
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Investigation Query Prompt</label>
              <textarea
                rows={5}
                required
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-canvas border border-border-subtle rounded p-2.5 text-slate-200 focus:outline-none focus:border-border-focus resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isInvestigating}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {isInvestigating ? 'Executing Tool Plan...' : 'Dispatch Autonomous Investigation'}
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Evidence Provenance & Synthesis */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <div className="space-y-4 text-xs">
              {/* Evidence Provenance Cards */}
              <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Verified Evidence Chain ({result.evidence_chain.length} Facts Collected)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {result.evidence_chain.map((ev: any) => (
                    <div key={ev.evidence_id} className="p-2.5 bg-canvas border border-border-subtle rounded space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-400 text-[10px]">{ev.evidence_id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ev.tool}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">{ev.fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grounded Synthesis */}
              <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Fact-Grounded Analysis
                </h3>
                <p className="text-slate-200 leading-relaxed bg-canvas p-3 rounded border border-border-subtle">
                  {result.grounded_synthesis}
                </p>

                <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider pt-2">
                  Actionable Remediation Directives
                </h4>
                <div className="space-y-1.5">
                  {result.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-canvas border border-border-subtle rounded text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-panel border border-border-subtle rounded-md p-12 text-center text-xs text-slate-400">
              Submit an investigation prompt on the left to dispatch autonomous diagnostic tools and generate evidence-backed conclusions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
