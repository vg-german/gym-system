import React, {  useState } from 'react';

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
              <th className="pb-3">Suscription Status</th>
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

export default MembersView;