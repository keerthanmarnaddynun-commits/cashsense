import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceRiskMatrix } from '../components/InvoiceRiskMatrix';
import { useBatchStore } from '../store/batchStore';
import type { OverdueInvoice } from '../types';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { analytics, loading } = useBatchStore();

  const handleInvoiceClick = (invoice: OverdueInvoice) => {
    const prompt = `Analyze invoice ${invoice.invoice_id} for ${invoice.client_name} and generate an actionable warning.`;
    navigate('/copilot', { state: { query: prompt } });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Invoice Ledger</h2>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Evaluate risk profiles and behavioral histories.</p>
      </div>

      {/* Overdue matrix grid */}
      <div className="bg-charcoal-dark border border-white/5 rounded-[24px] p-6 glow-card">
        <InvoiceRiskMatrix
          invoices={analytics?.invoices || []}
          isLoading={loading}
          onInvoiceClick={handleInvoiceClick}
        />
      </div>
    </div>
  );
};
export default InvoicesPage;
