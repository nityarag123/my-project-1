
import React, { useState } from 'react';
import { Truck, LogRecord, UserRole, RecordType, TruckStatus, ServiceRequest, ServiceStatus, ServicePriority, ServiceTask } from '../types';
import { ICONS } from '../constants';
import { GoogleGenAI } from '@google/genai';

interface DetailsPageProps {
  truck: Truck;
  records: LogRecord[];
  serviceRequests: ServiceRequest[];
  onBack: () => void;
  role: UserRole;
  onAddRecord: (record: Omit<LogRecord, 'id' | 'timestamp'>) => void;
  onDeleteRecord: (id: string) => void;
  onAddServiceRequest: (request: ServiceRequest) => void;
  onUpdateServiceRequest: (request: ServiceRequest) => void;
}

const DetailsPage: React.FC<DetailsPageProps> = ({ 
  truck, records, serviceRequests, onBack, role, onAddRecord, onDeleteRecord, onAddServiceRequest, onUpdateServiceRequest 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    material: '',
    quantity: '',
    type: RecordType.LOADING,
    notes: ''
  });

  const [serviceForm, setServiceForm] = useState({
    type: 'Routine Maintenance',
    priority: ServicePriority.MEDIUM,
    description: '',
    estimatedCost: 0,
    expectedDate: new Date().toISOString().split('T')[0],
    tasks: ['Oil Inspection', 'Brake Check']
  });

  const activeRequest = serviceRequests.find(s => s.status !== ServiceStatus.COMPLETED);

  const calculateProgress = (req: ServiceRequest) => {
    if (req.tasks.length === 0) return 0;
    const completed = req.tasks.filter(t => t.isCompleted).length;
    return Math.round((completed / req.tasks.length) * 100);
  };

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
      Status: ${truck.status} | Fuel: ${truck.fuelLevel}% | Health Index: ${truck.healthIndex}%
      Historical Logs: ${JSON.stringify(records.slice(0, 10))}
      Current Service: ${activeRequest ? JSON.stringify(activeRequest) : 'None'}
      
      Provide a "Unit Operational Audit":
      - Efficiency rating (0-100).
      - Maintenance strategy recommendation.
      - Component wear prediction based on load frequency.
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

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({ ...formData, truckId: truck.id });
    setFormData({ material: '', quantity: '', type: RecordType.LOADING, notes: '' });
    setShowAddModal(false);
  };

  const handleScheduleService = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: ServiceRequest = {
      id: `SR-${Date.now()}`,
      truckId: truck.id,
      type: serviceForm.type,
      priority: serviceForm.priority,
      description: serviceForm.description,
      estimatedCost: serviceForm.estimatedCost,
      expectedDate: serviceForm.expectedDate,
      status: ServiceStatus.PENDING,
      tasks: serviceForm.tasks.map(t => ({ id: `task-${Math.random()}`, description: t, isCompleted: false })),
      timestamp: new Date().toISOString()
    };
    onAddServiceRequest(newRequest);
    setShowServiceModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const toggleTask = (taskId: string) => {
    if (!activeRequest || role === UserRole.CUSTOMER) return;
    const updatedTasks = activeRequest.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const allDone = updatedTasks.every(t => t.isCompleted);
    onUpdateServiceRequest({ 
      ...activeRequest, 
      tasks: updatedTasks,
      status: allDone ? ServiceStatus.COMPLETED : ServiceStatus.IN_PROGRESS 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-10 right-10 z-[100] glass border-emerald-500/50 p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-10 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ICONS.Success size={24} />
          </div>
          <div>
            <p className="font-black text-white uppercase text-xs tracking-widest">Protocol Initiated</p>
            <p className="text-[10px] text-slate-400 font-medium">Service workflow deployed for {truck.truckNumber}.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass rounded-[2.5rem] border-l-4 border-l-blue-600">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 border border-white/5 transition-all group shadow-lg">
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
              <span className="flex items-center gap-1"><ICONS.Route size={14} /> ETA: {truck.eta || 'IDLE'}</span>
              <span className="flex items-center gap-1"><ICONS.Fuel size={14} /> Fuel: {truck.fuelLevel}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleGenerateAIInsights} disabled={isAnalyzing} className="flex items-center gap-3 bg-gradient-to-br from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/30">
            <ICONS.AI size={20} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>Operational Audit</span>
          </button>
          {role !== UserRole.CUSTOMER && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-white/10">
              <ICONS.Logs size={20} />
              <span>Log Event</span>
            </button>
          )}
        </div>
      </header>

      {/* Service Progress Tracking */}
      {activeRequest && (
        <div className="glass p-8 rounded-[3rem] border border-blue-500/20 bg-blue-500/5 relative overflow-hidden animate-in zoom-in-95">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <ICONS.Maintenance size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic">{activeRequest.type} <span className="text-blue-500 opacity-50">#{activeRequest.id}</span></h3>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    activeRequest.priority === ServicePriority.HIGH ? 'bg-red-500/20 text-red-400' : 
                    activeRequest.priority === ServicePriority.MEDIUM ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>Priority {activeRequest.priority}</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[8px] font-black uppercase">Exp. {activeRequest.expectedDate}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
               <p className="text-3xl font-black text-white">{calculateProgress(activeRequest)}%</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Completion</p>
            </div>
          </div>

          <div className="h-4 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5 p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
              style={{ width: `${calculateProgress(activeRequest)}%` }} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequest.tasks.map(task => (
              <button 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                disabled={role === UserRole.CUSTOMER}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                  task.isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-bold uppercase tracking-tight">{task.description}</span>
                {task.isCompleted ? <ICONS.Success size={18} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-700" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="glass p-8 rounded-[2.5rem] border-blue-500/30 bg-blue-500/5 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-6">
            <ICONS.Think size={24} className="text-blue-400" />
            <h4 className="text-xl font-bold text-blue-200 uppercase">Analysis Results</h4>
          </div>
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">{aiAnalysis}</div>
        </div>
      )}

      {/* Fleet Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 px-2">Operational Stream</h3>
          <div className="glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                  <th className="px-6 py-5">Event</th>
                  <th className="px-6 py-5">Payload</th>
                  <th className="px-6 py-5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        record.type === RecordType.LOADING ? 'text-blue-400 border-blue-500/20' : 
                        record.type === RecordType.MAINTENANCE ? 'text-orange-400 border-orange-500/20' : 'text-slate-400'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-200 text-xs">{record.material} <span className="text-slate-500 font-medium ml-2">{record.quantity}</span></td>
                    <td className="px-6 py-5 text-right text-[10px] text-slate-500 font-medium">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 px-2">Unit Health</h3>
          <div className="glass p-8 rounded-[3rem] border border-white/5 space-y-8">
             <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Reliability Index</span>
                  <span className="text-emerald-400">{truck.healthIndex}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                   <div className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${truck.healthIndex}%` }} />
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20"><ICONS.Maintenance size={20} /></div>
                   <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Est. Maintenance Window</p>
                      <p className="text-lg font-bold">{truck.nextMaintenanceInKm} KM Left</p>
                   </div>
                </div>
             </div>

             {role !== UserRole.CUSTOMER && !activeRequest && (
               <button 
                onClick={() => setShowServiceModal(true)}
                className="w-full py-5 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 transition-all active:scale-95"
               >
                 Initiate Maintenance Protocol
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Service Scheduling Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg p-10 rounded-[3.5rem] border border-white/10 shadow-3xl scale-in-center overflow-hidden relative">
            <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase italic">Deploy Maintenance</h3>
            <form onSubmit={handleScheduleService} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Objective</label>
                  <input 
                    type="text" 
                    value={serviceForm.type}
                    onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none font-bold"
                    placeholder="e.g. Engine Overhaul"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
                  <select 
                    value={serviceForm.priority}
                    onChange={(e) => setServiceForm({...serviceForm, priority: e.target.value as ServicePriority})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-300 appearance-none font-bold outline-none"
                  >
                    <option value={ServicePriority.LOW}>Routine (Low)</option>
                    <option value={ServicePriority.MEDIUM}>Standard (Medium)</option>
                    <option value={ServicePriority.HIGH}>Urgent (High)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Budget Allocation</label>
                  <input 
                    type="number" 
                    value={serviceForm.estimatedCost}
                    onChange={(e) => setServiceForm({ ...serviceForm, estimatedCost: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-bold outline-none"
                    placeholder="₹ INR"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Component Requirements</label>
                <textarea 
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-24 font-bold outline-none resize-none text-sm"
                  placeholder="Describe specific unit problems..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowServiceModal(false)} className="flex-1 py-4 glass rounded-2xl font-black uppercase text-[10px] tracking-widest">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20">Authorize</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg p-10 rounded-[3rem] border border-white/10 shadow-3xl scale-in-center">
            <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase italic">Manual Event Log</h3>
            <form onSubmit={handleSubmitLog} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Event Logic</label>
                   <div className="grid grid-cols-3 gap-2">
                     {[RecordType.LOADING, RecordType.UNLOADING, RecordType.ISSUE].map(t => (
                       <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.type === t ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-500'}`}>{t}</button>
                     ))}
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Descriptor</label>
                   <input type="text" value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none" placeholder="Cement, Sand, Fuel..." />
                </div>
                <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Metric</label>
                   <input type="text" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none" placeholder="10 Tons / 50 Bags..." />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 glass rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20">Verify Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsPage;
