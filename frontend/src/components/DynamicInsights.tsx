import React from 'react';
import type { FlexibleMetric } from '../types';
import { formatINR } from './MetricCard';
import { Coins, ArrowUpRight, ArrowDownRight, Briefcase, ShieldCheck, ClipboardList, ShieldAlert } from 'lucide-react';

interface DynamicInsightsProps {
  dynamicFields: Record<string, FlexibleMetric>;
}

export const DynamicInsights: React.FC<DynamicInsightsProps> = ({ dynamicFields }) => {
  const getCategory = (key: string): 'Liquidity' | 'Incoming' | 'Outgoing' | 'Assets' | 'Compliance' | 'Other' => {
    const k = key.toLowerCase();
    if (k.includes('cash') || k.includes('bank') || k.includes('liquidity') || k.includes('runway') || k.includes('cushion') || k.includes('balance')) {
      return 'Liquidity';
    }
    if (k.includes('receivable') || k.includes('incoming') || k.includes('collection') || k.includes('revenue') || k.includes('sales') || k.includes('income')) {
      return 'Incoming';
    }
    if (k.includes('expense') || k.includes('outgoing') || k.includes('cost') || k.includes('payroll') || k.includes('payable') || k.includes('spend') || k.includes('payment')) {
      return 'Outgoing';
    }
    if (k.includes('asset') || k.includes('inventory') || k.includes('property') || k.includes('equity') || k.includes('holding')) {
      return 'Assets';
    }
    if (k.includes('tax') || k.includes('audit') || k.includes('compliance') || k.includes('regulation') || k.includes('risk') || k.includes('rule')) {
      return 'Compliance';
    }
    return 'Other';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Liquidity': return Coins;
      case 'Incoming': return ArrowUpRight;
      case 'Outgoing': return ArrowDownRight;
      case 'Assets': return Briefcase;
      case 'Compliance': return ShieldCheck;
      default: return ClipboardList;
    }
  };

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'Liquidity': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'Incoming': return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5';
      case 'Outgoing': return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      case 'Assets': return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
      case 'Compliance': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      default: return 'text-gray-400 border-white/5 bg-white/[0.02]';
    }
  };

  const cleanLabel = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (confidence === undefined || confidence >= 0.8) return null;
    if (confidence >= 0.5) {
      return (
        <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded shrink-0">
          Verify
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded flex items-center gap-0.5 shrink-0">
        <ShieldAlert className="h-2.5 w-2.5" /> Low Confidence
      </span>
    );
  };

  const fieldsList = Object.entries(dynamicFields);

  if (fieldsList.length === 0) {
    return null;
  }

  const groups: Record<string, [string, FlexibleMetric][]> = {
    Liquidity: [],
    Incoming: [],
    Outgoing: [],
    Assets: [],
    Compliance: [],
    Other: []
  };

  fieldsList.forEach(([key, val]) => {
    const cat = getCategory(key);
    groups[cat].push([key, val]);
  });

  return (
    <div className="glow-card bg-charcoal-card rounded-[24px] p-6 border border-charcoal-border relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="mb-5 pb-4 border-b border-white/[0.04]">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-400" />
          Extracted Dynamic Insights
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Additional financial vectors extracted by Gemma AI parsing models.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([category, items]) => {
          if (items.length === 0) return null;
          
          const Icon = getCategoryIcon(category);
          const colors = getCategoryColors(category);

          return (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-extrabold text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
                <span className={`p-1 rounded ${colors.split(' ')[2]} border ${colors.split(' ')[1]}`}>
                  <Icon className="h-3 w-3" />
                </span>
                {category}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(([key, metric]) => (
                  <div 
                    key={key} 
                    className="p-4 bg-charcoal-dark/45 border border-charcoal-border rounded-[18px] flex flex-col justify-between hover:border-white/10 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                        {cleanLabel(key)}
                      </span>
                      <span className="text-lg font-bold text-white mt-1 block">
                        {metric.value !== null ? formatINR(metric.value) : 'Unavailable'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-white/[0.03]">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase">Confidence</span>
                        <span className="text-[10px] font-semibold text-gray-300">
                          {metric.confidence !== undefined ? `${Math.round(metric.confidence * 100)}%` : '100%'}
                        </span>
                      </div>
                      {getConfidenceBadge(metric.confidence)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DynamicInsights;
