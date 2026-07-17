// SubscriptionsView 
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/axios'; 

const SubscriptionsView = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL'); 
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; 

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      
      const queryParams = {
        page: page,
        limit: limit,
      };
      
      if (search.trim()) queryParams.search = search.trim();
      if (status !== 'ALL') queryParams.status = status.toLowerCase();

      const response = await api.get('/subscriptions', {
        params: queryParams
      });

      const { items, total_pages } = response.data;
      
      setSubscriptions(items);
      setTotalPages(total_pages);
    } catch (error) {
      console.error('Error fetching subscriptions:', error?.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-black tracking-tight uppercase">Subscriptions Log</h1>
        <p className="text-sm text-zinc-400 mt-1">Audit log of current contractual agreements, processing dates, and status.</p>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900 p-4 rounded-xl border border-white/5">
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-sm rounded-lg border border-white/10 px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Filter by status */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 whitespace-nowrap">Status:</span>
          <select
            value={status}
            onChange={handleStatusChange}
            className="bg-zinc-950 text-white text-sm rounded-lg border border-white/10 px-3 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Subscriptions</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 text-xs font-bold uppercase tracking-wider">
              <th className="pb-3">Member Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Selected Plan</th>
              <th className="pb-3">Start Date</th>
              <th className="pb-3">End Date</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-zinc-500 animate-pulse font-medium">
                  Loading subscriptions database...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-zinc-500 font-medium">
                  No matching subscription records found.
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 font-semibold text-white">{sub.member_name}</td>
                  <td className="py-4 text-zinc-400">{sub.email}</td>
                  <td className="py-4 text-cyan-400 font-medium">{sub.plan_name}</td>
                  <td className="py-4 text-zinc-500">{sub.start_date}</td>
                  <td className="py-4 text-zinc-500">{sub.end_date}</td>
                  <td className="py-4 text-right">
                    {sub.status.toLowerCase() === 'active' ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
            <span className="text-xs text-zinc-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-950 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-950 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsView;