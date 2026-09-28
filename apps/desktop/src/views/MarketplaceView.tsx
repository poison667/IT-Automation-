import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Zap, 
  Shield, 
  Database, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Clock, 
  Coins, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ServiceDefinition, ServiceCategory } from '../types';

interface MarketplaceViewProps {
  services: ServiceDefinition[];
  onLaunchService: (serviceId: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ services, onLaunchService }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: ServiceCategory; label: string; icon: any }[] = [
    { id: 'ALL', label: 'All Services', icon: Zap },
    { id: 'WEBSITE', label: 'Website & DOM', icon: Globe },
    { id: 'SEO', label: 'SEO Diagnostics', icon: Search },
    { id: 'PERFORMANCE', label: 'Performance & Vitals', icon: Zap },
    { id: 'ACCESSIBILITY', label: 'Accessibility (WCAG)', icon: Globe },
    { id: 'SECURITY', label: 'Security & TLS', icon: Shield },
    { id: 'DATA', label: 'Data Engineering', icon: Database },
    { id: 'DOCUMENTS', label: 'Documents & OCR', icon: FileText },
    { id: 'ANALYTICS', label: 'Business Telemetry', icon: BarChart3 },
    { id: 'AI', label: 'AI Investigators', icon: Sparkles },
  ];

  const filteredServices = services.filter(s => {
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-panel border border-border-subtle p-3 rounded-md">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {categories.map(c => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface'
                }`}
              >
                <Icon className="w-3 h-3" />
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 30+ service engines..."
            className="w-full bg-canvas border border-border-subtle text-xs rounded pl-8 pr-2.5 py-1.5 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-border-focus"
          />
        </div>
      </div>

      {/* Service Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredServices.map(srv => {
          return (
            <div
              key={srv.id}
              className="bg-panel border border-border-subtle rounded-md p-4 flex flex-col justify-between hover:border-border-strong hover:bg-panel-elevated/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-border-subtle text-blue-400 font-semibold tracking-wider">
                    {srv.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {srv.cost_credits} credits
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {srv.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{srv.estimated_runtime_sec}s
                  </span>
                  {srv.authorization_required && (
                    <span className="flex items-center gap-0.5 text-amber-400/90" title="Domain authorization required">
                      <ShieldAlert className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onLaunchService(srv.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  Configure <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
