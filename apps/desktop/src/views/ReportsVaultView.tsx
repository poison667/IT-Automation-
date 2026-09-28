import React from 'react';
import { Download, ShieldCheck, FileText } from 'lucide-react';
import { ReportItem } from '../types';
import { DataTable, Column } from '../components/DataTable';

interface ReportsVaultViewProps {
  reports: ReportItem[];
  onRefresh: () => void;
}

export const ReportsVaultView: React.FC<ReportsVaultViewProps> = ({ reports }) => {
  const columns: Column<ReportItem>[] = [
    {
      key: 'title',
      header: 'Report Title & Target',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <div className="font-semibold text-slate-200">{r.title}</div>
            <div className="text-[11px] font-mono text-slate-400">Job: {r.job_id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      width: '130px',
      render: (r) => (
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-surface border border-border-subtle text-slate-300">
          {r.category}
        </span>
      )
    },
    {
      key: 'integrity_sha256',
      header: 'Cryptographic SHA-256',
      width: '200px',
      render: (r) => (
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400" title={r.integrity_sha256}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate max-w-[140px]">{r.integrity_sha256}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Generated Date',
      width: '150px',
      render: (r) => <span className="font-mono text-[11px] text-slate-400">{r.created_at?.slice(0, 19).replace('T', ' ')}</span>
    },
    {
      key: 'download',
      header: 'Export',
      width: '120px',
      render: (r) => (
        <a
          href={`/api/v1/reports/${r.id}/download`}
          target="_blank"
          rel="noreferrer"
          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium flex items-center gap-1 font-mono transition-colors"
        >
          <Download className="w-3 h-3" /> PDF
        </a>
      )
    }
  ];

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
          Enterprise Reports & Evidence Vault
        </h2>
        <p className="text-xs text-slate-400">Downloadable cryptographically signed PDF audits, executive summaries, and raw findings</p>
      </div>

      <DataTable
        columns={columns}
        data={reports}
        searchPlaceholder="Filter reports by title or job ID..."
        emptyMessage="No reports have been generated yet. Complete a service job to view its report."
      />
    </div>
  );
};
