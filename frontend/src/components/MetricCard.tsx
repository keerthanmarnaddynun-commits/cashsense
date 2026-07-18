import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value?: number;
  isLoading: boolean;
  icon: LucideIcon;
  colorClass: string;
  accentClass: string;
}

export const formatINR = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  isLoading,
  icon: Icon,
  colorClass,
  accentClass,
}) => {
  if (isLoading || value === undefined) {
    return (
      <div className="glow-card bg-charcoal-card rounded-[22px] p-6 relative overflow-hidden transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="space-y-3 w-full">
            <div className="h-4 bg-gray-800 rounded-md w-1/2 animate-pulse"></div>
            <div className="h-8 bg-gray-800 rounded-md w-3/4 animate-pulse"></div>
          </div>
          <div className="p-3 bg-gray-800 rounded-xl w-12 h-12 animate-pulse"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-800"></div>
      </div>
    );
  }

  // Get trend details based on card type
  const getTrendDetails = (cardTitle: string) => {
    const normTitle = cardTitle.toLowerCase();
    if (normTitle.includes('cash')) {
      return {
        path: 'M 0,20 Q 15,5 30,12 T 60,2',
        stroke: '#10b981', // emerald
        percentage: '+12.4%',
        badgeColors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
    } else if (normTitle.includes('receivables')) {
      return {
        path: 'M 0,18 L 15,14 L 30,11 L 45,8 L 60,4',
        stroke: '#818cf8', // indigo
        percentage: '+4.1%',
        badgeColors: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      };
    } else if (normTitle.includes('expenses')) {
      return {
        path: 'M 0,12 L 60,12',
        stroke: '#94a3b8', // slate
        percentage: '0.0%',
        badgeColors: 'bg-gray-800 text-gray-400 border-white/5',
      };
    } else {
      // Forecast
      return {
        path: 'M 0,18 L 12,6 L 24,20 L 36,8 L 48,16 L 60,2',
        stroke: '#06b6d4', // cyan
        percentage: '+16.3%',
        badgeColors: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      };
    }
  };

  const trend = getTrendDetails(title);

  return (
    <div className="glow-card bg-charcoal-card rounded-[22px] p-6 relative overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-white mt-2 tracking-tight">
            {formatINR(value)}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${accentClass} border border-white/5 shrink-0`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </div>

      {/* Sparkline & Percentage Trend display */}
      <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${trend.badgeColors}`}>
            {trend.percentage}
          </span>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">MoM</span>
        </div>
        
        {/* SVG Sparkline */}
        <div className="shrink-0 flex items-center">
          <svg width="60" height="22" viewBox="0 0 60 22" className="overflow-visible">
            <path
              d={trend.path}
              fill="none"
              stroke={trend.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {/* Decorative bottom line indicating color theme */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${accentClass}`} />
    </div>
  );
};
