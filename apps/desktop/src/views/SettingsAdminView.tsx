import React, { useEffect, useState } from 'react';
import { Server, Terminal } from 'lucide-react';
import { api } from '../lib/api';

export const SettingsAdminView: React.FC = () => {
  const [health, setHealth] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [h, logs] = await Promise.all([
          api.getSystemHealth(),
          api.getAuditLogs()
        ]);
        setHealth(h);
        setAuditLogs(logs);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
          Administration, Worker Telemetry & Audit Logs
        </h2>
        <p className="text-xs text-slate-400">Worker cluster telemetry, security feature flags, and immutable compliance trail</p>
      </div>

      {health && (
        <div className="space-y-4">
          {/* Worker Pool Status */}
          <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Distributed Worker Pool Health
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                SYSTEM: {health.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {health.active_workers.map((w: any) => (
                <div key={w.id} className="p-3 bg-canvas border border-border-subtle rounded space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{w.id}</span>
                    <span className="text-emerald-400 text-[10px] uppercase font-bold">{w.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Concurrency: {w.concurrency} slots</div>
                  <div className="text-[11px] text-slate-400">Memory: {w.memory_mb} MB RAM</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Flags & Security Directives */}
          <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Enterprise Governance & Security Flags
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(health.feature_flags).map(([k, v]) => (
                <div key={k} className="p-2.5 bg-canvas border border-border-subtle rounded flex items-center justify-between font-mono">
                  <span className="text-slate-300">{k.replace(/_/g, ' ').toUpperCase()}</span>
                  <span className="text-emerald-400 font-bold">{v ? 'ENABLED' : 'DISABLED'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Immutable Audit Log Ledger */}
          <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Immutable Security & Operations Audit Trail
              </h3>
            </div>

            <div className="divide-y divide-border-subtle border border-border-subtle rounded bg-canvas overflow-hidden">
              {auditLogs.map((l: any, i: number) => (
                <div key={i} className="p-2.5 flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-semibold">{l.action}</span>
                    <span className="text-slate-400">{l.resource_type} [{l.resource_id}]</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[10px]">
                    <span>IP: {l.ip_address}</span>
                    <span>{l.created_at?.slice(0, 19).replace('T', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
