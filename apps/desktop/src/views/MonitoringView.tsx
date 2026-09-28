import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { MonitoringCheck, Incident } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DataTable, Column } from '../components/DataTable';
import { api } from '../lib/api';

interface MonitoringViewProps {
  checks: MonitoringCheck[];
  incidents: Incident[];
  onRefresh: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({ checks, incidents, onRefresh }) => {
  const [probingId, setProbingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [checkType, setCheckType] = useState<'HTTP' | 'SSL' | 'DNS'>('HTTP');

  const handleManualProbe = async (checkId: string) => {
    setProbingId(checkId);
    try {
      await api.triggerPing(checkId);
      onRefresh();
    } catch (e) {
      console.error("Probe failed:", e);
    } finally {
      setProbingId(null);
    }
  };

  const handleCreateCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetUrl) return;
    try {
      await api.createCheck(name, targetUrl, checkType);
      setName('');
      setTargetUrl('');
      setShowAddModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const checkColumns: Column<MonitoringCheck>[] = [
    {
      key: 'status',
      header: 'Health Status',
      width: '130px',
      render: (c) => <StatusBadge status={c.status} />
    },
    {
      key: 'name',
      header: 'Check Identifier & Target',
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-200">{c.name}</div>
          <div className="text-[11px] font-mono text-slate-400">{c.target_url}</div>
        </div>
      )
    },
    {
      key: 'check_type',
      header: 'Protocol',
      width: '100px',
      render: (c) => <span className="font-mono text-[11px] text-blue-400 font-medium">{c.check_type}</span>
    },
    {
      key: 'uptime_pct',
      header: '30d Uptime',
      width: '120px',
      render: (c) => <span className="font-mono font-bold text-emerald-400">{c.uptime_pct}%</span>
    },
    {
      key: 'latency_p95_ms',
      header: 'P95 Latency',
      width: '110px',
      render: (c) => <span className="font-mono text-slate-200">{c.latency_p95_ms} ms</span>
    },
    {
      key: 'actions',
      header: 'Manual Probe',
      width: '120px',
      render: (c) => (
        <button
          onClick={() => handleManualProbe(c.id)}
          disabled={probingId === c.id}
          className="px-2.5 py-1 rounded bg-panel hover:bg-panel-elevated border border-border-subtle text-xs text-blue-400 flex items-center gap-1 font-mono transition-colors disabled:opacity-50"
        >
          {probingId === c.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
          {probingId === c.id ? 'Pinging...' : 'Probe Now'}
        </button>
      )
    }
  ];

  const incidentColumns: Column<Incident>[] = [
    {
      key: 'status',
      header: 'Incident State',
      width: '130px',
      render: (i) => <StatusBadge status={i.status} />
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '100px',
      render: (i) => (
        <span className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
          i.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
        }`}>
          {i.severity}
        </span>
      )
    },
    {
      key: 'title',
      header: 'Root Cause & Incident Timeline',
      render: (i) => (
        <div>
          <div className="font-semibold text-slate-200">{i.title}</div>
          <div className="text-[11px] text-slate-400">{i.root_cause || 'Automatic probe degradation'}</div>
        </div>
      )
    },
    {
      key: 'started_at',
      header: 'Timestamp',
      width: '150px',
      render: (i) => <span className="font-mono text-[11px] text-slate-400">{i.started_at?.slice(0, 19).replace('T', ' ')}</span>
    }
  ];

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Continuous Synthetic Monitoring & Incident NOC
          </h2>
          <p className="text-xs text-slate-400">Multi-region latency probes, SSL expiry watchdogs, and uptime analytics</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> + New Probe Check
        </button>
      </div>

      {/* Monitoring Checks Data Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Active Synthetic Endpoints ({checks.length})
        </h3>
        <DataTable
          columns={checkColumns}
          data={checks}
          searchPlaceholder="Filter checks by name or host..."
        />
      </div>

      {/* Incident Log Data Grid */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Incident Event Ledger ({incidents.length})
        </h3>
        {incidents.length > 0 ? (
          <DataTable
            columns={incidentColumns}
            data={incidents}
            searchPlaceholder="Filter incident history..."
          />
        ) : (
          <div className="p-4 bg-panel border border-border-subtle rounded text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero active incidents. All edge probes are responding with 200 OK within SLA.</span>
          </div>
        )}
      </div>

      {/* Add Check Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-panel border border-border-strong rounded-lg shadow-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Create Synthetic Monitoring Check</h3>
            <p className="text-xs text-slate-400">Configure an automated 60-second health prober.</p>

            <form onSubmit={handleCreateCheck} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Check Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. EU Edge API Gateway"
                  className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Check Type</label>
                <select
                  value={checkType}
                  onChange={e => setCheckType(e.target.value as any)}
                  className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus"
                >
                  <option value="HTTP">HTTP/HTTPS Synthetic Probe</option>
                  <option value="SSL">SSL/TLS Expiry & Cipher Watchdog</option>
                  <option value="DNS">DNS Record Drift Prober</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Endpoint URL</label>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="https://api.acme.corp/healthz"
                  className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-canvas hover:bg-surface border border-border-subtle text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
                >
                  Save & Enable Probe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
