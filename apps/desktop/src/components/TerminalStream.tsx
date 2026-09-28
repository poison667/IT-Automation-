import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Check, Download } from 'lucide-react';
import { pal } from '../pal';

export interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
  stage?: string;
  progress_pct?: number;
}

interface TerminalStreamProps {
  logs: LogMessage[];
  title?: string;
  isStreaming?: boolean;
  className?: string;
}

export const TerminalStream: React.FC<TerminalStreamProps> = ({
  logs,
  title = "Live Worker Telemetry Stream",
  isStreaming = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = async () => {
    const raw = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    await pal.copyToClipboard(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const raw = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    await pal.downloadFile(`execution_log_${Date.now()}.log`, raw);
  };

  return (
    <div className={`bg-canvas border border-border-subtle rounded-md overflow-hidden flex flex-col font-mono text-xs ${className}`}>
      {/* Console Header */}
      <div className="px-3 py-1.5 bg-surface border-b border-border-subtle flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-slate-200">{title}</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> LIVE SSE
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="px-2 py-1 bg-panel hover:bg-panel-elevated rounded border border-border-subtle flex items-center gap-1 text-[11px] text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-2 py-1 bg-panel hover:bg-panel-elevated rounded border border-border-subtle flex items-center gap-1 text-[11px] text-slate-300 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      {/* Log Viewport */}
      <div
        ref={containerRef}
        className="p-3 h-48 overflow-y-auto space-y-1 text-slate-300 select-text leading-relaxed bg-[#07090E]"
      >
        {logs.length > 0 ? (
          logs.map((l, i) => {
            let levelColor = 'text-blue-400';
            if (l.level === 'WARN') levelColor = 'text-amber-400';
            else if (l.level === 'ERROR') levelColor = 'text-rose-400';
            else if (l.level === 'DEBUG') levelColor = 'text-slate-400';

            return (
              <div key={i} className="flex items-start gap-2 text-[11.5px]">
                <span className="text-slate-400 select-none shrink-0">{l.timestamp.split('T')[1]?.slice(0, 8) || l.timestamp}</span>
                <span className={`font-semibold shrink-0 uppercase text-[10px] ${levelColor}`}>[{l.level}]</span>
                <span className="text-slate-200 break-all">{l.message}</span>
              </div>
            );
          })
        ) : (
          <div className="text-slate-400 italic">No execution logs emitted yet. Waiting for worker lease...</div>
        )}
      </div>
    </div>
  );
};
