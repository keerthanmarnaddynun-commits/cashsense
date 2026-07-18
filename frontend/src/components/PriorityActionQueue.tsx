import React from 'react';
import { ArrowUpRight, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface ActionItem {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  impact: string;
  details: string;
  query: string;
}

interface PriorityActionQueueProps {
  onTriggerChat: (query: string) => void;
  isLoading: boolean;
}

export const PriorityActionQueue: React.FC<PriorityActionQueueProps> = ({
  onTriggerChat,
  isLoading,
}) => {
  const actions: ActionItem[] = [
    {
      id: 'act-1',
      priority: 'High',
      action: 'Call Shiva Logistics — Recover ₹3.1L',
      impact: 'Reduces risk of payroll shortage',
      details: 'INV-2026-003 is overdue. History shows user response increases by 45% on follow-up.',
      query: 'Draft a strict collection email for Shiva Logistics invoice INV-2026-003.',
    },
    {
      id: 'act-2',
      priority: 'Medium',
      action: 'Delay vendor payment — Preserve ₹80k',
      impact: 'Improves minimum cash threshold',
      details: 'Apex Media invoice is due Aug 15. Grace period allows payment delay of up to 10 days.',
      query: 'What is the cash impact of delaying the Apex Media invoice payment by 10 days?',
    },
    {
      id: 'act-3',
      priority: 'Low',
      action: 'Review inventory purchase',
      impact: 'Saves potential cash outflow',
      details: 'Q3 buffer inventory order is scheduled for Aug 20. Advise reduction in non-moving parts.',
      query: 'Analyze how a 20% cut in our upcoming Q3 inventory purchase affects our forecast position.',
    },
  ];

  const getPriorityColors = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return {
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/20',
          glow: 'group-hover:border-rose-500/35',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/20',
          glow: 'group-hover:border-amber-500/35',
        };
      case 'Low':
        return {
          bg: 'bg-indigo-500/10',
          text: 'text-indigo-400',
          border: 'border-indigo-500/20',
          glow: 'group-hover:border-indigo-500/35',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="glow-card bg-charcoal-card rounded-[24px] p-6 space-y-4 animate-pulse border border-charcoal-border">
        <div className="h-5 bg-gray-800 rounded w-1/4"></div>
        <div className="h-12 bg-gray-800 rounded w-full"></div>
        <div className="h-12 bg-gray-800 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="glow-card bg-charcoal-card rounded-[24px] p-6 border border-charcoal-border relative overflow-hidden transition-all duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400" />
            Priority Action Queue
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Prescriptive liquidity adjustments recommended by CashSense Copilot.
          </p>
        </div>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
          <Sparkles className="h-3 w-3 animate-pulse" /> 3 Recommendations
        </span>
      </div>

      {/* Action cards stack */}
      <div className="space-y-4">
        {actions.map((item) => {
          const colors = getPriorityColors(item.priority);
          return (
            <div
              key={item.id}
              className={`group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-charcoal-dark/50 border border-charcoal-border rounded-[20px] hover:bg-charcoal-dark hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                {/* Priority Badge */}
                <span className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border h-7 ${colors.bg} ${colors.text} ${colors.border}`}>
                  {item.priority}
                </span>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {item.action}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px]">
                    <span className="text-emerald-400 font-semibold">{item.impact}</span>
                    <span className="text-gray-600 font-bold">•</span>
                    <span className="text-gray-400">{item.details}</span>
                  </div>
                </div>
              </div>

              {/* Chat trigger */}
              <button
                onClick={() => onTriggerChat(item.query)}
                className={`px-3 py-2 bg-charcoal-card hover:bg-indigo-600/10 border border-charcoal-border group-hover:border-indigo-500/20 rounded-xl text-[11px] font-bold text-gray-300 hover:text-indigo-400 transition-all cursor-pointer flex items-center gap-1.5 self-start md:self-auto`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Ask Gemma</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
