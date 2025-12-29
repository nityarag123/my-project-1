
import React, { useState } from 'react';
import { Truck, LogRecord, UserRole, RecordType } from '../types';
import { ICONS } from '../constants';

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
  const [formData, setFormData] = useState({
    material: '',
    quantity: '',
    type: RecordType.LOADING
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({ ...formData, truckId: truck.id });
    setFormData({ material: '', quantity: '', type: RecordType.LOADING });
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
            <h2 className="text-3xl font-extrabold tracking-tight uppercase tracking-tighter">{truck.truckNumber}</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase tracking-widest mt-1">
              <ICONS.Truck size={14} />
              <span>Unit Activity Log</span>
            </div>
          </div>
        </div>
        
        {role === UserRole.ADMIN && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 group"
          >
            <ICONS.Add size={20} className="group-hover:rotate-90 transition-transform" />
            <span>Create Log Entry</span>
          </button>
        )}
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2rem] border-l-4 border-l-blue-500">
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">Total Logs</p>
          <p className="text-4xl font-bold">{records.length}</p>
        </div>
        <div className="glass p-6 rounded-[2rem] border-l-4 border-l-emerald-500">
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">Loadings</p>
          <p className="text-4xl font-bold text-emerald-400">{records.filter(r => r.type === RecordType.LOADING).length}</p>
        </div>
        <div className="glass p-6 rounded-[2rem] border-l-4 border-l-orange-500">
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">Unloadings</p>
          <p className="text-4xl font-bold text-orange-400">{records.filter(r => r.type === RecordType.UNLOADING).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Material</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Quantity</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                {role === UserRole.ADMIN && <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      record.type === RecordType.LOADING 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-slate-200">{record.material}</td>
                  <td className="px-6 py-5 text-slate-400">{record.quantity}</td>
                  <td className="px-6 py-5 text-xs font-medium text-slate-500">{new Date(record.timestamp).toLocaleString()}</td>
                  {role === UserRole.ADMIN && (
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <ICONS.Delete size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium italic">No operational history found for this unit.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl scale-in-center">
            <h3 className="text-2xl font-bold mb-6">Create Log Record</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Activity Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: RecordType.LOADING })}
                    className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                      formData.type === RecordType.LOADING ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    Loading
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, type: RecordType.UNLOADING })}
                    className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                      formData.type === RecordType.UNLOADING ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    Unloading
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Material Name</label>
                <input 
                  type="text" 
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. Cement, Sand, Steel"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Quantity / Weight</label>
                <input 
                  type="text" 
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. 25 Tons, 50 Bags"
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
                  Log Entry
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
