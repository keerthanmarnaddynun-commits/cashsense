import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  ShieldAlert, 
  Sliders, 
  Bot, 
  Settings, 
  LogOut,
  Sparkles,
  Briefcase
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Forecast', path: '/forecast', icon: TrendingUp },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Workspaces', path: '/batches', icon: Briefcase },
    { name: 'Actions', path: '/actions', icon: ShieldAlert },
    { name: 'Scenario Lab', path: '/scenario-lab', icon: Sliders },
    { name: 'AI Copilot', path: '/copilot', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#121626] border-r border-white/5 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      
      {/* Brand logo header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="p-2 bg-indigo-600/15 border border-indigo-500/20 rounded-xl text-indigo-400">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white m-0 leading-none">
            CashSense
          </h1>
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mt-1">
            Copilot OS
          </span>
        </div>
      </div>

      {/* Nav Menu items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile Summary + Logout */}
      <div className="p-4 border-t border-white/5 bg-[#171c30]/40">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-snug">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-gray-500 truncate leading-none mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};
