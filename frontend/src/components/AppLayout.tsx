import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  connectionStatus: 'connected' | 'connecting' | 'error';
}

export const AppLayout: React.FC<AppLayoutProps> = ({ connectionStatus }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B1020]">
      {/* Navigation Left Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Horizontal Header */}
        <Topbar connectionStatus={connectionStatus} />

        {/* Scrollable Layout Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#0B1020] p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};
