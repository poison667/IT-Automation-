import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Zap, Activity, FileText, Database, Sparkles, X } from 'lucide-react';
import { ViewTab } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ViewTab) => void;
  onLaunchService: (serviceId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onLaunchService
}) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const items = [
    { title: "Dashboard & NOC Center", type: "NAVIGATION", tab: "dashboard" as ViewTab, icon: Activity },
    { title: "Service Marketplace", type: "NAVIGATION", tab: "marketplace" as ViewTab, icon: Zap },
    { title: "Active Jobs & Telemetry", type: "NAVIGATION", tab: "jobs" as ViewTab, icon: FileText },
    { title: "Continuous Monitoring & Pings", type: "NAVIGATION", tab: "monitoring" as ViewTab, icon: Activity },
    { title: "Data Cleansing Workbench", type: "NAVIGATION", tab: "data" as ViewTab, icon: Database },
    { title: "Document Intelligence Vault", type: "NAVIGATION", tab: "documents" as ViewTab, icon: FileText },
    { title: "Grounded AI Diagnostics", type: "NAVIGATION", tab: "ai" as ViewTab, icon: Sparkles },
    { title: "Run Website Technical Audit", type: "SERVICE", serviceId: "srv_web_audit_complete", icon: Globe },
    { title: "Profile Core Web Vitals", type: "SERVICE", serviceId: "srv_perf_core_web_vitals", icon: Zap },
    { title: "Audit SSL/TLS Cryptographic Suite", type: "SERVICE", serviceId: "srv_sec_tls_certificate", icon: Shield }
  ];

  const filtered = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-panel border border-border-strong rounded-lg shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-3 py-2.5 border-b border-border-subtle bg-surface">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command, search services, or jump to view..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-1 divide-y divide-border-subtle/40">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.type === "NAVIGATION" && item.tab) onNavigate(item.tab);
                    else if (item.type === "SERVICE" && item.serviceId) onLaunchService(item.serviceId);
                    onClose();
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-panel-elevated text-left rounded transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                    <span className="text-xs text-slate-200 group-hover:text-white font-medium">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-slate-400">
                    {item.type}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">No matching commands or services found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
