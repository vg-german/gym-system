// DashboardView 
import React, { useEffect, useState } from 'react';
import api from '../../services/axios';

const DashboardView = () => {
  const [stats, setStats] = useState({
    total_members: '--',
    active_subscribers: '--',
    today_checkins: '--'
  });
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const pageSize = 5; 

  const fetchDashboardData = async (currentPage, isPolling = false) => {
    if (!isPolling) {
      setLoading(true);
      setAccessLogs([]); 
    }
    
    try {

      const [statsResponse, logsResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/dashboard/access-logs?page=${currentPage}&size=${pageSize}`)
      ]);

      const statsData = statsResponse.data;
      const logsData = logsResponse.data;

      setStats({
        total_members: statsData.total_members,
        active_subscribers: statsData.active_subscribers,
        today_checkins: statsData.today_checkins
      });
      
      setAccessLogs(logsData); 
      setError(null);
    } catch (err) {
      console.error("API Connection Error:", err);
      const errorMsg = err.response?.data?.detail || "Connection lost with backend. Retrying...";
      setError(errorMsg);
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(page, false);

    let interval = null;
    if (page === 1) {
      interval = setInterval(() => {
        fetchDashboardData(1, true);
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [page]); 

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Dashboard Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time status of the gym network.</p>
        </div>
        
        <div className="text-xs uppercase tracking-wider font-bold flex items-center space-x-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
          {error ? (
            <>
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-rose-400">{error}</span>
            </>
          ) : page === 1 ? (
            <>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-zinc-400">Live Syncing</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-amber-400">Viewing History (Paused)</span>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Members</p>
          <p className="text-3xl font-black mt-2 text-cyan-400">{stats.total_members}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Subscribers</p>
          <p className="text-3xl font-black mt-2 text-cyan-400">{stats.active_subscribers}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today's Check-ins</p>
          <p className="text-3xl font-black mt-2 text-emerald-400">{stats.today_checkins}</p>
        </div>
      </div>

      {/* Real-time Access Logs Table */}
      <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center space-x-2">
          <span>Real-Time Access Logs</span>
        </h2>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">Member Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Time</th>
                <th className="pb-3 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {accessLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-zinc-500 font-medium">
                    {loading ? 'Loading records...' : 'No access logs found in this section.'}
                  </td>
                </tr>
              ) : (
                accessLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 font-semibold text-white">{log.name}</td>
                    <td className="py-4 text-zinc-400">{log.email}</td>
                    <td className="py-4 text-zinc-400">{log.time}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                        log.status === 'Granted' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Page Controls */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-wider">
          <span>Page {page}</span>
          <div className="space-x-2">
            <button 
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
            >
              ← Newer
            </button>
            <button 
              onClick={() => setPage((old) => old + 1)}
              disabled={accessLogs.length < pageSize} 
              className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
            >
              Older →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;