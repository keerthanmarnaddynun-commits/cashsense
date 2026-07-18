import React, { useEffect, useState } from 'react';
import { CalendarRange, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface CashRunwayGaugeProps {
  runwayDays: number; // e.g. 18
  isLoading: boolean;
}

export const CashRunwayGauge: React.FC<CashRunwayGaugeProps> = ({ runwayDays, isLoading }) => {
  const [animatedOffset, setAnimatedOffset] = useState(314.16);
  const maxRunway = 60;
  
  // Calculate percentage
  const percentage = Math.min(Math.max((runwayDays / maxRunway) * 100, 0), 100);
  
  // Circumference of circular gauge (r = 50)
  const circumference = 2 * Math.PI * 50;

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        const offset = circumference - (percentage / 100) * circumference;
        setAnimatedOffset(offset);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [percentage, isLoading, circumference]);

  const getGaugeColors = (days: number) => {
    if (days >= 30) {
      return {
        text: 'text-emerald-400',
        stroke: 'stroke-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        status: 'Safe runway level',
        icon: ShieldCheck,
      };
    } else if (days >= 15) {
      return {
        text: 'text-amber-400',
        stroke: 'stroke-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
        status: 'Moderate runway level',
        icon: AlertTriangle,
      };
    } else {
      return {
        text: 'text-rose-400',
        stroke: 'stroke-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
        status: 'Critical shortage warning',
        icon: ShieldAlert,
      };
    }
  };

  const colors = getGaugeColors(runwayDays);
  const StatusIcon = colors.icon;

  if (isLoading) {
    return (
      <div className="glow-card bg-charcoal-card rounded-[24px] p-6 flex flex-col items-center justify-center h-full animate-pulse border border-charcoal-border">
        <div className="w-32 h-32 rounded-full bg-gray-800" />
        <div className="h-6 bg-gray-800 rounded w-1/3 mt-4" />
        <div className="h-4 bg-gray-800 rounded w-1/2 mt-2" />
      </div>
    );
  }

  return (
    <div className={`glow-card bg-charcoal-card rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-charcoal-border transition-all duration-300 ${colors.glow}`}>
      
      {/* Circle Gauge on Left */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx="72"
            cy="72"
            r="50"
            className="stroke-gray-800 fill-none"
            strokeWidth="8"
          />
          {/* Foreground progress circle */}
          <circle
            cx="72"
            cy="72"
            r="50"
            className={`fill-none transition-all duration-1000 ease-out ${colors.stroke}`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Inside Text */}
        <div className="absolute text-center">
          <span className="text-3xl font-extrabold text-white block tracking-tight">
            {runwayDays}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-0.5">
            Days
          </span>
        </div>
      </div>

      {/* Runway Analytics Content */}
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            <StatusIcon className="h-3 w-3" />
            {colors.status}
          </span>
        </div>
        
        <h3 className="text-xl font-extrabold text-white mt-2 tracking-tight">
          Runway Shortage Gauge
        </h3>
        
        <p className="text-sm text-gray-300 mt-1 max-w-[280px] sm:max-w-none">
          Estimated cash runway is <span className={`font-semibold ${colors.text}`}>{runwayDays} Days</span> until projected cash shortage occurs.
        </p>

        <div className="h-[1px] bg-white/5 my-4" />

        <div className="flex items-center justify-center sm:justify-start gap-4 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Runway Threshold</span>
            <span className="text-white font-medium mt-0.5 block flex items-center gap-1">
              <CalendarRange className="h-3.5 w-3.5 text-indigo-400" />
              60 Days Max Target
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Status</span>
            <span className={`font-semibold mt-0.5 block ${colors.text}`}>
              {runwayDays >= 30 ? 'Runway Healthy' : runwayDays >= 15 ? 'Runway Warning' : 'Critical Shortfall Risk'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
