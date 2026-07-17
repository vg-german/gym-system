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