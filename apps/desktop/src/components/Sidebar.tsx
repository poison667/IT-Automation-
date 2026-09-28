import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Layers, 
  Globe, 
  Activity, 
  Database, 
  FileText, 
  BarChart3, 
  GitBranch, 
  Sparkles, 
  Archive, 
  CreditCard, 
  Settings,
  ShieldCheck
} from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  activeJobsCount: number;
  incidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeJobsCount,
  incidentsCount
}) => {
  const navItems: { id: ViewTab; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard & NOC', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Service Marketplace', icon: Store },
    { id: 'jobs', label: 'Active Jobs', icon: Layers, badge: activeJobsCount > 0 ? activeJobsCount : undefined, badgeColor: 'bg-blue-600' },
    { id: 'assets', label: 'Assets & Scope', icon: Globe },
    { id: 'monitoring', label: 'Monitoring & NOC', icon: Activity, badge: incidentsCount > 0 ? incidentsCount : undefined, badgeColor: 'bg-rose-600' },
    { id: 'data', label: 'Data Workbench', icon: Database },
    { id: 'documents', label: 'Document Vault', icon: FileText },
    { id: 'analytics', label: 'Business Telemetry', icon: BarChart3 },
    { id: 'automations', label: 'Automation DAGs', icon: GitBranch },
    { id: 'ai', label: 'AI Investigator', icon: Sparkles },
    { id: 'reports', label: 'Reports & Evidence', icon: Archive },
    { id: 'billing', label: 'Billing & Credits', icon: CreditCard },
    { id: 'settings', label: 'Admin & Audit Logs', icon: Settings },
  ];

  return (
    <aside className="w-56 bg-surface border-r border-border-subtle flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="h-12 px-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-mono font-bold text-xs text-white">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs tracking-tight text-slate-100">NEXUS<span className="text-blue-400">IT</span></span>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase -mt-0.5">Autonomous Ops</span>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" title="System Operational" />
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-120px)]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full px-2.5 py-1.5 rounded flex items-center justify-between text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-panel-elevated/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono text-white ${item.badgeColor || 'bg-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Telemetry */}
      <div className="p-3 border-t border-border-subtle bg-canvas/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>v2.0.0 PROD</span>
        </div>
        <span className="text-[10px] text-slate-400">Linux / Win</span>
      </div>
    </aside>
  );
};
