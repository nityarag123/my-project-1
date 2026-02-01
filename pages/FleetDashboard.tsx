
import React from 'react';
import { Site, Truck, TruckStatus, User, VehicleType } from '../types';
import { ICONS } from '../constants';
import * as Store from '../store';

interface FleetDashboardProps {
  sites: Site[];
  trucks: Truck[];
  users: User[];
  onSelectTruck: (truckId: string) => void;
}

const FleetDashboard: React.FC<FleetDashboardProps> = ({ sites, trucks, onSelectTruck }) => {
  const vehicleTypes = Store.getStoredVehicleTypes();
  const serviceRequests = Store.getStoredServiceRequests();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h2 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">Global Fleet Pulse</h2>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mt-1">Operational Command Console Active</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass p-10 rounded-[3rem] border-l-4 border-l-blue-600">
           <ICONS.Building size={32} className="text-blue-400 mb-6" />
           <h3 className="text-xl font-black text-white uppercase mb-2">Network Nodes</h3>
           <p className="text-4xl font-black text-white">{sites.length} <span className="text-xs text-slate-500 uppercase tracking-widest">Active Sites</span></p>
        </div>
        <div className="glass p-10 rounded-[3rem] border-l-4 border-l-emerald-600">
           <ICONS.Truck size={32} className="text-emerald-400 mb-6" />
           <h3 className="text-xl font-black text-white uppercase mb-2">Fleet Payload</h3>
           <p className="text-4xl font-black text-white">{trucks.length} <span className="text-xs text-slate-500 uppercase tracking-widest">Deployed Units</span></p>
        </div>
        <div className="glass p-10 rounded-[3rem] border-l-4 border-l-orange-600">
           <ICONS.Maintenance size={32} className="text-orange-400 mb-6" />
           <h3 className="text-xl font-black text-white uppercase mb-2">Fleet Integrity</h3>
           <p className="text-4xl font-black text-white">{Math.round(trucks.reduce((acc, t) => acc + t.healthIndex, 0) / (trucks.length || 1))}% <span className="text-xs text-slate-500 uppercase tracking-widest">Health Index</span></p>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Detailed Fleet Inventory</h4>
        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <th className="px-8 py-6">Plate Number</th>
                <th className="px-8 py-6">Class / Integrity</th>
                <th className="px-8 py-6">Stationed At</th>
                <th className="px-8 py-6">Driver Authority</th>
                <th className="px-8 py-6 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trucks.map(truck => {
                const site = sites.find(s => s.id === truck.siteId);
                const vType = vehicleTypes.find(v => v.id === truck.vehicleTypeId);
                const activeService = serviceRequests.find(s => s.truckId === truck.id && s.status !== 'COMPLETED');
                
                return (
                  <tr 
                    key={truck.id} 
                    onClick={() => onSelectTruck(truck.id)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-6">
                      <span className="font-black text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{truck.truckNumber}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-200 uppercase">{vType?.name || '---'}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`h-1 w-10 rounded-full bg-white/10 overflow-hidden`}>
                             <div className={`h-full ${truck.healthIndex > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${truck.healthIndex}%` }} />
                          </div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">{truck.healthIndex}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <ICONS.Location size={12} className="text-blue-500" />
                        <span className="text-xs font-bold text-slate-300 uppercase">{site?.name || 'In Transit'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-200 uppercase">{truck.driverName}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{truck.driverPhone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                          truck.status === TruckStatus.IDLE ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' : 
                          truck.status === TruckStatus.TRANSIT ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' :
                          'bg-orange-600/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {truck.status}
                        </span>
                        {activeService && (
                           <span className="text-[8px] font-black uppercase text-orange-400 italic">Maintenance Pulse: Active</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {trucks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-600 text-xs font-black uppercase tracking-widest">Zero fleet units recorded in the grid.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetDashboard;
