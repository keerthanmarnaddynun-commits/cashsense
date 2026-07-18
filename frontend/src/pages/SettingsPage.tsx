import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, CreditCard, Sparkles, LogOut, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Account Settings</h2>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">Manage profile configurations and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar inside settings */}
        <div className="space-y-2">
          {[
            { name: 'Profile Configuration', icon: User, active: true },
            { name: 'Security & Access', icon: Shield, active: false },
            { name: 'Plan & Billing', icon: CreditCard, active: false },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                disabled={!item.active}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  item.active 
                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="md:col-span-2 glow-card bg-[#181b25] border border-white/5 rounded-[24px] p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/[0.04]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Personal Information
            </h3>
            <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded">
              Active SaaS Member
            </span>
          </div>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs flex items-center gap-2 justify-center font-semibold">
              <Check className="h-4 w-4" />
              Settings updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.firstName || 'Karan'}
                  className="w-full bg-[#121626] border border-white/5 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.lastName || 'Sharma'}
                  className="w-full bg-[#121626] border border-white/5 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Email Address
              </label>
              <input
                type="email"
                readOnly
                defaultValue={user?.email || 'karan@example.com'}
                className="w-full bg-[#121626] border border-white/5 opacity-55 cursor-not-allowed rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
              <span className="text-[9px] text-gray-500 block mt-0.5 font-medium">
                Email cannot be modified. Contact support if changes are required.
              </span>
            </div>

            <div className="h-[1px] bg-white/[0.04] pt-2" />

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Save Changes
              </button>
              
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
