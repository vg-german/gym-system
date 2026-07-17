import React, { useState, useEffect } from 'react';
import api from '../../services/axios';

const MembershipsView = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // STATUS MODAL FORM CREATE UPDATE
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); 
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    contract_period: '1'
  });

  // STATUS MODAL CONFIRMATION PAUSE/ACTIVATE
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState(null);

  // STATUS MODAL DELETE CONFIRMATION
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // GET MEMBERSHIPS
  const fetchMemberships = async () => {
    setLoading(true);
    try {
      const response = await api.get('/memberships');
      setMemberships(response.data);
    } catch (err) {
      setError("Failed to load membership plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  // OPEN MODAL CREATE
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({ name: '', description: '', price: '', contract_period: '1' });
    setIsFormModalOpen(true);
  };

  // OPEN MODAL UPDATE
  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      contract_period: plan.contract_period.toString()
    });
    setIsFormModalOpen(true);
  };

  // SEND FORM
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        contract_period: parseInt(formData.contract_period, 10)
      };

      if (editingPlan) {
        await api.put(`/memberships/${editingPlan.id}`, payload);
      } else {
        await api.post('/memberships', { ...payload, status: 'active' });
      }

      setIsFormModalOpen(false);
      fetchMemberships(); 
    } catch (err) {
      alert("Error saving membership plan. Check backend validation.");
    }
  };

  const handleOpenStatusModal = (plan) => {
    setTargetPlan(plan);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!targetPlan) return;
    try {
      const nextStatus = targetPlan.status.toLowerCase() === 'active' ? 'paused' : 'active';
      await api.patch(`/memberships/${targetPlan.id}/status`, { status: nextStatus });
      
      setIsStatusModalOpen(false);
      fetchMemberships();
    } catch (err) {
      alert("Error changing membership status.");
    }
  };

  const handleOpenDeleteModal = (plan) => {
    setDeletingPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingPlan(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    setDeleteError(null);
    try {
      await api.delete(`/memberships/${deletingPlan.id}`);
      
      setIsDeleteModalOpen(false);
      setDeletingPlan(null);
      fetchMemberships(); 
    } catch (err) {
      
      const errorMsg = err.response?.data?.detail || "Cannot delete membership plan. It may be linked to active subscriptions.";
      setDeleteError(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase">Membership Plans</h1>
          <p className="text-sm text-zinc-400 mt-1">Configure commercial offers, core pricing, and plan rules.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-colors shadow-lg self-start md:self-auto"
        >
          + New Plan
        </button>
      </div>

      
      {loading ? (
        <div className="text-center py-12 text-zinc-500 font-bold text-xs uppercase tracking-widest animate-pulse">
          Loading pricing matrix...
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center text-sm text-rose-400">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {memberships.map((plan) => {
            const isPaused = plan.status?.toLowerCase() === 'paused';
            return (
              <div 
                key={plan.id} 
                className={`bg-zinc-900 rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all ${
                  isPaused ? 'border-white/5 opacity-50' : 'border-white/5 hover:border-cyan-500/30 shadow-xl'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-black uppercase text-white tracking-wide truncate max-w-[70%]">{plan.name}</h3>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30 whitespace-nowrap">
                      {plan.contract_period} {plan.contract_period === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-2 font-medium line-clamp-3">{plan.description || "No description provided."}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-2xl font-black text-white">${Number(plan.price).toFixed(2)}</span>
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleOpenEdit(plan)}
                      className="text-xs uppercase font-bold text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleOpenStatusModal(plan)}
                      className={`text-xs uppercase font-bold px-2 py-1 bg-zinc-800/50 rounded transition-colors ${
                        isPaused ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      {isPaused ? 'Activate' : 'Pause'}
                    </button>
                    
                    
                      {isPaused && (
                        <button 
                          onClick={() => handleOpenDeleteModal(plan)}
                          className="text-xs uppercase font-bold text-rose-500 hover:text-rose-400 px-2 py-1 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CREATE / UPDATE */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-wide text-white">
                {editingPlan ? 'Edit Membership Plan' : 'Create New Plan'}
              </h2>
              <button 
                onClick={() => setIsFormModalOpen(false)} 
                className="text-zinc-500 hover:text-white transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Plan Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., VIP Plan"
                  className="w-full bg-zinc-950 text-white text-sm rounded-xl border border-white/10 px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Description</label>
                <textarea 
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your membership"
                  className="w-full bg-zinc-950 text-white text-sm rounded-xl border border-white/10 px-4 py-2.5 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="49.99"
                    className="w-full bg-zinc-950 text-white text-sm rounded-xl border border-white/10 px-4 py-2.5 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Period (Months)</label>
                  <select 
                    value={formData.contract_period}
                    onChange={(e) => setFormData({...formData, contract_period: e.target.value})}
                    className="w-full bg-zinc-950 text-white text-sm rounded-xl border border-white/10 px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="1">1 Month</option>
                    <option value="4">4 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase font-bold text-zinc-400 hover:text-white bg-zinc-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs uppercase font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-lg"
                >
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PAUSE / ACTIVATE */}
      {isStatusModalOpen && targetPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <h2 className="text-lg font-black uppercase tracking-wide text-white">
              {targetPlan.status.toLowerCase() === 'active' ? 'Pause Plan?' : 'Activate Plan?'}
            </h2>
            <p className="text-sm text-zinc-400">
              Are you sure you want to change the status of <span className="text-white font-bold">{targetPlan.name}</span> to{' '}
              <span className={targetPlan.status.toLowerCase() === 'active' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {targetPlan.status.toLowerCase() === 'active' ? 'PAUSED' : 'ACTIVE'}
              </span>?
            </p>
            
            <div className="pt-2 flex justify-center gap-3">
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs uppercase font-bold text-zinc-400 hover:text-white bg-zinc-800 rounded-xl transition-colors"
              >
                No, Cancel
              </button>
              <button 
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-2 text-xs uppercase font-bold text-white rounded-xl transition-colors shadow-lg ${
                  targetPlan.status.toLowerCase() === 'active' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE*/}
      {isDeleteModalOpen && deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`bg-zinc-900 border rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl transition-all duration-300 ${
            deleteError ? 'border-amber-500/20 shadow-amber-950/5' : 'border-rose-500/20 shadow-rose-950/5'
          }`}>
            
            {deleteError ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 text-xl font-bold animate-bounce">
                  !
                </div>
                
                <h2 className="text-lg font-black uppercase tracking-wide text-amber-400">
                  Action Restricted
                </h2>
                
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {deleteError}
                </p>

                <div className="bg-zinc-950/70 rounded-xl p-3 text-left border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Recommended Protocol:</span>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Instead of deleting, keep this plan <span className="text-amber-400 font-semibold">PAUSED</span>. This preserves data integrity for members currently using it while blocking new sales.
                  </p>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={handleCloseDeleteModal}
                    className="w-full py-2.5 text-xs uppercase font-bold text-black bg-amber-500 hover:bg-amber-400 rounded-xl transition-colors shadow-lg shadow-amber-950/30"
                  >
                    Acknowledge & Close
                  </button>
                </div>
              </div>
            ) : (
              
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500 text-xl font-bold">
                  !
                </div>
                
                <h2 className="text-lg font-black uppercase tracking-wide text-white">
                  Delete Membership Plan?
                </h2>
                
                <p className="text-sm text-zinc-400">
                  You are about to permanently remove <span className="text-white font-bold">{deletingPlan.name}</span>. This action cannot be undone.
                </p>

                <div className="bg-zinc-950/50 rounded-xl p-3 text-xs text-zinc-500 text-left border border-white/5">
                  <span className="font-bold text-zinc-400">Data Integrity Guard:</span> Database relations will enforce protection if active customer contracts rely on this pricing structure.
                </div>
                
                <div className="pt-2 flex justify-center gap-3">
                  <button 
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 text-xs uppercase font-bold text-zinc-400 hover:text-white bg-zinc-800 rounded-xl transition-colors"
                  >
                    No, Keep It
                  </button>
                  <button 
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-xs uppercase font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-lg shadow-rose-950/50"
                  >
                    Yes, Delete Plan
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipsView;