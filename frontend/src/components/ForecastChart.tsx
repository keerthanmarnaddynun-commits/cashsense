import React from 'react';
import { AreaChart, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatINR } from './MetricCard';

interface ForecastChartProps {
  currentCash: number;
  forecastPosition: number;
  isLoading: boolean;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  currentCash = 520000,
  forecastPosition = 605000,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="glow-card bg-charcoal-card rounded-[24px] p-6 space-y-4 animate-pulse border border-charcoal-border">
        <div className="h-5 bg-gray-800 rounded w-1/4"></div>
        <div className="h-40 bg-gray-800 rounded w-full"></div>
      </div>
    );
  }

  // Data points
  // 1: Current Cash (520k)
  // 2: Mid-month collections (580k)
  // 3: Projected shortage dip around Aug 18 (405k - risk event!)
  // 4: Net Forecast Position (605k)
  const points = [
    { label: 'Aug 4', cash: currentCash, x: 50, y: 130 },
    { label: 'Aug 11', cash: 580000, x: 180, y: 95 },
    { label: 'Aug 18 (Shortfall Dip)', cash: 405000, x: 310, y: 170, isRisk: true },
    { label: 'Aug 25', cash: forecastPosition, x: 440, y: 70 },
  ];

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 220;

  // Build path strings
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - 40} L ${points[0].x} ${svgHeight - 40} Z`;

  return (
    <div className="glow-card bg-charcoal-card rounded-[24px] p-6 border border-charcoal-border relative overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <AreaChart className="h-5 w-5 text-indigo-400" />
            30-Day Liquidity Forecast
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Stochastic projections including pending invoices and risk adjustments.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Projected Cash
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            Risk Shortfall
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[40, 90, 140, 180].map((y, idx) => (
            <line
              key={idx}
              x1="30"
              y1={y}
              x2="470"
              y2={y}
              className="stroke-gray-800/40"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} className="fill-[url(#areaGrad)]" />

          {/* Glowing Stroke line */}
          <path
            d={linePath}
            fill="none"
            className="stroke-[url(#lineGrad)]"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dip indicators & connection dots */}
          {points.map((p, idx) => (
            <g key={idx} className="cursor-pointer group">
              <circle
                cx={p.x}
                cy={p.y}
                r={p.isRisk ? '6' : '4'}
                className={`${
                  p.isRisk
                    ? 'fill-rose-500 stroke-rose-500/30 stroke-[8px] animate-pulse'
                    : 'fill-indigo-400 stroke-charcoal-card stroke-2'
                }`}
              />
              
              {/* Highlight dot hover ring */}
              <circle
                cx={p.x}
                cy={p.y}
                r="10"
                className="fill-white/0 hover:fill-white/5 transition-colors"
              />

              {/* Text label on nodes */}
              <text
                x={p.x}
                y={p.y - 14}
                textAnchor="middle"
                className={`text-[9px] font-extrabold ${p.isRisk ? 'fill-rose-300' : 'fill-gray-300'}`}
              >
                {formatINR(p.cash)}
              </text>
            </g>
          ))}

          {/* Bottom axis X labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={svgHeight - 15}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-gray-500 uppercase tracking-wider"
            >
              {p.label.split(' ')[0]} {p.label.split(' ')[1] ? p.label.split(' ')[1] : ''}
            </text>
          ))}
        </svg>

        {/* Floating warning badge above chart */}
        <div className="absolute top-[110px] left-[55%] -translate-x-1/2 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none">
          <AlertTriangle className="h-3 w-3 text-rose-400" />
          <span className="text-[10px] font-bold text-rose-300">
            Aug 18 Payroll Risk
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.03]">
        <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
        <p className="text-[11px] text-gray-400 leading-normal">
          AI analysis suggests a <span className="font-semibold text-emerald-400">+12% liquidity recovery</span> by week 4 if high-risk receivables are collected early.
        </p>
      </div>

    </div>
  );
};
