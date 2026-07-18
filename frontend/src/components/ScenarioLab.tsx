import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { formatINR } from './MetricCard';

interface ScenarioLabProps {
  isLoading: boolean;
}

import { useBatchStore } from '../store/batchStore';

export const ScenarioLab: React.FC<ScenarioLabProps> = ({ isLoading }) => {
  const { analytics } = useBatchStore();
  const [delay, setDelay] = useState<number>(15);

  // Calculations derived dynamically from active workspace snapshots
  const baseRunway = analytics?.kpis?.cash_runway_days ?? 18;
  const baseMinCash = analytics?.kpis?.liquidity_buffer ?? 120000;

  // Let runway fall by ~0.5 days per day of delay (minimum of 3 days)
  const currentRunway = Math.max(baseRunway - Math.round(delay * 0.5), 3);

  // Let minimum cash drop by 8,000 per day of delay
  const currentMinCash = baseMinCash - (delay * 8000);

  // Dynamic AI Insights text based on delay
  const getAIInsight = (days: number) => {
    if (days === 0) {
      return 'Optimized Clearance: Receivables are cleared instantly. Runway extends to 25+ days, removing payroll shortfall risk.';
    } else if (days < 10) {
      return `Manageable Buffer: A minor ${days}-day delay decreases minimum cash to ${formatINR(currentMinCash)}. Forecast margins remain stable.`;
    } else if (days <= 20) {
      return `Payroll Risk Warning: A ${days}-day delay creates a payroll risk in the third week of August (Aug 18 shortfall of ₹1.2 lakh).`;
    } else {
      return `Insolvency Risk Alert: A critical ${days}-day delay triggers a severe capital deficit (${formatINR(currentMinCash)}), causing payroll and vendor payments to fail.`;
    }
  };

  const isCritical = currentRunway < 10 || currentMinCash < 40000;

  if (isLoading) {
    return (
      <div className="glow-card bg-charcoal-card rounded-[24px] p-6 space-y-4 animate-pulse border border-charcoal-border">
        <div className="h-5 bg-gray-800 rounded w-1/4"></div>
        <div className="h-10 bg-gray-800 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="glow-card bg-charcoal-card rounded-[24px] p-6 border border-charcoal-border relative overflow-hidden transition-all duration-300">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-400" />
            Scenario Lab
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Model how payment collection delays impact runway and cash cushions.
          </p>
        </div>
        <button
          onClick={() => setDelay(15)}
          className="p-2 bg-charcoal-dark border border-charcoal-border rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Lab</span>
        </button>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Slider Controls */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">
              Customer Payment Delay
            </label>
            <span className="text-sm font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">
              {delay} Days
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
            <span>On-Time (0d)</span>
            <span>Grace Period (10d)</span>
            <span>Critical (30d)</span>
          </div>
        </div>

        {/* Live Metrics Displays */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Live Runway */}
          <div className="p-4 bg-charcoal-dark/50 border border-charcoal-border rounded-[18px] text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
              Estimated Runway
            </span>
            <span className={`text-2xl font-extrabold block mt-2 tracking-tight ${
              currentRunway >= 15 ? 'text-emerald-400' : currentRunway >= 10 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {currentRunway} Days
            </span>
            <span className="text-[9px] text-gray-400 mt-1 block">
              {currentRunway >= 15 ? 'Healthy bounds' : 'High pressure'}
            </span>
          </div>

          {/* Live Minimum Cash */}
          <div className="p-4 bg-charcoal-dark/50 border border-charcoal-border rounded-[18px] text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
              Min Cash Cushion
            </span>
            <span className={`text-xl font-extrabold block mt-2 tracking-tight truncate ${
              currentMinCash > 40000 ? 'text-emerald-400' : currentMinCash >= 0 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {formatINR(currentMinCash)}
            </span>
            <span className="text-[9px] text-gray-400 mt-1 block">
              {currentMinCash >= 0 ? 'Net positive' : 'Capital shortage'}
            </span>
          </div>

        </div>
      </div>

      {/* Yellow AI Insight Box */}
      <div className={`mt-6 p-4 rounded-2xl flex gap-3.5 items-start border ${
        isCritical 
          ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
          : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
      }`}>
        <div className={`p-2 rounded-xl shrink-0 ${
          isCritical ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          {isCritical ? <AlertTriangle className="h-4.5 w-4.5" /> : <Sparkles className="h-4.5 w-4.5" />}
        </div>
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider block">
            Gemma AI Insight
          </span>
          <p className="text-xs leading-relaxed mt-1 font-medium text-gray-300">
            {getAIInsight(delay)}
          </p>
        </div>
      </div>

    </div>
  );
};
