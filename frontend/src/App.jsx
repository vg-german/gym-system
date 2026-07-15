import React, { useState, useEffect } from 'react';
import AccessControl from './views/AccessControl';
import AdminLogin from './views/AdminLogin';
import AdminDashboard from './views/AdminDashboard';
import api from './services/axios';


function App() {
  // Views
  const [currentView, setCurrentView] = useState(null);

useEffect(() => {
    const checkAuthentication = async () => {
      const isPC = window.innerWidth >= 1024;
      const token = localStorage.getItem('admin_token');

      if (!token) {
        setCurrentView(isPC ? 'login' : 'access');
        return;
      }

      try {
        await api.get('/subscriptions?limit=1'); 
        
        setCurrentView(isPC ? 'dashboard' : 'access');
      } catch (error) {
        
        localStorage.removeItem('admin_token');
        setCurrentView(isPC ? 'login' : 'access');
      }
    };

    checkAuthentication();
  }, []);


  if (!currentView) {
    return <div className="bg-zinc-950 min-h-screen" />;
  }

  return (
    <div className="bg-zinc-950 min-h-screen selection:bg-cyan-500 selection:text-black">
      
      {/* Buttons*/}
      <div className="fixed bottom-4 right-4 z-50 bg-zinc-900/90 border border-white/10 p-2 rounded-xl shadow-2xl flex space-x-2 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
        <button 
          onClick={() => setCurrentView('access')} 
          className={`px-3 py-1.5 rounded-lg transition-colors ${currentView === 'access' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:bg-zinc-800'}`}
        >
          📷 Access
        </button>
        <button 
          onClick={() => setCurrentView('login')} 
          className={`px-3 py-1.5 rounded-lg transition-colors ${currentView === 'login' || currentView === 'dashboard' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:bg-zinc-800'}`}
        >
          🛠️ Admin
        </button>
      </div>

      {currentView === 'access' && <AccessControl />}
      
      {currentView === 'login' && (
        <AdminLogin onLoginSuccess={() => setCurrentView('dashboard')} />
      )}
      
      {currentView === 'dashboard' && (
        <AdminDashboard onLogout={() => setCurrentView('login')} />
      )}

    </div>
  );
}

export default App;