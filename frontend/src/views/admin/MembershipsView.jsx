import React, { useState } from 'react';


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


export default MembershipsView;