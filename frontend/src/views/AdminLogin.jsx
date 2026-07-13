import React, { useState } from 'react';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://ixmuysoswtnasnvnkzbk.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bXV5c29zd3RuYXNudm5remJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjQ5MzcsImV4cCI6MjA5ODUwMDkzN30.XN-T62pW5JGIxRIw6lJSDYWXpY-sfn-PQ__HwrYtZ54' 
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.message || 'Invalid credentials');
      }

      localStorage.setItem('admin_token', data.access_token);
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-white/10">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-wider text-white uppercase">
            Gym-System
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            Sign in to manage the system
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="admin@gym.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;