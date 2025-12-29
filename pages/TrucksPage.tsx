
import React, { useState } from 'react';
import { Truck, Site, UserRole } from '../types';
import { ICONS } from '../constants';

interface TrucksPageProps {
  site: Site;
  trucks: Truck[];
  onSelectTruck: (truckId: string) => void;
  onBack: () => void;
  role: UserRole;
  onAddTruck: (truck: Omit<Truck, 'id'>) => void;
  onDeleteTruck: (id: string) => void;
}

const TrucksPage: React.FC<TrucksPageProps> = ({ site, trucks, onSelectTruck, onBack, role, onAddTruck, onDeleteTruck }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTruckNumber, setNewTruckNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTruck({ truckNumber: newTruckNumber, siteId: site.id });
    setNewTruckNumber('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl glass hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all border border-white/5 group"
          >
            <div className="group-hover:-translate-x-1 transition-transform">←</div>
          </button>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{site.name}</h2>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mt-1">
              <ICONS.Location size={14} />
              <span>{site.location}</span>
            </div>
          </div>
        </div>
        
        {role === UserRole.ADMIN && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 group"
          >
            <ICONS.Add size={20} className="group-hover:rotate-90 transition-transform" />
            <span>Register Truck</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trucks.map((truck) => (
          <div 
            key={truck.id} 
            className="glass p-6 rounded-[2rem] hover:bg-white/10 transition-all group border-b-4 border-b-transparent hover:border-b-blue-500 shadow-xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ICONS.Truck size={24} />
              </div>
              {role === UserRole.ADMIN && (
                <button 
                  onClick={() => onDeleteTruck(truck.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <ICONS.Delete size={16} />
                </button>
              )}
            </div>

            <h3 className="text-xl font-black tracking-tighter mb-6 uppercase text-slate-100 group-hover:text-blue-400 transition-colors">
              {truck.truckNumber}
            </h3>

            <button 
              onClick={() => onSelectTruck(truck.id)}
              className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-bold py-3 rounded-xl transition-all border border-blue-500/20"
            >
              Activity Logs
            </button>
          </div>
        ))}

        {trucks.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass rounded-[2rem] border-dashed border-white/10">
            <div className="text-slate-600 mb-4"><ICONS.Truck size={48} /></div>
            <p className="text-slate-400 font-medium">No trucks assigned to this site.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl scale-in-center">
            <h3 className="text-2xl font-bold mb-6">Register Truck</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Truck Number</label>
                <input 
                  type="text" 
                  value={newTruckNumber}
                  onChange={(e) => setNewTruckNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. AP 31 TV 1234"
                  required
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrucksPage;
