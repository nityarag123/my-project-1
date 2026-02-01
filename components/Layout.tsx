
import React from 'react';
import { ICONS } from '../constants';
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
  const isCustomer = user.role === UserRole.CUSTOMER;
  const isOperator = user.role === UserRole.OPERATOR;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 glass border-r border-white/10 flex flex-col z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-wider">
            INFRAPULSE 360
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold tracking-tighter">ENTERPRISE COMMAND</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {isCustomer ? (
            <button 
              onClick={() => onNavigate('CUSTOMER_HOME')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'CUSTOMER_HOME' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'
              }`}
            >
              <ICONS.Dashboard size={20} />
              <span className="font-medium">Command Hub</span>
            </button>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('FLEET_DASHBOARD')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === 'FLEET_DASHBOARD' ? 'bg-emerald-600 text-white' : 'hover:bg-white/5'
                }`}
              >
                <ICONS.Analytics size={20} />
                <span className="font-medium">Fleet Pulse</span>
              </button>

              {isOperator && (
                <button 
                  onClick={() => onNavigate('BOOKING_DISPATCH')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentView === 'BOOKING_DISPATCH' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'
                  }`}
                >
                  <ICONS.Logs size={20} />
                  <span className="font-medium">Dispatch Desk</span>
                </button>
              )}

              <button 
                onClick={() => onNavigate('VEHICLE_MGMT')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === 'VEHICLE_MGMT' ? 'bg-indigo-600 text-white' : 'hover:bg-white/5'
                }`}
              >
                <ICONS.Truck size={20} />
                <span className="font-medium">Fleet Catalog</span>
              </button>

              <button 
                onClick={() => onNavigate('SITES')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === 'SITES' ? 'bg-blue-600 text-white' : 'hover:bg-white/5'
                }`}
              >
                <ICONS.Dashboard size={20} />
                <span className="font-medium">Site Map</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-400"
          >
            <ICONS.Logout size={20} />
            <span className="font-medium">Exit Hub</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900 to-slate-900 relative">
        <div className="max-w-7xl mx-auto p-6 lg:p-10 pb-32">
          {children}
        </div>
        <AIChatbot user={user} />
      </main>
    </div>
  );
};

export default Layout;
