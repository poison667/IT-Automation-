import React, { useState } from 'react';
import { RefreshCw, Eye } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { DataTable, Column } from '../components/DataTable';
import { Job } from '../types';

interface ActiveJobsViewProps {
  jobs: Job[];
  onRefresh: () => void;
  onViewJob: (jobId: string) => void;
}

export const ActiveJobsView: React.FC<ActiveJobsViewProps> = ({ jobs, onRefresh, onViewJob }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredJobs = jobs.filter(j => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['QUEUED', 'RUNNING', 'ANALYZING', 'QUALITY_CHECK'].includes(j.status);
    if (filter === 'COMPLETED') return j.status === 'COMPLETED';
    if (filter === 'FAILED') return j.status === 'FAILED';
    return true;
  });

  const columns: Column<Job>[] = [
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      render: (j) => <StatusBadge status={j.status} />
    },
    {
      key: 'id',
      header: 'Job Identifier',
      width: '160px',
      render: (j) => <span className="font-mono text-slate-200 font-medium">{j.id}</span>
    },
    {
      key: 'service_id',
      header: 'Service Pipeline',
      render: (j) => (
        <div>
          <div className="font-medium text-slate-200">{j.service_id.replace('srv_', '').toUpperCase()}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            {j.input_params?.target_url || j.input_params?.target_host || 'Autonomous Input'}
          </div>
        </div>
      )
    },
    {
      key: 'current_stage',
      header: 'Stage & Progress',
      width: '180px',
      render: (j) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{j.current_stage || 'RUNNING'}</span>
            <span>{j.progress_pct}%</span>
          </div>
          <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${j.progress_pct}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'execution_cost',
      header: 'Credits',
      width: '80px',
      render: (j) => <span className="font-mono text-amber-300 font-semibold">{j.execution_cost} cr</span>
    },
    {
      key: 'created_at',
      header: 'Queued At',
      width: '140px',
      render: (j) => <span className="font-mono text-[11px] text-slate-400">{j.created_at?.slice(0, 19).replace('T', ' ')}</span>
    },
    {
      key: 'actions',
      header: 'Inspect',
      width: '80px',
      render: (j) => (
        <button
          onClick={(e) => { e.stopPropagation(); onViewJob(j.id); }}
          className="px-2 py-1 bg-panel hover:bg-panel-elevated rounded border border-border-subtle text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono transition-colors"
        >
          <Eye className="w-3 h-3" /> View
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
            Active Job Execution Queue
          </h2>
          <p className="text-xs text-slate-400">Real-time background worker telemetry and pipeline stage inspection</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-panel border border-border-subtle rounded p-0.5 text-xs">
            {['ALL', 'ACTIVE', 'COMPLETED', 'FAILED'].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filter === st ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded bg-panel hover:bg-panel-elevated border border-border-subtle text-slate-300 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <DataTable
        columns={columns}
        data={filteredJobs}
        onRowClick={(j) => onViewJob(j.id)}
        searchPlaceholder="Search jobs by ID, service, or target URL..."
        emptyMessage="No background execution jobs match your filter criteria."
      />
    </div>
  );
};
