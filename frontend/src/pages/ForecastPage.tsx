import React, { useState, useEffect } from 'react';
import { ForecastChart } from '../components/ForecastChart';
import { getFinancials } from '../services/api';
import type { FinancialSummary } from '../types';
import { Calendar, Info, LineChart } from 'lucide-react';

export const ForecastPage: React.FC = () => {
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

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Liquidity Forecast</h2>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">30-day deterministic cash flow models.</p>
      </div>

      {/* Main Forecast Chart Widget */}
      <ForecastChart
        currentCash={financials?.current_cash || 520000}
        forecastPosition={financials?.net_forecast_position || 605000}
        isLoading={isLoading}
      />

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Forecast Details */}
        <div className="glow-card bg-[#181b25] border border-white/5 rounded-[24px] p-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <LineChart className="h-4.5 w-4.5 text-indigo-400" />
            Forecast Methodology
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Projections are calculated daily by integrating outstanding invoices, recurring overheads, historical client payment timelines, and seasonal expenses.
          </p>
          <div className="mt-4 p-3 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-xl flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-indigo-300 leading-normal font-semibold">
              Adjusted for Shiva Logistics history (avg clearance delay: 42 days).
            </span>
          </div>
        </div>

        {/* Projections timeline list */}
        <div className="glow-card bg-[#181b25] border border-white/5 rounded-[24px] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Calendar className="h-4.5 w-4.5 text-indigo-400" />
            Milestone Projections
          </h3>
          
          <div className="space-y-3">
            {[
              { date: 'Aug 4, 2026', desc: 'Opening balance clearance', cash: '₹5,20,000', color: 'text-indigo-400' },
              { date: 'Aug 11, 2026', desc: 'Mid-month receivables clearance', cash: '₹5,80,000', color: 'text-emerald-400' },
              { date: 'Aug 18, 2026', desc: 'Projected Payroll shortfall dip', cash: '₹4,05,000', color: 'text-rose-400 font-extrabold animate-pulse' },
              { date: 'Aug 25, 2026', desc: 'Closing forecast position balance', cash: '₹6,05,000', color: 'text-cyan-400' },
            ].map((milestone, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-black/10 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-white block">{milestone.date}</span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">{milestone.desc}</span>
                </div>
                <span className={`font-mono font-bold ${milestone.color}`}>{milestone.cash}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
