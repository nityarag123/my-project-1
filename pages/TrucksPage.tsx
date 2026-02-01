
import React, { useState } from 'react';
import { Truck, Site, UserRole, TruckStatus, VehicleType } from '../types';
import { ICONS } from '../constants';
import * as Store from '../store';

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
  const vehicleTypes = Store.getStoredVehicleTypes();
  
  const [formData, setFormData] = useState({
    truckNumber: '',
    vehicleTypeId: vehicleTypes[0]?.id || '',
    driverName: '',
    driverPhone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTruck({ 
      ...formData,
      siteId: site.id,
      status: TruckStatus.IDLE,
      fuelLevel: 100,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenanceInKm: 2000,
      healthIndex: 100
    });
    setFormData({ truckNumber: '', vehicleTypeId: vehicleTypes[0]?.id || '', driverName: '', driverPhone: '' });
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
            <span>Assign New Vehicle</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trucks.map((truck) => {
          const vType = vehicleTypes.find(v => v.id === truck.vehicleTypeId);
          return (
            <div 
              key={truck.id} 
              className="glass p-6 rounded-[2.5rem] hover:bg-white/10 transition-all group border-b-4 border-b-transparent hover:border-b-blue-500 shadow-xl flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <ICONS.Truck size={24} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                  truck.status === TruckStatus.IDLE ? 'border-emerald-500/20 text-emerald-400' : 'border-blue-500/20 text-blue-400'
                }`}>
                  {truck.status}
                </div>
              </div>

              <h3 className="text-xl font-black tracking-tighter mb-1 uppercase text-slate-100">
                {truck.truckNumber}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                {vType?.name || 'Unknown Type'}
              </p>

              <div className="space-y-2 mb-6 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <ICONS.User size={12} />
                  <span className="font-medium">{truck.driverName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <ICONS.Sign size={12} />
                  <span className="font-medium">{truck.driverPhone}</span>
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <button 
                  onClick={() => onSelectTruck(truck.id)}
                  className="w-full bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white font-bold py-3 rounded-xl transition-all border border-white/10"
                >
                  Manage Logistics
                </button>
                {role === UserRole.ADMIN && (
                  <button 
                    onClick={() => onDeleteTruck(truck.id)}
                    className="w-full text-slate-600 hover:text-red-400 text-[10px] font-black uppercase tracking-widest pt-2"
                  >
                    Decommission Unit
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {trucks.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass rounded-[2rem] border-dashed border-white/10">
            <div className="text-slate-600 mb-4"><ICONS.Truck size={48} /></div>
            <p className="text-slate-400 font-medium uppercase text-xs tracking-widest font-black">No units stationed at this node.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg p-10 rounded-[3rem] border border-white/10 shadow-2xl scale-in-center">
            <h3 className="text-3xl font-black mb-8 uppercase tracking-tighter">Register Unit</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Vehicle Number</label>
                  <input 
                    type="text" 
                    value={formData.truckNumber}
                    onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="AP 31 TV 1234"
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Vehicle Type</label>
                  <select 
                    value={formData.vehicleTypeId}
                    onChange={(e) => setFormData({ ...formData, vehicleTypeId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-300 appearance-none"
                    required
                  >
                    {vehicleTypes.map(v => (
                      <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Driver Name</label>
                  <input 
                    type="text" 
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                  <input 
                    type="tel" 
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                >
                  Abnormal Close
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20"
                >
                  Finalize Entry
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
