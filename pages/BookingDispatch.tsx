
import React, { useState } from 'react';
import { Booking, Truck, VehicleType, BookingStatus, TruckStatus } from '../types';
import { ICONS } from '../constants';

interface BookingDispatchProps {
  bookings: Booking[];
  trucks: Truck[];
  vehicleTypes: VehicleType[];
  onAssign: (bookingId: string, truckId: string) => void;
}

const BookingDispatch: React.FC<BookingDispatchProps> = ({ bookings, trucks, vehicleTypes, onAssign }) => {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  
  const pending = bookings.filter(b => b.status === BookingStatus.SEARCHING);
  const active = bookings.filter(b => b.status !== BookingStatus.SEARCHING && b.status !== BookingStatus.COMPLETED);

  const getAvailableTrucks = (typeId: string) => 
    trucks.filter(t => t.vehicleTypeId === typeId && t.status === TruckStatus.IDLE);

  return (
    <div className="space-y-10 animate-in fade-in">
      <header>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Logistics Command</h2>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Pending Assignments: {pending.length} Units Required</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 px-4">Pending Requests</h3>
          <div className="space-y-4">
            {pending.map(b => (
              <div key={b.id} className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-black text-white">{b.pickup} → {b.drop}</h4>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                      Req Class: {vehicleTypes.find(v => v.id === b.vehicleTypeId)?.name}
                    </p>
                  </div>
                  <span className="text-lg font-black text-white">₹{b.price}</span>
                </div>
                
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{b.loadType} | {b.weight} KG</span>
                  <button 
                    onClick={() => setSelectedBooking(b.id)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    Select Unit
                  </button>
                </div>

                {selectedBooking === b.id && (
                  <div className="mt-6 p-6 bg-white/5 rounded-2xl space-y-4 animate-in slide-in-from-top-4">
                    <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Idle Candidates ({getAvailableTrucks(b.vehicleTypeId).length})</p>
                    <div className="grid grid-cols-1 gap-2">
                      {getAvailableTrucks(b.vehicleTypeId).length > 0 ? (
                        getAvailableTrucks(b.vehicleTypeId).map(t => (
                          <button 
                            key={t.id}
                            onClick={() => { onAssign(b.id, t.id); setSelectedBooking(null); }}
                            className="flex justify-between items-center p-4 rounded-xl border border-white/10 hover:bg-blue-600/20 transition-all group"
                          >
                            <div className="text-left">
                               <p className="font-bold text-sm text-white group-hover:text-blue-400">{t.truckNumber}</p>
                               <p className="text-[9px] text-slate-500 uppercase">{t.driverName}</p>
                            </div>
                            <span className="text-[9px] font-black text-emerald-500 uppercase">Select Unit</span>
                          </button>
                        ))
                      ) : (
                        <p className="text-[10px] text-red-400 font-bold uppercase py-4 text-center">No compatible units idle at this time.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {pending.length === 0 && <p className="text-slate-600 text-sm font-black uppercase tracking-[0.2em] px-4 py-20 text-center glass rounded-3xl">All sortie requests cleared.</p>}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 px-4">Active Deployments</h3>
          <div className="space-y-4">
            {active.map(b => {
              const assignedTruck = trucks.find(t => t.id === b.truckId);
              return (
                <div key={b.id} className="glass p-6 rounded-[2rem] flex justify-between items-center border-l-4 border-l-blue-600">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400"><ICONS.Truck size={24} /></div>
                    <div>
                      <p className="text-sm font-black text-white uppercase">{b.pickup} → {b.drop}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Unit {assignedTruck?.truckNumber} | {assignedTruck?.driverName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-black uppercase border border-blue-500/20">{b.status}</span>
                </div>
              );
            })}
            {active.length === 0 && <p className="text-slate-600 text-xs font-black uppercase py-10 text-center">No units currently in sortie.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookingDispatch;
