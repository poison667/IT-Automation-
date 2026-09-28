import React, { useState } from 'react';
import { Play, Coins, Clock, ShieldAlert } from 'lucide-react';
import { ServiceDefinition, Asset } from '../types';

interface ServiceConfigViewProps {
  service: ServiceDefinition;
  assets: Asset[];
  userCreditBalance: number;
  onSubmitJob: (serviceId: string, params: Record<string, any>, assetId?: string) => Promise<void>;
  onCancel: () => void;
}

export const ServiceConfigView: React.FC<ServiceConfigViewProps> = ({
  service,
  assets,
  userCreditBalance,
  onSubmitJob,
  onCancel
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    if (service.inputs_schema?.properties) {
      Object.entries(service.inputs_schema.properties).forEach(([key, prop]) => {
        if (prop.default !== undefined) {
          defaults[key] = prop.default;
        } else if (key === 'target_url' || key === 'target_host') {
          defaults[key] = assets[0]?.target_uri || 'https://example.com';
        } else if (key === 'domain_name') {
          defaults[key] = 'example.com';
        } else {
          defaults[key] = '';
        }
      });
    }
    return defaults;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setFormData(prev => ({
        ...prev,
        target_url: asset.target_uri,
        target_host: asset.target_uri.replace('https://', '').replace('http://', '').split('/')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmitJob(service.id, formData, selectedAssetId || undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to submit job.');
      setIsSubmitting(false);
    }
  };

  const hasEnoughCredits = userCreditBalance >= service.cost_credits;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Service Header Overview */}
      <div className="bg-canvas border border-border-subtle rounded p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono uppercase text-blue-400 text-[10px] font-semibold">{service.category}</span>
          <div className="flex items-center gap-1 font-mono text-amber-300 font-bold">
            <Coins className="w-3 h-3 text-amber-400" />
            {service.cost_credits} Credits
          </div>
        </div>
        <h4 className="text-sm font-semibold text-slate-100">{service.name}</h4>
        <p className="text-slate-400 leading-relaxed">{service.description}</p>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> SLA: ~{service.estimated_runtime_sec}s</span>
          {service.authorization_required && (
            <span className="flex items-center gap-1 text-amber-400"><ShieldAlert className="w-3 h-3" /> Verified Scope Required</span>
          )}
        </div>
      </div>

      {/* Asset Scope Binding Selector */}
      {assets.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-medium">Select Verified Target Asset (Optional)</label>
          <select
            value={selectedAssetId}
            onChange={e => handleAssetChange(e.target.value)}
            className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus"
          >
            <option value="">-- Direct URL / Manual Input --</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.target_uri})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dynamic Form Properties from JSONSchema */}
      {service.inputs_schema?.properties && Object.entries(service.inputs_schema.properties).map(([key, prop]) => {
        return (
          <div key={key} className="space-y-1.5">
            <label className="block text-slate-300 font-medium">
              {prop.title || key} {service.inputs_schema.required?.includes(key) && <span className="text-rose-400">*</span>}
            </label>

            {prop.enum ? (
              <select
                value={formData[key] || prop.enum[0]}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus"
              >
                {prop.enum.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : prop.type === 'boolean' ? (
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!formData[key]}
                  onChange={e => setFormData({ ...formData, [key]: e.target.checked })}
                  className="rounded bg-canvas border-border-subtle text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300">{prop.title || key}</span>
              </label>
            ) : prop.type === 'integer' || prop.type === 'number' ? (
              <input
                type="number"
                min={prop.minimum}
                max={prop.maximum}
                value={formData[key] !== undefined ? formData[key] : ''}
                onChange={e => setFormData({ ...formData, [key]: parseInt(e.target.value) || 0 })}
                className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus font-mono"
              />
            ) : (
              <input
                type="text"
                value={formData[key] || ''}
                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus font-mono"
                placeholder={`Enter ${prop.title || key}...`}
              />
            )}
          </div>
        );
      })}

      {/* Credit & Authorization Pre-flight */}
      <div className="p-3 bg-surface rounded border border-border-subtle flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400">Available Credits: </span>
          <span className="font-mono font-bold text-slate-200">{userCreditBalance.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-400">Cost: </span>
          <span className="font-mono font-bold text-amber-300">-{service.cost_credits} cr</span>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Form Actions */}
      <div className="pt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded bg-canvas hover:bg-surface border border-border-subtle text-slate-300 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !hasEnoughCredits}
          className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isSubmitting ? 'Enqueuing...' : 'Launch Service'}
        </button>
      </div>
    </form>
  );
};
