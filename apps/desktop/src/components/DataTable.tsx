import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  searchPlaceholder = "Filter records...",
  searchKey,
  pageSize = 10,
  emptyMessage = "No matching records found."
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filteredData = data.filter(item => {
    if (!search) return true;
    if (searchKey) {
      return String(item[searchKey] || '').toLowerCase().includes(search.toLowerCase());
    }
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="bg-panel border border-border-subtle rounded-md overflow-hidden flex flex-col">
      {/* Search and Table Actions Header */}
      <div className="px-3 py-2 border-b border-border-subtle bg-surface/50 flex items-center justify-between">
        <div className="relative flex items-center w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="w-full bg-canvas border border-border-subtle text-xs rounded pl-8 pr-2.5 py-1 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-border-focus"
          />
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Showing {filteredData.length > 0 ? page * pageSize + 1 : 0}-{Math.min((page + 1) * pageSize, filteredData.length)} of {filteredData.length}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface border-b border-border-subtle text-slate-400 font-medium tracking-wider text-[11px] uppercase">
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width }} className="px-3 py-2">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-panel-elevated/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2 text-slate-200">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-slate-400 text-xs">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-3 py-2 border-t border-border-subtle bg-surface/50 flex items-center justify-between text-xs text-slate-400">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded bg-canvas border border-border-subtle disabled:opacity-40 hover:bg-surface"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded bg-canvas border border-border-subtle disabled:opacity-40 hover:bg-surface"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
