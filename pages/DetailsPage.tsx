
import React, { useState } from 'react';
import { Truck, LogRecord, UserRole, RecordType, TruckStatus } from '../types';
import { ICONS } from '../constants';
import { GoogleGenAI } from '@google/genai';

interface DetailsPageProps {
  truck: Truck;
  records: LogRecord[];
  onBack: () => void;
  role: UserRole;
  onAddRecord: (record: Omit<LogRecord, 'id' | 'timestamp'>) => void;
  onDeleteRecord: (id: string) => void;
}

const DetailsPage: React.FC<DetailsPageProps> = ({ truck, records, onBack, role, onAddRecord, onDeleteRecord }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<any>({
    material: '',
    quantity: '',
    type: RecordType.LOADING,
    notes: ''
  });

  const handleGenerateAIInsights = async () => {
    if (records.length === 0) {
      alert("No log data available for analysis.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an expert logistics analyst for InfraPulse 360.
      Unit: ${truck.truckNumber}
      Status: ${truck.status} | Fuel: ${truck.fuelLevel}% | Maintenance: ${truck.nextMaintenanceInKm}km left.
      Historical Logs: ${JSON.stringify(records.slice(0, 10))}
      
      Provide a "Unit Operational Audit":
      - Efficiency rating (0-100).
      - Immediate maintenance requirement? (Yes/No).
      - Risk assessment for the current status.
      Be concise, technical, and formatted for a professional hub.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAnalysis(response.text || "Report generation incomplete.");
    } catch (error) {
      console.error(error);
      setAiAnalysis("Analysis terminal offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord(formData);
    setFormData({ material: '', quantity: '', type: RecordType.LOADING, notes: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Dynamic Command Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass rounded-[2.5rem] border-l-4 border-l-blue-600">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all border border-white/5 group shadow-lg"
          >
            <div className="group-hover:-translate-x-1 transition-transform">←</div>
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-4xl font-black tracking-tighter uppercase">{truck.truckNumber}</h2>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                truck.status === TruckStatus.TRANSIT ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700/20 text-slate-400 border-slate-500/30'
              }`}>
                {truck.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1"><ICONS.Route size={14} /> Live ETA: {truck.eta || 'N/A'}</span>
              <span className="flex items-center gap-1"><ICONS.Fuel size={14} /> Fuel: {truck.fuelLevel}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleGenerateAIInsights}
            disabled={isAnalyzing}
            className="flex items-center gap-3 bg-gradient-to-br from-purple-600 to-indigo-600 hover:scale-105 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/30"
          >
            <ICONS.AI size={20} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>Unit Pulse Audit</span>
          </button>

          {role === UserRole.OPERATOR && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/30 group"
            >
              <ICONS.Add size={20} className="group-hover:rotate-90 transition-transform" />
              <span>Log Event</span>
            </button>
          )}
        </div>
      </header>

      {/* AI Intelligence Result */}
      {aiAnalysis && (
        <div className="glass p-8 rounded-[2.5rem] border-purple-500/30 bg-purple-500/5 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
          <button onClick={() => setAiAnalysis(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
            <ICONS.Close size={20} />
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              {/* Fixed BrainCircuit to Think */}
              <ICONS.Think size={28} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-purple-200">Operational Audit Report</h4>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Powered by InfraPulse Intelligence</p>
            </div>
          </div>
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Digital POD & Log Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logs Table */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-2 px-2">Unit Event Stream</h3>
          <div className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                  <th className="px-6 py-5">Event</th>
                  <th className="px-6 py-5">Payload</th>
                  <th className="px-6 py-5">Verification</th>
                  <th className="px-6 py-5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${
                        record.type === RecordType.LOADING ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' : 
                        record.type === RecordType.UNLOADING ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-purple-600/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200">{record.material}</span>
                        <span className="text-[10px] text-slate-500">{record.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {record.type === RecordType.POD ? (
                        <div className="flex items-center gap-2 group/pod relative">
                           <ICONS.Camera size={14} className="text-emerald-400" />
                           <span className="text-[10px] text-emerald-400 font-bold underline cursor-pointer">View Image</span>
                           {record.podImageUrl && (
                             <div className="absolute bottom-full left-0 mb-2 hidden group-hover/pod:block w-48 h-48 rounded-xl overflow-hidden glass border border-white/10 z-10 p-2">
                               <img src={record.podImageUrl} alt="POD" className="w-full h-full object-cover rounded-lg" />
                             </div>
                           )}
                        </div>
                      ) : <span className="text-slate-600 text-[10px]">Verified System Entry</span>}
                    </td>
                    <td className="px-6 py-5 text-right text-[10px] text-slate-500 font-medium">
                      {new Date(record.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance & Health Card */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-2 px-2">Health Metrics</h3>
          <div className="glass p-8 rounded-[2rem] border border-white/5 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><ICONS.Maintenance size={80} /></div>
             
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Threshold</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${truck.nextMaintenanceInKm < 200 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {truck.nextMaintenanceInKm < 200 ? 'CRITICAL' : 'OPTIMAL'}
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                   <div 
                    className={`h-full rounded-full transition-all duration-1000 ${truck.nextMaintenanceInKm < 200 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min(100, (truck.nextMaintenanceInKm / 1500) * 100)}%` }} 
                   />
                </div>
                <p className="text-2xl font-black">{truck.nextMaintenanceInKm} KM <span className="text-xs text-slate-500">Remaining</span></p>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-4 group cursor-help">
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20"><ICONS.Fuel size={20} /></div>
                   <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Energy Payload</p>
                      <p className="text-lg font-bold">{truck.fuelLevel}% <span className="text-[10px] text-slate-600 font-medium">Capacity</span></p>
                   </div>
                </div>
                <div className="flex items-center gap-4 group cursor-help">
                   {/* Fixed Wrench to Maintenance */}
                   <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20"><ICONS.Maintenance size={20} /></div>
                   <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Last Diagnostic</p>
                      <p className="text-lg font-bold">{new Date(truck.lastMaintenance).toLocaleDateString()}</p>
                   </div>
                </div>
             </div>

             <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Schedule Fleet Service</button>
          </div>
        </div>
      </div>

      {/* Modern Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg p-10 rounded-[3rem] border border-white/10 shadow-3xl scale-in-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 -translate-y-16 translate-x-16 rounded-full blur-3xl" />
            <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Log Terminal</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Event Logic</label>
                <div className="grid grid-cols-3 gap-2">
                  {[RecordType.LOADING, RecordType.UNLOADING, RecordType.POD].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, type})}
                      className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        formData.type === type ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/5 text-slate-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Cargo Metric</label>
                  <input 
                    type="text" 
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-bold"
                    placeholder="Material ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Quantity/Mass</label>
                  <input 
                    type="text" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-bold"
                    placeholder="Total Units"
                    required
                  />
                </div>
              </div>

              {formData.type === RecordType.POD && (
                <div className="p-6 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 flex flex-col items-center gap-4 group hover:border-emerald-500/50 transition-all cursor-pointer">
                   <ICONS.Camera size={32} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                   <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Capture Proof of Delivery</p>
                      <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Auto-Geotagged & Timestamped</p>
                   </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-5 rounded-2xl transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-600/30 uppercase text-xs tracking-[0.2em]"
                >
                  Verify & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;
