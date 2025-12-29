
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { UserRole, Site, User } from '../types';

interface RegisterPageProps {
  sites: Site[];
  onRegister: (userData: Omit<User, 'id'>) => void;
  onNavigateLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ sites, onRegister, onNavigateLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.OPERATOR,
    assignedSiteId: ''
  });
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === UserRole.OPERATOR && !formData.assignedSiteId) {
      setError('Please assign a site for the Operator role');
      return;
    }

    onRegister({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      assignedSiteId: formData.assignedSiteId || undefined
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="w-full max-w-xl z-10">
        <div className="glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Registration
              </h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Join KVR Infra Network</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 p-[1px]">
              <div className="w-full h-full rounded-[0.9rem] bg-slate-900 flex items-center justify-center text-blue-400">
                <ICONS.User size={30} />
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="john@kvrinfra.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Access Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-300"
              >
                <option value={UserRole.OPERATOR} className="bg-slate-900">Operator</option>
                <option value={UserRole.ADMIN} className="bg-slate-900">Admin</option>
              </select>
            </div>

            {formData.role === UserRole.OPERATOR && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Assign Site</label>
                <select 
                  value={formData.assignedSiteId}
                  onChange={(e) => setFormData({ ...formData, assignedSiteId: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-300"
                  required
                >
                  <option value="" className="bg-slate-900">Select a Site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id} className="bg-slate-900">{site.name}</option>
                  ))}
                </select>
              </div>
            )}

            {error && <p className="md:col-span-2 text-red-400 text-xs text-center font-semibold bg-red-500/10 py-2 rounded-lg">{error}</p>}

            <div className="md:col-span-2 space-y-4 pt-4">
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all"
              >
                Create Account
              </button>
              <button 
                type="button"
                onClick={onNavigateLogin}
                className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
