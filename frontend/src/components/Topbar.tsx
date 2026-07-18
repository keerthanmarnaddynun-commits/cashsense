import React, { useState } from 'react';
import { Bell, Activity, ShieldAlert, BadgeInfo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  connectionStatus: 'connected' | 'connecting' | 'error';
}

export const Topbar: React.FC<TopbarProps> = ({ connectionStatus }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const mockAlerts = [
    { id: 1, text: 'Invoice INV-2026-003 from Shiva Logistics is 33 days overdue.', type: 'critical' },
    { id: 2, text: 'Payroll shortfall threat detected for August 18 timeline.', type: 'warning' },
  ];

  return (
    <header className="h-16 border-b border-white/5 bg-[#121626]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 select-none">
      
      {/* Search placeholder or page context title */}
      <div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          SaaS Operating Frame
        </span>
      </div>

      {/* Utilities: status, notifications, profile */}
      <div className="flex items-center gap-6">
        
        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#191e36]/60 border border-white/5 rounded-full text-xs font-semibold">
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
          <span className="text-gray-400 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-gray-500" />
            {connectionStatus === 'connected' && 'API Connected'}
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'error' && 'API Disconnected'}
          </span>
        </div>

        {/* Notifications Alert Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-[#191e36]/40 hover:bg-[#191e36]/90 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer relative"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#181b25] border border-white/5 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Alert Center</span>
                <span className="text-[10px] text-gray-500">2 pending notifications</span>
              </div>
              <div className="space-y-2.5">
                {mockAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-xl flex gap-2.5 items-start text-xs leading-normal ${
                      alert.type === 'critical' ? 'bg-rose-500/5 text-rose-300 border border-rose-500/10' : 'bg-amber-500/5 text-amber-300 border border-amber-500/10'
                    }`}
                  >
                    {alert.type === 'critical' ? <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" /> : <BadgeInfo className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
                    <p>{alert.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simple Profile Indicator */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div className="h-8.5 w-8.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline-block">
              {user.firstName}
            </span>
          </div>
        )}

      </div>
    </header>
  );
};
