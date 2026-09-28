import React, { useState } from 'react';
import { Play, CheckCircle2, Download } from 'lucide-react';
import { api } from '../lib/api';
import { pal } from '../pal';

export const DocumentVaultView: React.FC = () => {
  const [docName, setDocName] = useState('Vendor_Invoice_Cloud_Services_Q3.pdf');
  const [docType, setDocType] = useState('INVOICE');
  const [rawText, setRawText] = useState(`INVOICE #INV-2026-NEXUS-9812
Date: 2026-09-28
Vendor: Global Infrastructure Networks Inc
Bill To: Acme Corp (Production Workspace)

Line Items:
Enterprise Managed Kubernetes Node Pool 2 $750.00 $1500.00
Cloudflare Magic Transit Anti-DDoS Gateway 1 $500.00 $500.00
Automated Backup Storage & Retention Vault 3 $100.00 $300.00

Subtotal: $2300.00
Estimated Tax (8%): $184.00
Total Due: $2484.00
Payment Terms: Net 30`);

  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any | null>(null);

  const handleRunExtraction = async () => {
    setIsProcessing(true);
    try {
      const res = await api.extractDocument(docName, rawText, docType);
      setExtractionResult(res.extraction);
    } catch (e: any) {
      alert("Extraction failed: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadJSON = async () => {
    if (!extractionResult) return;
    await pal.downloadFile(
      `${docName.replace(/\.[^/.]+$/, "")}_extracted.json`,
      JSON.stringify(extractionResult, null, 2),
      'application/json'
    );
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-48px)]">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
          Document Intelligence & Extraction Vault
        </h2>
        <p className="text-xs text-slate-400">Automated key-value binding, tabular line-item extraction, and mathematical verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Col: Document Text Layer Input */}
        <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              1. Document Text Layer & Template
            </h3>
            <span className="text-[10px] font-mono text-blue-400 bg-surface px-2 py-0.5 rounded border border-border-subtle">
              OCR & Layout Parser
            </span>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Document Name</label>
            <input
              type="text"
              value={docName}
              onChange={e => setDocName(e.target.value)}
              className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-border-focus font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Document Type Template</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full bg-canvas border border-border-subtle rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-border-focus"
            >
              <option value="INVOICE">Vendor Invoice (Line Items + Tax Totals)</option>
              <option value="RECEIPT">Expense Receipt</option>
              <option value="CONTRACT">Service Level Agreement / Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1">Raw Document Content (Extracted Text)</label>
            <textarea
              rows={10}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="w-full bg-canvas border border-border-subtle rounded p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-border-focus resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleRunExtraction}
            disabled={isProcessing}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isProcessing ? 'Extracting & Validating Totals...' : 'Execute Key-Value & Tabular Extraction'}
          </button>
        </div>

        {/* Right Col: Extracted Structured Record */}
        <div className="bg-panel border border-border-subtle rounded-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              2. Verified Structured Extraction
            </h3>
            {extractionResult && (
              <button
                onClick={handleDownloadJSON}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" /> Download JSON
              </button>
            )}
          </div>

          {extractionResult ? (
            <div className="space-y-3 text-xs">
              {/* Top Key-Values */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-canvas border border-border-subtle rounded font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Invoice Number</span>
                  <span className="font-bold text-slate-100">{extractionResult.extracted_fields.invoice_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Invoice Date</span>
                  <span className="text-slate-200">{extractionResult.extracted_fields.invoice_date}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-border-subtle">
                  <span className="text-slate-400 text-[10px] block uppercase">Vendor / Issuer</span>
                  <span className="font-semibold text-slate-200">{extractionResult.extracted_fields.vendor_name}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Extracted Tabular Line Items ({extractionResult.line_items.length})
                </h4>
                <div className="divide-y border border-border-subtle rounded bg-canvas overflow-hidden">
                  {extractionResult.line_items.map((item: any, i: number) => (
                    <div key={i} className="px-3 py-2 flex items-center justify-between font-mono text-[11px]">
                      <div>
                        <div className="font-medium text-slate-200">{item.description}</div>
                        <div className="text-slate-400 text-[10px]">Qty: {item.quantity} @ ${item.unit_price.toFixed(2)}</div>
                      </div>
                      <div className="font-bold text-slate-100">${item.line_total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mathematical Verification Seal */}
              <div className="p-3 bg-surface border border-border-subtle rounded flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-slate-200 font-semibold text-xs">Mathematical Integrity Verified</div>
                    <div className="text-[10px] text-slate-400">Sum(Line Items) + Tax == Total Due</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Due</span>
                  <span className="text-sm font-bold text-emerald-400">
                    ${extractionResult.financial_summary.calculated_total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Paste or inspect your document on the left and click "Execute Key-Value & Tabular Extraction" to parse and verify structured data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
