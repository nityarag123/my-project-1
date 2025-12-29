
import React, { useState } from 'react';
import { Site, UserRole } from '../types';
import { ICONS } from '../constants';

interface SitesPageProps {
  sites: Site[];
  onSelectSite: (siteId: string) => void;
  role: UserRole;
  onAddSite: (site: Omit<Site, 'id'>) => void;
  onDeleteSite: (id: string) => void;
}

const SitesPage: React.FC<SitesPageProps> = ({ sites, onSelectSite, role, onAddSite, onDeleteSite }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', location: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSite(newSite);
    setNewSite({ name: '', location: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Project Sites</h2>
          <p className="text-slate-400 font-medium mt-1">Manage and track infrastructure construction locations.</p>
        </div>
        
        {role === UserRole.ADMIN && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 group"
          >
            <ICONS.Add size={20} className="group-hover:rotate-90 transition-transform" />
            <span>Add New Site</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div 
            key={site.id} 
            className="glass p-6 rounded-[2rem] hover:border-blue-500/50 transition-all group relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform" />
            
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
              <ICONS.Building size={24} />
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{site.name}</h3>
            
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
              <ICONS.Location size={14} />
              <span>{site.location}</span>
            </div>

            <div className="mt-auto flex items-center gap-3">
              <button 
                onClick={() => onSelectSite(site.id)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/5"
              >
                View Trucks
              </button>
              
              {role === UserRole.ADMIN && (
                <button 
                  onClick={() => onDeleteSite(site.id)}
                  className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                >
                  <ICONS.Delete size={18} />
                </button>
              )}
            </div>
          </div>
        ))}

        {sites.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass rounded-[2rem] border-dashed border-white/10">
            <div className="text-slate-600 mb-4"><ICONS.Building size={48} /></div>
            <p className="text-slate-400 font-medium">No sites registered yet.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border border-white/10 shadow-2xl scale-in-center">
            <h3 className="text-2xl font-bold mb-6">Create New Site</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Site Name</label>
                <input 
                  type="text" 
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. Hyderabad Metro"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Location</label>
                <input 
                  type="text" 
                  value={newSite.location}
                  onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="e.g. Hyderabad"
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
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SitesPage;
