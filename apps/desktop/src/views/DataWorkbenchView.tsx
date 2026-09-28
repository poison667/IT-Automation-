import React, { useState } from 'react';
import { Play, Download } from 'lucide-react';
import { api } from '../lib/api';
import { pal } from '../pal';

export const DataWorkbenchView: React.FC = () => {
  const [datasetName, setDatasetName] = useState('Customer_Lead_Feed_Q3');
  const [rawDataText, setRawDataText] = useState(JSON.stringify([
    { "id": 101, "company_name": "  Acme Corp  ", "email": "info@acme.com", "revenue": "$12,400", "country": "US" },
    { "id": 102, "company_name": "Globex Inc", "email": null, "revenue": "$8,200", "country": "DE" },
    { "id": 101, "company_name": "Acme Corp", "email": "info@acme.com", "revenue": "$12,400", "country": "US" },
    { "id": 103, "company_name": "Soylent Corp", "email": "contact@soylent.com", "revenue": null, "country": "UK" },
    { "id": 104, "company_name": "  Initech LLC  ", "email": "billing@initech.com", "revenue": "$45,000", "country": "US" }
  ], null, 2));

  const [deduplicate, setDeduplicate] = useState(true);
  const [nullStrategy, setNullStrategy] = useState('FILL_DEFAULT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanseResult, setCleanseResult] = useState<any | null>(null);

  const handleRunCleansing = async () => {
    setIsProcessing(true);
    try {
      const parsedRows = JSON.parse(rawDataText);
      const res = await api.cleanseData(datasetName, parsedRows, deduplicate, nullStrategy);
      setCleanseResult(res.results);
    } catch (e: any) {
      alert("Parsing or processing failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = async () => {
    if (!cleanseResult?.cleaned_rows) return;
    const rows = cleanseResult.cleaned_rows;
    const headers = Object.keys(rows[0] || {}).join(',');
    const body = rows.map((r: any) => Object.values(r).map(v => `"${v ?? ''}"`).join(',')).join('\n');
    await pal.downloadFile(`${datasetName}_cleansed.csv`, `${headers}\n${body}`, 'text/csv');
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
          Data Engineering & Cleansing Workbench
        </h2>
        <p className="text-xs text-slate-400">Polars high-throughput engine: Automated schema profiling, deduplication, and normalization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Data Input & Rule Configurator */}
        <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              1. Input Dataset & Cleansing Rules
            </h3>
            <span className="text-[10px] font-mono text-blue-400 bg-surface px-2 py-0.5 rounded border border-border-subtle">
              Engine: Polars (Rust)
            </span>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Dataset Identifier</label>
            <input
              type="text"
              value={datasetName}
              onChange={e => setDatasetName(e.target.value)}
              className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-border-focus font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Raw Dataset (JSON / Structured Objects)</label>
            <textarea
              rows={8}
              value={rawDataText}
              onChange={e => setRawDataText(e.target.value)}
              className="w-full bg-canvas border border-border-subtle rounded p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-border-focus resize-none"
            />
          </div>

          {/* Transformation Rule Toggles */}
          <div className="space-y-2 pt-2 border-t border-border-subtle text-xs">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deduplicate}
                  onChange={e => setDeduplicate(e.target.checked)}
                  className="rounded bg-canvas border-border-subtle text-blue-600 focus:ring-0"
                />
                <span>Remove Duplicate Records (Vectorized Deduplication)</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Null Value Strategy:</span>
              <select
                value={nullStrategy}
                onChange={e => setNullStrategy(e.target.value)}
                className="bg-canvas border border-border-subtle rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
              >
                <option value="FILL_DEFAULT">Fill Defaults (N/A or 0)</option>
                <option value="DROP">Drop Null Rows</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunCleansing}
            disabled={isProcessing}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isProcessing ? 'Executing Polars Transformations...' : 'Execute Cleansing Pipeline'}
          </button>
        </div>

        {/* Right Column: Execution Results & Column Profiler */}
        <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              2. Transformation Summary & Profiling
            </h3>
            {cleanseResult && (
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" /> Export Cleaned CSV
              </button>
            )}
          </div>

          {cleanseResult ? (
            <div className="space-y-3 text-xs">
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div className="p-2.5 bg-canvas rounded border border-border-subtle text-center">
                  <div className="text-slate-400 text-[10px] uppercase">Input Rows</div>
                  <div className="text-sm font-bold text-slate-100">{cleanseResult.initial_row_count}</div>
                </div>
                <div className="p-2.5 bg-canvas rounded border border-border-subtle text-center">
                  <div className="text-slate-400 text-[10px] uppercase">Cleaned Rows</div>
                  <div className="text-sm font-bold text-emerald-400">{cleanseResult.cleaned_row_count}</div>
                </div>
                <div className="p-2.5 bg-canvas rounded border border-border-subtle text-center">
                  <div className="text-slate-400 text-[10px] uppercase">Deduplicated</div>
                  <div className="text-sm font-bold text-amber-300">-{cleanseResult.duplicates_removed}</div>
                </div>
              </div>

              {/* Column Schema Profile */}
              <div>
                <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Column Profiling Breakdown
                </h4>
                <div className="divide-y border border-border-subtle rounded bg-canvas overflow-hidden">
                  {cleanseResult.column_profiles.map((cp: any) => (
                    <div key={cp.name} className="px-3 py-1.5 flex items-center justify-between font-mono text-[11px]">
                      <span className="font-semibold text-slate-200">{cp.name}</span>
                      <span className="text-slate-400">{cp.type}</span>
                      <span className="text-amber-400">Nulls: {cp.null_percentage}%</span>
                      <span className="text-blue-400">Unique: {cp.unique_values}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cleaned Data Preview */}
              <div>
                <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Cleaned Rows Preview
                </h4>
                <pre className="p-2.5 bg-canvas border border-border-subtle rounded font-mono text-[10.5px] text-slate-300 overflow-x-auto max-h-40">
                  {JSON.stringify(cleanseResult.cleaned_rows, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Configure parameters on the left and click "Execute Cleansing Pipeline" to profile and standardize your dataset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
