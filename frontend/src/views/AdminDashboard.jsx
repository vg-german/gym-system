import React, { useState } from 'react';

// ==========================================
// 1. SUB-COMPONENTE: VISTA DASHBOARD
// ==========================================
const DashboardView = () => {
  // Simulación de logs de acceso en tiempo real (reemplazar con WebSocket o Polling después)
  const [accessLogs] = useState([
    { id: 1, name: 'John Doe', time: '14:32:10', status: 'Granted' },
    { id: 2, name: 'Unknown User', time: '14:28:45', status: 'Denied' },
    { id: 3, name: 'Jane Smith', time: '14:15:22', status: 'Granted' },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Dashboard Overview</h1>
        <p className="text-sm text-zinc-400 mt-1">Real-time status of the gym network.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Members</p>
          <p className="text-3xl font-black mt-2 text-cyan-400">--</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Subscribers</p>
          <p className="text-3xl font-black mt-2 text-cyan-400">--</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today's Check-ins</p>
          <p className="text-3xl font-black mt-2 text-emerald-400">--</p>
        </div>
      </div>

      {/* Real-time Access Logs Table */}
      <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span>Real-Time Access Logs</span>
        </h2>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">Member Name</th>
                <th className="pb-3">Time</th>
                <th className="pb-3 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {accessLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 font-semibold text-white">{log.name}</td>
                  <td className="py-4 text-zinc-400">{log.time}</td>
                  <td className="py-4 text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                      log.status === 'Granted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. SUB-COMPONENTE: VISTA MEMBERS
// ==========================================
const MembersView = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Members Directory</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage client profiles, credentials, and Face ID enrollment.</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors shadow-lg self-start md:self-auto">
          + Add New Member
        </button>
      </div>

      {/* Buscador */}
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Members Table */}
      <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
              <th className="pb-3">Photo</th>
              <th className="pb-3">Full Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Enrollment</th>
              <th className="pb-3">Face ID Status</th>
              <th className="pb-3">Suscription</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
            {/* Registro de Ejemplo */}
            <tr className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-400 border border-white/10">👤</div>
              </td>
              <td className="py-4 font-semibold text-white">Carlos Mendoza</td>
              <td className="py-4 text-zinc-400">carlos@example.com</td>
              <td className="py-4 text-zinc-400">2026-03-15</td>
              <td className="py-4">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">Captured</span>
              </td>
              <td className="py-4">
                <span className="text-emerald-400 font-bold">● Active</span>
              </td>
              <td className="py-4 text-right space-x-2 whitespace-nowrap">
                <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-300">Edit</button>
                <button className="p-1.5 bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-400 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-300">📷 Scan Face</button>
                <button className="p-1.5 bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-400 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-300"> Renew Subscription</button>
                <button className="p-1.5 bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-400">Drop</button>
              </td>
            </tr>
            {/* Registro con Face ID pendiente */}
            <tr className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-400 border border-white/10">👤</div>
              </td>
              <td className="py-4 font-semibold text-white">Ana Gómez</td>
              <td className="py-4 text-zinc-400">ana.g@example.com</td>
              <td className="py-4 text-zinc-400">2026-07-10</td>
              <td className="py-4">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/10 animate-pulse">Pending</span>
              </td>
              <td className="py-4">
                <span className="text-emerald-400 font-bold">● Active</span>
              </td>
              <td className="py-4 text-right space-x-2 whitespace-nowrap">
                <button className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-300">Edit</button>
                <button className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-bold uppercase transition-colors text-white">📷 Scan Face</button>
                <button className="p-1.5 bg-zinc-800 hover:bg-cyan-950 hover:text-cyan-400 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-300"> Renew Subscription</button>
                <button className="p-1.5 bg-zinc-800 hover:bg-rose-950 hover:text-rose-400 rounded-lg text-xs font-bold uppercase transition-colors text-zinc-400">Drop</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Placeholder Paginación */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
          <span>Showing 1-2 of 2 members</span>
          <div className="space-x-2">
            <button className="px-3 py-1 bg-zinc-800 rounded-md disabled:opacity-30" disabled>Prev</button>
            <button className="px-3 py-1 bg-zinc-800 rounded-md disabled:opacity-30" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. SUB-COMPONENTE: VISTA MEMBERSHIPS
// ==========================================
const MembershipsView = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Membership Plans</h1>
          <p className="text-sm text-zinc-400 mt-1">Configure commercial offers, core pricing, and plan rules.</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors shadow-lg self-start md:self-auto">
          + New Plan
        </button>
      </div>

      {/* Grid de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Ficticio 1 */}
        <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-black uppercase text-white tracking-wide">Monthly Pass</h3>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30">30 Days</span>
            </div>
            <p className="text-zinc-400 text-sm mt-2 font-medium">Standard full-access pass to the gym floor and weight areas.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-2xl font-black text-white">$45.00</span>
            <div className="space-x-2">
              <button className="text-xs uppercase font-bold text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded transition-colors">Edit</button>
              <button className="text-xs uppercase font-bold text-rose-400 hover:text-rose-300 px-2 py-1 bg-zinc-800/50 rounded transition-colors">Pause</button>
            </div>
          </div>
        </div>

        {/* Plan Ficticio 2 */}
        <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 flex flex-col justify-between space-y-4 border-cyan-500/20 shadow-xl shadow-cyan-950/10">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-black uppercase text-white tracking-wide">Black Year Plan</h3>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/30">365 Days</span>
            </div>
            <p className="text-zinc-400 text-sm mt-2 font-medium">Annual membership. Includes locker access, guest pass benefits, and premium services.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-2xl font-black text-white">$399.00</span>
            <div className="space-x-2">
              <button className="text-xs uppercase font-bold text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded transition-colors">Edit</button>
              <button className="text-xs uppercase font-bold text-rose-400 hover:text-rose-300 px-2 py-1 bg-zinc-800/50 rounded transition-colors">Pause</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. SUB-COMPONENTE: VISTA SUBSCRIPTIONS
// ==========================================
const SubscriptionsView = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Subscriptions Ledger</h1>
        <p className="text-sm text-zinc-400 mt-1">Audit log of current contractual agreements, processing dates, and payments.</p>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
              <th className="pb-3">Member Name</th>
              <th className="pb-3">Selected Plan</th>
              <th className="pb-3">Start Date</th>
              <th className="pb-3">End Date</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
            {/* Ejemplo 1 */}
            <tr className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-4 font-semibold text-white">Carlos Mendoza</td>
              <td className="py-4 text-cyan-400 font-medium">Monthly Pass</td>
              <td className="py-4 text-zinc-400">2026-07-01</td>
              <td className="py-4 text-zinc-400">2026-07-31</td>
              <td className="py-4 text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Active</span>
              </td>
            </tr>
            {/* Ejemplo 2 */}
            <tr className="hover:bg-zinc-800/30 transition-colors">
              <td className="py-4 font-semibold text-white">Ana Gómez</td>
              <td className="py-4 text-amber-400 font-medium">Black Year Plan</td>
              <td className="py-4 text-zinc-400">2026-07-13</td>
              <td className="py-4 text-zinc-400">2027-07-13</td>
              <td className="py-4 text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider animate-pulse">Inactive</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL: ADMIN DASHBOARD
// ==========================================
const AdminDashboard = ({ onLogout }) => {
  // Manejador del Tab Activo ('dashboard', 'members', 'memberships', 'subscriptions')
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleLogoutAction = () => {
    localStorage.removeItem('admin_token');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      
      {/* Top bar */}
      <header className="h-16 w-full bg-zinc-900 border-b border-white/5 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          <span className="font-black tracking-widest text-lg uppercase">Gym-System</span>
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

      {/* Main Container */}
      <div className="flex flex-1 min-h-0">
        
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-900 border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-4">Menu</p>
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                activeTab === 'members' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>👥</span>
              <span>Members</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('memberships')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                activeTab === 'memberships' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>💳</span>
              <span>Memberships</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                activeTab === 'subscriptions' ? 'bg-cyan-950 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span>📋</span>
              <span>Subscriptions</span>
            </button>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 text-center">
            <p className="text-xs text-zinc-500 font-medium">System v1.0.0</p>
          </div>
        </aside>

        {/* Central Space */}
        <main className="flex-1 p-6 md:p-8 bg-zinc-950 overflow-y-auto">
          <div className="w-full">
            
            {/* Renderizado condicional basado en la pestaña activa */}
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