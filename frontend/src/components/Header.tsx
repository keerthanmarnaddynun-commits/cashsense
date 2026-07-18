import React from 'react';
import { Sparkles, Activity } from 'lucide-react';

interface HeaderProps {
  connectionStatus: 'connected' | 'connecting' | 'error';
}

export const Header: React.FC<HeaderProps> = ({ connectionStatus }) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 px-8 bg-charcoal-dark border-b border-charcoal-border sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white m-0 leading-none">
            CashSense
          </h1>
          <p className="text-xs text-indigo-400 font-medium mt-1 uppercase tracking-wider">
            AI Liquidity Copilot
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 sm:mt-0 px-3 py-1.5 bg-charcoal-card/40 border border-charcoal-border rounded-full text-xs font-medium">
        <span className="relative flex h-2 w-2">
          {connectionStatus === 'connected' && (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          )}
          {connectionStatus === 'connecting' && (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </>
          )}
        </span>
        
        <span className="text-gray-400 flex items-center gap-1.5">
          <Activity className="h-3 w-3" />
          {connectionStatus === 'connected' && 'API Connected'}
          {connectionStatus === 'connecting' && 'Connecting to API...'}
          {connectionStatus === 'error' && 'API Disconnected'}
        </span>
      </div>
    </header>
  );
};
