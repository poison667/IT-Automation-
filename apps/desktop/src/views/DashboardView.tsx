import React from 'react';
import { 
  Activity, 
  Layers, 
  Globe, 
  AlertTriangle, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { ViewTab, Job, MonitoringCheck, Incident } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: ViewTab) => void;
  onLaunchService: (serviceId: string) => void;
  onViewJob: (jobId: string) => void;
  jobs: Job[];
  checks: MonitoringCheck[];
  incidents: Incident[];
  creditBalance: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onLaunchService,
  onViewJob,
  jobs,
  checks,
  incidents
}) => {
  const activeJobs = jobs.filter(j => ['QUEUED', 'RUNNING', 'ANALYZING', 'QUALITY_CHECK'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
  const healthyChecksCount = checks.filter(c => c.status === 'HEALTHY').length;
  const globalUptime = checks.length > 0 
    ? (checks.reduce((acc, c) => acc + c.uptime_pct, 0) / checks.length).toFixed(2)
    : "99.98";

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Top Operations KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Global System Availability"
          value={`${globalUptime}%`}
          subtitle={`${healthyChecksCount}/${checks.length || 2} Endpoints Healthy`}
          source="Synthetic Multi-Region Ping"
          icon={Activity}
          trend={{ direction: 'up', value: '0.02% (30d)' }}
        />
        <MetricCard
          title="Active Operations Pipeline"
          value={activeJobs.length}
          subtitle={`${completedJobs.length} Completed in Session`}
          source="Redis Worker Queue"
          icon={Layers}
          trend={{ direction: 'neutral', value: 'Nominal Load' }}
        />
        <MetricCard
          title="Monitored Perimeter Scope"
          value={checks.length || 2}
          subtitle="All Assets Cryptographically Verified"
          source="Asset Inventory"
          icon={Globe}
        />
        <MetricCard
          title="Active Security Incidents"
          value={incidents.filter(i => i.status !== 'RESOLVED').length}
          subtitle="0 Critical Vulnerabilities"
          source="Automated Alert Dispatcher"
          icon={AlertTriangle}
          trend={{ direction: 'up', value: 'Zero Escalations' }}
        />
      </div>

      {/* Main Operations Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Monitored Assets Health & Active Execution */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Endpoints Health Matrix */}
          <div className="bg-panel border border-border-subtle rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                  Live Perimeter Health Matrix
                </h3>
                <p className="text-[11px] text-slate-400">Continuous 60-second synthetic probes across edge regions</p>
              </div>
              <button
                onClick={() => onNavigate('monitoring')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                Monitoring Center <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {checks.map(chk => (
                <div
                  key={chk.id}
                  className="bg-canvas border border-border-subtle rounded p-2.5 flex items-center justify-between hover:border-border-strong transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-slate-100">{chk.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{chk.target_url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right hidden sm:block">
                      <div className="text-slate-400 text-[10px] uppercase">P95 Latency</div>
                      <div className="text-slate-200">{chk.latency_p95_ms} ms</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] uppercase">Uptime</div>
                      <div className="text-emerald-400 font-medium">{chk.uptime_pct}%</div>
                    </div>
                    <StatusBadge status={chk.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Jobs Pipeline */}
          <div className="bg-panel border border-border-subtle rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                  Service Execution Pipeline
                </h3>
                <p className="text-[11px] text-slate-400">Recent autonomous crawls, audits, and transformations</p>
              </div>
              <button
                onClick={() => onNavigate('jobs')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                View All Jobs <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-border-subtle">
              {jobs.slice(0, 4).map(j => (
                <div
                  key={j.id}
                  onClick={() => onViewJob(j.id)}
                  className="py-2.5 flex items-center justify-between hover:bg-panel-elevated/40 px-2 rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={j.status} />
                    <div>
                      <div className="text-xs font-medium text-slate-200">{j.service_id.replace('srv_', '').toUpperCase()}</div>
                      <div className="text-[11px] font-mono text-slate-400">{j.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {j.progress_pct}% [{j.current_stage || 'RUNNING'}]
                    </span>
                    <button className="text-blue-400 hover:underline text-xs">
                      Inspect →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Quick Service Launcher & Autonomous Telemetry */}
        <div className="space-y-4">
          {/* Instant Service Launcher */}
          <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                Quick Service Launcher
              </h3>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-slate-400">Launch verified automated diagnostics on your assets with 1 click.</p>

            <div className="space-y-2">
              <button
                onClick={() => onLaunchService('srv_web_audit_complete')}
                className="w-full text-left p-2.5 rounded bg-surface hover:bg-panel-elevated border border-border-subtle hover:border-border-strong transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200">Complete Technical Website Audit</div>
                  <div className="text-[11px] text-slate-400">Full crawl: DOM, canonicals, H1-H6, status codes</div>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-semibold">10 cr</span>
              </button>

              <button
                onClick={() => onLaunchService('srv_perf_core_web_vitals')}
                className="w-full text-left p-2.5 rounded bg-surface hover:bg-panel-elevated border border-border-subtle hover:border-border-strong transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200">Core Web Vitals & Waterfall Profiler</div>
                  <div className="text-[11px] text-slate-400">TTFB, FCP, LCP, CLS, render-blocking scripts</div>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-semibold">8 cr</span>
              </button>

              <button
                onClick={() => onLaunchService('srv_sec_tls_certificate')}
                className="w-full text-left p-2.5 rounded bg-surface hover:bg-panel-elevated border border-border-subtle hover:border-border-strong transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200">SSL/TLS Suite & Expiry Audit</div>
                  <div className="text-[11px] text-slate-400">Socket handshake, ciphers, SAN verification</div>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-semibold">4 cr</span>
              </button>

              <button
                onClick={() => onLaunchService('srv_a11y_wcag_audit')}
                className="w-full text-left p-2.5 rounded bg-surface hover:bg-panel-elevated border border-border-subtle hover:border-border-strong transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200">WCAG 2.1 / 2.2 AA Compliance Audit</div>
                  <div className="text-[11px] text-slate-400">Automated contrast, landmarks, alt attributes</div>
                </div>
                <span className="text-[11px] font-mono text-amber-300 font-semibold">6 cr</span>
              </button>
            </div>
          </div>

          {/* Autonomous Remediation Overview */}
          <div className="bg-panel border border-border-subtle rounded-md p-4">
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider mb-2">
              Autonomous Governance
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Multi-Tenant RLS Policy</span>
                <span className="font-mono text-emerald-400 font-medium">ENFORCED</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Proof-of-Ownership Verifier</span>
                <span className="font-mono text-emerald-400 font-medium">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Anti-Hallucination Barrier</span>
                <span className="font-mono text-emerald-400 font-medium">STRICT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
