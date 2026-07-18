import React from 'react';
import { AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';

interface RiskAlertBannerProps {
  onViewAnalysis: () => void;
}

export const RiskAlertBanner: React.FC<RiskAlertBannerProps> = ({ onViewAnalysis }) => {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-rose-500/20 bg-gradient-to-r from-rose-950/45 via-rose-900/15 to-charcoal-dark/20 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_20px_-2px_rgba(244,63,94,0.12)]">
      {/* Glow Effect */}
      <div className="absolute top-0 right-1/4 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 shrink-0">
          <AlertOctagon className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Critical Risk
            </span>
            <span className="text-xs text-rose-400/80 font-medium">Timeline Alert</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1.5 tracking-tight">
            Cashflow Risk Detected
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            Expected shortfall of <span className="font-semibold text-rose-300 text-base">₹1.2 lakh</span> on <span className="font-medium text-white border-b border-dashed border-gray-600">Aug 18</span>.
          </p>
        </div>
      </div>

      <button
        onClick={onViewAnalysis}
        className="group px-4.5 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl text-xs font-bold text-white transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 shadow-lg shadow-rose-950/30"
      >
        <span>View AI Analysis</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
      </button>
    </div>
  );
};
