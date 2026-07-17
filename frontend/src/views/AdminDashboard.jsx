import React, { useEffect, useState } from 'react';

import DashboardView from './admin/DashboardView';
import MembersView from './admin/MembersView';
import SubscriptionsView from './admin/SubscriptionsView';
import MembershipsView from './admin/MembershipsView';

const AdminDashboard = ({ onLogout }) => {
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleLogoutAction = () => {
    localStorage.removeItem('admin_token');
    onLogout();
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'members':
        return <MembersView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'memberships':
        return <MembershipsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 text-white font-sans flex flex-col overflow-hidden">
      
      <header className="h-12 w-full bg-zinc-900 border-b border-white/5 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
          <span className="font-black tracking-widest text-base uppercase">Gym-System</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-zinc-400 font-medium hidden sm:inline">Administrator</span>
          <button 
            onClick={handleLogoutAction}
            className="bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 text-zinc-300 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg border border-white/5 transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        
        <aside className="w-36 h-full bg-zinc-900 border-r border-white/5 p-3 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-2">Menu</p>
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'members' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>👥</span>
              <span>Members</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('memberships')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'memberships' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>💳</span>
              <span>Memberships</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'subscriptions' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>📋</span>
              <span>Subscriptions</span>
            </button>
          </div>

          <div className="p-2 bg-zinc-950 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-zinc-500 font-medium">System v1.0.0</p>
          </div>
        </aside>

        <main className="flex-1 h-full p-6 md:p-8 bg-zinc-950 overflow-y-auto min-w-0">
          <div className="w-full">
            
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'members' && <MembersView />}
            {activeTab === 'memberships' && <MembershipsView />}
            {activeTab === 'subscriptions' && <SubscriptionsView />}

          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminDashboard;