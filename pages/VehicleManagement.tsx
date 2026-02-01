
import React, { useState } from 'react';
import { VehicleType, UserRole } from '../types';
import { ICONS } from '../constants';

interface VehicleManagementProps {
  vehicleTypes: VehicleType[];
  onUpdateTypes: (types: VehicleType[]) => void;
  role: UserRole;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ vehicleTypes, onUpdateTypes, role }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<VehicleType>>({});
  const isAdmin = role === UserRole.ADMIN;

  const handleToggleActive = (id: string) => {
    if (!isAdmin) return;
    const updated = vehicleTypes.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v);
    onUpdateTypes(updated);
  };

  const handleSave = () => {
    if (!isAdmin) return;
    const updated = editingId === 'NEW'
      ? [...vehicleTypes, { ...formData, id: `v-${Date.now()}`, isActive: true } as VehicleType]
      : vehicleTypes.map(v => v.id === editingId ? { ...v, ...formData } as VehicleType : v);
    
    onUpdateTypes(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">Fleet Catalog</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">
            {isAdmin ? 'System Configuration Active' : 'Operational Directory (Read-Only)'}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => { setEditingId('NEW'); setFormData({ name: '', capacity: '', basePriceKm: 0, waitingChargeHr: 0 }); }}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-600/20"
          >
            Add Archetype
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicleTypes.map(v => (
          <div key={v.id} className={`glass p-8 rounded-[2.5rem] border-2 transition-all ${v.isActive ? 'border-transparent' : 'border-red-500/20 opacity-50'}`}>
            <div className="flex justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400">
                <ICONS.Truck size={30} />
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(v.id); setFormData(v); }} className="p-2 hover:text-white text-slate-500 transition-colors"><ICONS.Edit size={16} /></button>
                  <button onClick={() => handleToggleActive(v.id)} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${v.isActive ? 'border-emerald-500/20 text-emerald-400' : 'border-red-500/20 text-red-400'}`}>
                    {v.isActive ? 'Active' : 'Offline'}
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-black text-white uppercase">{v.name}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{v.capacity} | {v.dimensions}</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Rate / KM</p>
                <p className="text-lg font-black text-white">₹{v.basePriceKm}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Wait / HR</p>
                <p className="text-lg font-black text-white">₹{v.waitingChargeHr}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingId && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="glass w-full max-w-xl p-10 rounded-[3rem] space-y-8 border border-white/10">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Edit Fleet Spec</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Capacity</label>
                <input type="text" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Rate/KM</label>
                <input type="number" value={formData.basePriceKm} onChange={e => setFormData({...formData, basePriceKm: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none font-bold" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setEditingId(null)} className="flex-1 py-4 glass rounded-2xl font-black uppercase text-xs">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Commit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
