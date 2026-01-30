
import React, { useState, useEffect } from 'react';
import { Site, Truck, TruckStatus } from '../types';
import { ICONS } from '../constants';
import { GoogleGenAI } from '@google/genai';

interface FleetDashboardProps {
  sites: Site[];
  trucks: Truck[];
  onSelectTruck: (truckId: string) => void;
}

const FleetDashboard: React.FC<FleetDashboardProps> = ({ sites, trucks, onSelectTruck }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fleetReport, setFleetReport] = useState<string | null>(null);

  const stats = {
    total: trucks.length,
    inTransit: trucks.filter(t => t.status === TruckStatus.TRANSIT).length,
    loading: trucks.filter(t => t.status === TruckStatus.LOADING).length,
    maintenance: trucks.filter(t => t.status === TruckStatus.MAINTENANCE).length,
    criticalMaintenance: trucks.filter(t => t.nextMaintenanceInKm < 200).length,
    avgFuel: Math.round(trucks.reduce((acc, t) => acc + t.fuelLevel, 0) / (trucks.length || 1))
  };

  const handlePredictiveFleetAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an AI Logistics Director. Analyze this fleet state:
      - Fleet Stats: ${JSON.stringify(stats)}
      - Site Locations: ${JSON.stringify(sites.map(s => s.location))}
      - Current Fleet Statuses: ${JSON.stringify(trucks.map(t => ({ id: t.truckNumber, status: t.status, fuel: t.fuelLevel })))}
      
      Provide a "Fleet Optimization Directive":
      1. One predictive route optimization for a truck in transit.
      2. Priority maintenance alert.
      3. Estimated resource demand for tomorrow based on current loading patterns.
      Be concise, high-end, and data-driven.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
      });
      setFleetReport(response.text || "Report generation failed.");
    } catch (err) {
      console.error(err);
      setFleetReport("Critical AI Link Failure. Retrying neural bridge...");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight uppercase tracking-tighter">Fleet Intelligence</h2>
          <p className="text-slate-400 font-medium mt-1">Real-time predictive telemetry & logistics hub.</p>
        </div>
        
        <button 
          onClick={handlePredictiveFleetAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:scale-105 text-white px-8 py-4 rounded-[2rem] font-bold transition-all shadow-xl shadow-emerald-500/20 group"
        >
          {/* Fixed Sparkles to AI */}
          {isAnalyzing ? <ICONS.AI className="animate-spin" size={20} /> : <ICONS.AI size={20} />}
          <span>Generate Optimization Directive</span>
        </button>
      </header>

      {/* Predictive Report */}
      {fleetReport && (
        <div className="glass p-8 rounded-[2.5rem] border-l-4 border-l-emerald-500 bg-emerald-500/5 relative animate-in slide-in-from-top-4">
          <button onClick={() => setFleetReport(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
            <ICONS.Close size={20} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ICONS.Think size={22} />
            </div>
            <h3 className="text-xl font-bold text-emerald-300">Predictive Directive</h3>
          </div>
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {fleetReport}
          </div>
        </div>
      )}

      {/* High-Level Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Fleet', value: stats.total, icon: <ICONS.Truck />, color: 'blue' },
          { label: 'In Transit', value: stats.inTransit, icon: <ICONS.Route />, color: 'emerald' },
          { label: 'Fuel Readiness', value: `${stats.avgFuel}%`, icon: <ICONS.Fuel />, color: 'orange' },
          { label: 'Maintenance Risk', value: stats.criticalMaintenance, icon: <ICONS.Maintenance />, color: 'danger' },
        ].map((s, idx) => (
          <div key={idx} className="glass p-6 rounded-[2rem] group hover:border-blue-500/30 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-${s.color === 'danger' ? 'red' : s.color}-500/10 flex items-center justify-center text-${s.color === 'danger' ? 'red' : s.color}-400 mb-4`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            <p className="text-4xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Fleet Maintenance & Telemetry Board */}
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900/40">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ICONS.Security className="text-blue-400" size={20} />
            Fleet Operational Board
          </h3>
          <div className="flex gap-2">
             <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-slate-400 font-bold uppercase tracking-widest">Live Updates</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-5">Unit ID</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Fuel / Energy</th>
                <th className="px-6 py-5">Maintenance Cycle</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trucks.map(truck => (
                <tr key={truck.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5 font-bold text-slate-200">{truck.truckNumber}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      truck.status === TruckStatus.TRANSIT ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      truck.status === TruckStatus.LOADING ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {truck.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className={`h-full transition-all ${truck.fuelLevel < 20 ? 'bg-red-500' : 'bg-blue-500'}`} 
                          style={{ width: `${truck.fuelLevel}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{truck.fuelLevel}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-300">{truck.nextMaintenanceInKm} km remaining</span>
                      <span className="text-[10px] text-slate-600 font-medium">Last: {new Date(truck.lastMaintenance).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => onSelectTruck(truck.id)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/5"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetDashboard;
