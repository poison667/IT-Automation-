import React, { useState } from 'react';
import { Plus, ShieldCheck, ShieldAlert, Check, Copy, ExternalLink } from 'lucide-react';
import { Asset } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { api } from '../lib/api';
import { pal } from '../pal';

interface AssetsViewProps {
  assets: Asset[];
  onRefresh: () => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ assets, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetUri, setTargetUri] = useState('');
  const [assetType, setAssetType] = useState<'URL' | 'DOMAIN' | 'API_ENDPOINT'>('URL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetUri) return;
    setIsSubmitting(true);
    try {
      await api.createAsset(name, targetUri, assetType);
      setName('');
      setTargetUri('');
      setShowAddModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToken = async (token: string) => {
    await pal.copyToClipboard(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const columns: Column<Asset>[] = [
    {
      key: 'is_verified',
      header: 'Authorization',
      width: '130px',
      render: (a) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono uppercase border ${
          a.is_verified
            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
            : 'bg-amber-950/50 text-amber-300 border-amber-800'
        }`}>
          {a.is_verified ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <ShieldAlert className="w-3 h-3 text-amber-400" />}
          {a.is_verified ? 'VERIFIED' : 'PENDING'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Asset Name',
      render: (a) => <span className="font-semibold text-slate-200">{a.name}</span>
    },
    {
      key: 'asset_type',
      header: 'Type',
      width: '120px',
      render: (a) => <span className="font-mono text-slate-400 text-[11px] uppercase">{a.asset_type}</span>
    },
    {
      key: 'target_uri',
      header: 'Target URI / Endpoint',
      render: (a) => (
        <a href={a.target_uri} target="_blank" rel="noreferrer" className="font-mono text-blue-400 hover:underline flex items-center gap-1">
          {a.target_uri} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </a>
      )
    },
    {
      key: 'verification_token',
      header: 'Proof Token',
      width: '200px',
      render: (a) => (
        <button
          onClick={() => handleCopyToken(a.verification_token)}
          className="flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-slate-200 bg-surface px-2 py-1 rounded border border-border-subtle"
          title="Click to copy DNS/HTTP challenge token"
        >
          {copiedToken === a.verification_token ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span className="truncate max-w-[130px]">{a.verification_token}</span>
        </button>
      )
    }
  ];

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Verified Asset Inventory & Scope
          </h2>
          <p className="text-xs text-slate-400">Target hostnames and endpoints authorized for automated deep auditing</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> + Add Target Asset
        </button>
      </div>

      {/* Asset Table */}
      <DataTable
        columns={columns}
        data={assets}
        searchPlaceholder="Filter assets by name or target URL..."
      />

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-panel border border-border-strong rounded-lg shadow-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Add Target Infrastructure Asset</h3>
            <p className="text-xs text-slate-400">Register a new domain, URL, or API endpoint into your authorized scope.</p>

            <form onSubmit={handleAddAsset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Asset Descriptive Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Acme Production Portal"
                  className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Asset Type</label>
                <select
                  value={assetType}
                  onChange={e => setAssetType(e.target.value as any)}
                  className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-border-focus"
                >
                  <option value="URL">Website URL</option>
                  <option value="DOMAIN">Root Domain (FQDN)</option>
                  <option value="API_ENDPOINT">REST API Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target URI / Hostname</label>
                <input
                  type="text"
                  required
                  value={targetUri}
                  onChange={e => setTargetUri(e.target.value)}
                  placeholder="e.g. https://acme.corp"
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
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
                >
                  {isSubmitting ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
