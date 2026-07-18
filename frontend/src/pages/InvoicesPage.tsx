import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceRiskMatrix } from '../components/InvoiceRiskMatrix';
import { getFinancials } from '../services/api';
import type { FinancialSummary, OverdueInvoice } from '../types';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFinancials();
        setFinancials(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInvoiceClick = (invoice: OverdueInvoice) => {
    const prompt = `Analyze invoice ${invoice.invoice_id} for ${invoice.client_name} and generate an actionable warning.`;
    // Route directly to AI copilot page with this prompt prefilled in navigation state
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
          invoices={financials?.overdue_invoices}
          isLoading={isLoading}
          onInvoiceClick={handleInvoiceClick}
        />
      </div>
    </div>
  );
};
