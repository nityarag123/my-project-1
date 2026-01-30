
import React from 'react';
import { ICONS, COLORS } from '../constants';
import { User, UserRole } from '../types';
import AIChatbot from './AIChatbot';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onNavigate: (view: any) => void;
  currentView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentView }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass border-r border-white/10 flex flex-col z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
            INFRAPULSE 360
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold tracking-tighter">ADVANCED ENGINEERING HUB</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => onNavigate('FLEET_DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'FLEET_DASHBOARD' ? 'bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white' : 'hover:bg-white/5'
            }`}
          >
            <ICONS.Analytics size={20} />
            <span className="font-medium">Fleet Pulse</span>
          </button>

          <button 
            onClick={() => onNavigate('SITES')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'SITES' ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' : 'hover:bg-white/5'
            }`}
          >
            <ICONS.Dashboard size={20} />
            <span className="font-medium">Active Sites</span>
          </button>
          
          <div className="mt-8 px-4 py-2">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Command Session</p>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <ICONS.User size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.username}</p>
                <p className="text-[10px] text-blue-400 font-bold uppercase">{user.role}</p>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-400"
          >
            <ICONS.Logout size={20} />
            <span className="font-medium">Logout System</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900 to-slate-900 relative">
        <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-32">
          {children}
        </div>
        
        {/* Floating AI Chatbot */}
        <AIChatbot user={user} />
      </main>
    </div>
  );
};

export default Layout;
