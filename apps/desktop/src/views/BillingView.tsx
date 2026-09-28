import React, { useEffect, useState } from 'react';
import { Coins, CheckCircle2, Zap } from 'lucide-react';
import { api } from '../lib/api';

interface BillingViewProps {
  onRefreshUser: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onRefreshUser }) => {
  const [summary, setSummary] = useState<any | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const loadSummary = async () => {
    try {
      const res = await api.getBillingSummary();
      setSummary(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleBuyCredits = async (pkg: string) => {
    setIsPurchasing(true);
    try {
      await api.purchaseCredits(pkg);
      await loadSummary();
      onRefreshUser();
    } catch (e: any) {
      alert("Purchase failed: " + e.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
          Billing, Credits & Subscription Plans
        </h2>
        <p className="text-xs text-slate-400">Manage operation credits, enterprise subscriptions, and invoice history</p>
      </div>

      {summary && (
        <div className="space-y-4">
          {/* Credit Overview & Top-up Card */}
          <div className="bg-panel border border-border-subtle rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Current Available Balance</span>
              <div className="flex items-center gap-2 mt-1">
                <Coins className="w-6 h-6 text-amber-400" />
                <span className="text-3xl font-bold font-mono text-amber-300">
                  {summary.organization.credit_balance.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-mono">Credits</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBuyCredits('PRO_PACK_2500')}
                disabled={isPurchasing}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" /> + Purchase 2,500 Credits ($299)
              </button>
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.pricing_plans.map((p: any) => {
              const isCurrent = summary.organization.plan === p.id;
              return (
                <div
                  key={p.id}
                  className={`bg-panel border rounded-md p-4 flex flex-col justify-between ${
                    isCurrent ? 'border-blue-500 ring-1 ring-blue-500' : 'border-border-subtle'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase">{p.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                          CURRENT PLAN
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1 font-mono">
                      <span className="text-2xl font-bold text-slate-100">${p.price_usd}</span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-border-subtle">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{p.credits.toLocaleString()} Monthly Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{p.assets_limit} Monitored Endpoints</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>All 30+ Autonomous Engines</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCurrent}
                    className={`w-full mt-4 py-1.5 rounded text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-panel-elevated text-slate-400 cursor-default'
                        : 'bg-surface hover:bg-panel-elevated text-slate-200 border border-border-subtle'
                    }`}
                  >
                    {isCurrent ? 'Active Subscription' : 'Switch Plan'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Invoice History */}
          <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Billing & Payment History
            </h3>

            <div className="divide-y divide-border-subtle border border-border-subtle rounded bg-canvas overflow-hidden">
              {summary.invoices.map((inv: any) => (
                <div key={inv.id} className="p-3 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="font-semibold text-slate-200">{inv.invoice_number}</div>
                    <div className="text-[11px] text-slate-400">{inv.created_at?.slice(0, 10)} • {inv.credits_purchased} Credits</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-100">${(inv.amount_cents / 100).toFixed(2)}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
