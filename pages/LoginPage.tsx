
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
  onNavigateRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="w-full max-w-md z-10">
        <div className="glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-10 -translate-y-10 group-hover:bg-white/10 transition-colors" />
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-emerald-500 p-[1px]">
              <div className="w-full h-full rounded-[1.4rem] bg-slate-900 flex items-center justify-center text-blue-400">
                <ICONS.Building size={40} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            KVR INFRA
          </h1>
          <p className="text-slate-500 text-center mb-10 text-sm font-medium uppercase tracking-[0.2em]">Management Portal</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username or Email</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transform active:scale-[0.98] transition-all"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={onNavigateRegister}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              New here? Register your account
            </button>
            <div className="pt-8 border-t border-white/5 flex justify-between items-center px-2">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">v2.5.0 Stable</span>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Secured Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
