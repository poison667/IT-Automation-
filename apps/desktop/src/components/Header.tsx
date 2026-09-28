import React from 'react';
import { Search, Coins, User, Command } from 'lucide-react';
import { UserContext } from '../types';

interface HeaderProps {
  userContext: UserContext | null;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userContext, onOpenCommandPalette }) => {
  return (
    <header className="h-12 bg-surface border-b border-border-subtle px-4 flex items-center justify-between select-none">
      {/* Workspace Context & Command Trigger */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Workspace:</span>
          <span className="font-semibold text-slate-100 bg-panel px-2 py-0.5 rounded border border-border-subtle font-mono">
            {userContext?.org_name || 'Acme Global Operations'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 font-mono font-medium">
            {userContext?.plan || 'ENTERPRISE'}
          </span>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 bg-canvas hover:bg-panel border border-border-subtle px-2.5 py-1 rounded text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick search or command...</span>
          <span className="flex items-center gap-0.5 text-[10px] font-mono bg-surface px-1 rounded border border-border-subtle text-slate-400">
            <Command className="w-2.5 h-2.5" /> K
          </span>
        </button>
      </div>

      {/* Credit Balance & User Profile */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-panel border border-border-subtle px-2.5 py-1 rounded text-xs">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400 text-[11px]">Credits:</span>
          <span className="font-mono font-bold text-amber-300">
            {userContext ? userContext.credit_balance.toLocaleString() : '4,850'}
          </span>
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-border-subtle text-xs">
          <div className="w-7 h-7 rounded bg-panel-elevated border border-border-strong flex items-center justify-center text-slate-200">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200 leading-tight">
              {userContext?.full_name || 'Alex Vance'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {userContext?.role || 'OWNER'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
