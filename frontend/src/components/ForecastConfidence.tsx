import React from 'react';
import { Percent, ShieldCheck } from 'lucide-react';

interface ForecastConfidenceProps {
  confidenceScore?: number; // e.g. 82
  isLoading: boolean;
}

export const ForecastConfidence: React.FC<ForecastConfidenceProps> = ({
  confidenceScore = 82,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="glow-card bg-charcoal-card rounded-[24px] p-6 space-y-4 animate-pulse border border-charcoal-border">
        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
        <div className="h-8 bg-gray-800 rounded w-1/2"></div>
        <div className="h-2 bg-gray-800 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="glow-card bg-charcoal-card rounded-[24px] p-6 border border-charcoal-border flex flex-col justify-between relative overflow-hidden transition-all duration-300">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none" />

      <div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">
              Confidence Index
            </span>
            <h3 className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-wide">
              Forecast Confidence
            </h3>
          </div>
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Percent className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {confidenceScore}%
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <ShieldCheck className="h-3.5 w-3.5" /> High Reliability
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-2 font-medium leading-relaxed">
          Based on 6 months of historical transaction and behavior history.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="w-full bg-gray-800/60 rounded-full h-2 overflow-hidden border border-white/[0.02]">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${confidenceScore}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
          <span>Stochastic Bounds</span>
          <span>Target Accuracy limit: 95%</span>
        </div>
      </div>
    </div>
  );
};
