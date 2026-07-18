import React from 'react';
import type { OverdueInvoice } from '../types';
import { formatINR } from './MetricCard';
import { FileText, Calendar, AlertTriangle, ShieldCheck, ShieldAlert, MessageSquare } from 'lucide-react';

interface InvoiceRiskMatrixProps {
  invoices?: OverdueInvoice[];
  isLoading: boolean;
  onInvoiceClick: (invoice: OverdueInvoice) => void;
  selectedInvoiceId?: string;
}

// Calculate overdue days relative to context date (July 18, 2026)
const getOverdueDays = (dueDateStr: string): number => {
  const dueDate = new Date(dueDateStr);
  const contextDate = new Date('2026-07-18');
  const diffTime = contextDate.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const InvoiceRiskMatrix: React.FC<InvoiceRiskMatrixProps> = ({
  invoices = [],
  isLoading,
  onInvoiceClick,
  selectedInvoiceId,
}) => {
  
  const getRiskDetails = (behavior: string) => {
    const lowerBehavior = behavior.toLowerCase();
    if (lowerBehavior.includes('chronically late')) {
      return {
        label: 'High Risk',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        leftBorder: 'border-l-4 border-l-rose-500',
        icon: ShieldAlert,
      };
    } else if (lowerBehavior.includes('late payer')) {
      return {
        label: 'Medium Risk',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        leftBorder: 'border-l-4 border-l-amber-500',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'Low Risk',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        leftBorder: 'border-l-4 border-l-emerald-500',
        icon: ShieldCheck,
      };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-800 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded w-1/6 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-charcoal-card border border-charcoal-border rounded-[20px] p-5 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-1/2">
                  <div className="h-5 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
                <div className="h-6 bg-gray-800 rounded w-1/4"></div>
              </div>
              <div className="h-[1px] bg-gray-800"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Invoice Risk Matrix
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Rendered as interactive actionable cards. Click to invoke Copilot analysis.
          </p>
        </div>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          {invoices.length} Overdue Invoices
        </span>
      </div>

      {invoices.length === 0 ? (
        <div className="glow-card bg-charcoal-card rounded-[24px] p-8 text-center border border-dashed border-charcoal-border">
          <FileText className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-xs text-gray-400">No overdue invoices found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((invoice) => {
            const risk = getRiskDetails(invoice.historical_payment_behavior);
            const RiskIcon = risk.icon;
            const isSelected = selectedInvoiceId === invoice.invoice_id;
            const overdueDays = getOverdueDays(invoice.due_date);

            return (
              <div
                key={invoice.invoice_id}
                onClick={() => onInvoiceClick(invoice)}
                className={`glow-card bg-charcoal-card rounded-[20px] p-5 cursor-pointer relative group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${risk.leftBorder} ${
                  isSelected 
                    ? 'border-indigo-500 shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)]' 
                    : 'border-charcoal-border hover:border-white/10'
                }`}
              >
                {/* Visual selection indicator */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                )}

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors duration-200 truncate max-w-[180px] sm:max-w-none">
                      {invoice.client_name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {invoice.invoice_id}
                      </span>
                      <span className="text-gray-700 text-[10px] font-bold">•</span>
                      <span className="text-[10px] font-bold text-rose-400">
                        Overdue {overdueDays} days
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${risk.bg} ${risk.text} ${risk.border}`}>
                    <RiskIcon className="h-3 w-3" />
                    {risk.label}
                  </span>
                </div>

                <div className="h-[1px] bg-white/5 my-4" />

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                      Amount Due
                    </span>
                    <span className="text-base font-extrabold text-white mt-0.5 block">
                      {formatINR(invoice.amount)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                      Due Date
                    </span>
                    <span className="text-xs text-gray-300 font-semibold mt-0.5 flex items-center gap-1 justify-end">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      {invoice.due_date}
                    </span>
                  </div>
                </div>

                {/* Historical Behavior and Actionable CTA */}
                <div className="mt-4 pt-3.5 border-t border-white/[0.03] flex items-center justify-between gap-3 bg-black/10 p-2.5 rounded-xl">
                  <div className="text-[10px] text-gray-400 leading-normal flex-1">
                    <span className="font-bold text-gray-300 block mb-0.5">Payment Behavior</span>
                    {invoice.historical_payment_behavior}
                  </div>
                  
                  {/* Action Hint visible on hover */}
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200">
                    <MessageSquare className="h-3 w-3" />
                    <span>Analyze with Gemma →</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
