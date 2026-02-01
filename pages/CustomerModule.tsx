
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, VehicleType, User, SpecialHandling, Truck, ServiceRequest, ServiceStatus } from '../types';
import { ICONS } from '../constants';

interface CustomerModuleProps {
  user: User;
  bookings: Booking[];
  vehicleTypes: VehicleType[];
  trucks: Truck[];
  serviceRequests: ServiceRequest[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
}

type CustomerSubView = 'SPLASH' | 'HOME' | 'BOOKING_FLOW' | 'TRACKING';

const CustomerModule: React.FC<CustomerModuleProps> = ({ user, bookings, vehicleTypes, trucks, serviceRequests, onAddBooking, onUpdateBooking }) => {
  const [subView, setSubView] = useState<CustomerSubView>('SPLASH');
  const [activeStep, setActiveStep] = useState(0);
  
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [weight, setWeight] = useState('');
  const [loadType, setLoadType] = useState('General Goods');
  const [specialHandling, setSpecialHandling] = useState<SpecialHandling>(SpecialHandling.NONE);
  const [notes, setNotes] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (subView === 'SPLASH') {
      const timer = setTimeout(() => setSubView('HOME'), 2000);
      return () => clearTimeout(timer);
    }
  }, [subView]);

  const handleCreateBooking = () => {
    setIsProcessing(true);
    const booking: Booking = {
      id: `BK-${Date.now()}`,
      customerId: user.id,
      vehicleTypeId: selectedVehicle?.id || 'v1',
      pickup,
      drop,
      loadType,
      weight,
      specialHandling,
      notes,
      status: BookingStatus.SEARCHING,
      price: (selectedVehicle?.basePriceKm || 0) * 10,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      onAddBooking(booking);
      setActiveBooking(booking);
      setIsProcessing(false);
      setSubView('TRACKING');
    }, 2000);
  };

  const VehicleStep = () => (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
      <h3 className="text-2xl font-black uppercase italic text-white">Select Vehicle Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicleTypes.filter(v => v.isActive).map(v => (
          <div 
            key={v.id} 
            onClick={() => { setSelectedVehicle(v); setActiveStep(1); }}
            className={`glass p-6 rounded-[2rem] border-2 cursor-pointer transition-all hover:bg-white/5 ${selectedVehicle?.id === v.id ? 'border-blue-500 bg-blue-500/10' : 'border-transparent'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400"><ICONS.Truck size={24} /></div>
              <div>
                <h4 className="font-black text-white uppercase text-sm">{v.name}</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{v.capacity} | ₹{v.basePriceKm}/KM</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FormStep = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      <h3 className="text-2xl font-black uppercase italic text-white">Advanced Logistics Parameters</h3>
      <div className="glass p-8 rounded-[3rem] space-y-6 border border-white/10 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input 
              type="text" 
              value={pickup} 
              onChange={e => setPickup(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-blue-500/30" 
              placeholder="Origin Point" 
            />
            <input 
              type="text" 
              value={drop} 
              onChange={e => setDrop(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-blue-500/30" 
              placeholder="Destination Terminal" 
            />
          </div>
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Handling Requirements</label>
                <select 
                  value={specialHandling} 
                  onChange={e => setSpecialHandling(e.target.value as SpecialHandling)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none appearance-none text-slate-300"
                >
                  <option value={SpecialHandling.NONE} className="bg-slate-900">Standard Goods</option>
                  <option value={SpecialHandling.FRAGILE} className="bg-slate-900">Fragile / High-Care</option>
                  <option value={SpecialHandling.REFRIGERATED} className="bg-slate-900">Refrigerated / Thermal</option>
                  <option value={SpecialHandling.HAZARDOUS} className="bg-slate-900">Hazardous (Hazmat)</option>
                </select>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  value={loadType} 
                  onChange={e => setLoadType(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none" 
                  placeholder="Cargo Class" 
                />
                <input 
                  type="text" 
                  value={weight} 
                  onChange={e => setWeight(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-bold outline-none" 
                  placeholder="Weight KG" 
                />
             </div>
          </div>
        </div>

        <div>
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Operational Instructions</label>
           <textarea 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 h-24 font-bold outline-none resize-none" 
            placeholder="Special delivery notes, gate access codes, etc."
           />
        </div>

        <button 
          onClick={handleCreateBooking}
          disabled={!pickup || !drop || isProcessing}
          className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] rounded-3xl shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all active:scale-95"
        >
          {isProcessing ? "Transmitting Protocol..." : "Commit Mission"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full">
      {subView === 'SPLASH' && (
        <div className="fixed inset-0 bg-[#0f172a] z-[100] flex flex-col items-center justify-center">
          <ICONS.Truck size={64} className="text-blue-500 animate-pulse" />
          <h1 className="text-3xl font-black mt-8 uppercase italic text-white tracking-tighter">InfraPulse Ops Core</h1>
        </div>
      )}

      {subView === 'HOME' && (
        <div className="space-y-10 animate-in fade-in duration-1000">
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Operations Hub</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Fleet Oversight</p>
            </div>
            <button 
              onClick={() => { setSubView('BOOKING_FLOW'); setActiveStep(0); }} 
              className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl hover:rotate-6 transition-all active:scale-90"
            >
              <ICONS.Add size={40} />
            </button>
          </header>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Deployment Stream</h4>
             <div className="grid grid-cols-1 gap-4">
               {bookings.map(b => {
                 const assignedTruck = trucks.find(t => t.id === b.truckId);
                 const activeService = serviceRequests.find(s => s.truckId === b.truckId && s.status !== ServiceStatus.COMPLETED);
                 
                 return (
                   <div key={b.id} className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -translate-y-16 translate-x-16 rounded-full blur-3xl group-hover:bg-blue-600/10" />
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex gap-6 items-center">
                          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><ICONS.Truck size={32} /></div>
                          <div>
                            <p className="text-lg font-black text-white uppercase italic">{b.pickup} <span className="text-slate-600 mx-1">→</span> {b.drop}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                               <span className="text-[9px] font-black uppercase text-blue-400">{b.loadType} | {b.weight} KG</span>
                               {b.specialHandling !== SpecialHandling.NONE && (
                                 <span className="text-[9px] font-black uppercase text-red-400 px-2 py-0.5 rounded-lg bg-red-400/10 border border-red-500/20">{b.specialHandling}</span>
                               )}
                               <span className="text-[9px] font-black uppercase text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 tracking-widest">{b.status}</span>
                            </div>
                          </div>
                        </div>

                        {assignedTruck && (
                          <div className="flex items-center gap-6 pl-6 md:border-l border-white/10">
                             <div className="text-right">
                                <p className="text-xs font-black text-white uppercase tracking-tighter">Unit {assignedTruck.truckNumber}</p>
                                <p className="text-[10px] font-bold text-slate-500">{assignedTruck.driverName}</p>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                   <div className={`w-2 h-2 rounded-full ${assignedTruck.healthIndex > 80 ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`} />
                                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Health {assignedTruck.healthIndex}%</span>
                                </div>
                             </div>
                             {activeService && (
                               <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-2">
                                  <ICONS.Maintenance size={16} className="text-orange-400 animate-spin-slow" />
                                  <span className="text-[9px] font-black uppercase text-orange-400">Maintenance Pulse</span>
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                   </div>
                 );
               })}
             </div>
             {bookings.length === 0 && (
               <div className="py-20 text-center glass rounded-[3rem] border-dashed border-white/10">
                 <ICONS.Logs size={48} className="text-slate-700 mx-auto mb-4" />
                 <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No active sortie logs detected.</p>
               </div>
             )}
          </div>
        </div>
      )}

      {subView === 'BOOKING_FLOW' && (
        <div className="max-w-2xl mx-auto py-10 px-6">
          <button onClick={() => setSubView('HOME')} className="mb-8 text-slate-500 hover:text-white transition-all flex items-center gap-2 uppercase text-[10px] font-black tracking-widest">
            <span className="text-xl">←</span> Abort Protocol
          </button>
          {activeStep === 0 ? <VehicleStep /> : <FormStep />}
        </div>
      )}

      {subView === 'TRACKING' && activeBooking && (
        <div className="space-y-8 animate-in zoom-in-95 text-center py-20">
          <div className="glass p-16 rounded-[4rem] space-y-6 relative overflow-hidden max-w-2xl mx-auto border border-emerald-500/20">
             <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 -translate-y-20 translate-x-20 rounded-full blur-3xl" />
             <ICONS.Success size={80} className="text-emerald-500 mx-auto animate-bounce" />
             <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">Objective Confirmed</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest">Tracking Signal: {activeBooking.id}</p>
             <div className="pt-10">
               <button onClick={() => setSubView('HOME')} className="px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-emerald-500/20 transition-all active:scale-95">Return to Ops Hub</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerModule;
