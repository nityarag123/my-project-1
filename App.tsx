
import React, { useState, useEffect, useCallback } from 'react';
import { View, User, UserRole, Site, Truck, LogRecord, RecordType, TruckStatus } from './types';
import * as Store from './store';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SitesPage from './pages/SitesPage';
import TrucksPage from './pages/TrucksPage';
import DetailsPage from './pages/DetailsPage';
import FleetDashboard from './pages/FleetDashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(Store.getCurrentUser());
  const [view, setView] = useState<View>(currentUser ? 'FLEET_DASHBOARD' : 'LOGIN');
  
  const [sites, setSites] = useState<Site[]>(Store.getStoredSites());
  const [trucks, setTrucks] = useState<Truck[]>(Store.getStoredTrucks());
  const [records, setRecords] = useState<LogRecord[]>(Store.getStoredRecords());
  const [allUsers, setAllUsers] = useState<User[]>(Store.getStoredUsers());

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  useEffect(() => {
    Store.saveSites(sites);
  }, [sites]);

  useEffect(() => {
    Store.saveTrucks(trucks);
  }, [trucks]);

  useEffect(() => {
    Store.saveRecords(records);
  }, [records]);

  useEffect(() => {
    Store.saveUsers(allUsers);
  }, [allUsers]);

  const handleLogin = useCallback((usernameOrEmail: string, password: string) => {
    const user = allUsers.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
      u.password === password
    );

    if (user) {
      setCurrentUser(user);
      Store.setCurrentUser(user);
      setView('FLEET_DASHBOARD');
    } else {
      alert('Invalid access credentials.');
    }
  }, [allUsers]);

  const handleRegister = useCallback((userData: Omit<User, 'id'>) => {
    const isDuplicate = allUsers.some(u => u.username === userData.username || u.email === userData.email);
    if (isDuplicate) {
      alert('Identity conflict detected.');
      return;
    }
    const newUser: User = { ...userData, id: `user-${Date.now()}` };
    setAllUsers(prev => [...prev, newUser]);
    alert('Deployment request submitted. Proceed to login.');
    setView('LOGIN');
  }, [allUsers]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    Store.setCurrentUser(null);
    setView('LOGIN');
    setSelectedSiteId(null);
    setSelectedTruckId(null);
  }, []);

  const filteredSites = currentUser?.role === UserRole.OPERATOR && currentUser.assignedSiteId
    ? sites.filter(s => s.id === currentUser.assignedSiteId)
    : sites;

  const currentSiteTrucks = trucks.filter(t => t.siteId === selectedSiteId);
  const currentTruckRecords = records.filter(r => r.truckId === selectedTruckId);

  const activeSite = sites.find(s => s.id === selectedSiteId);
  const activeTruck = trucks.find(t => t.id === selectedTruckId);

  // Handlers
  const addRecord = (record: Omit<LogRecord, 'id' | 'timestamp'>) => {
    const newRecord = { 
      ...record, 
      id: `record-${Date.now()}`, 
      timestamp: new Date().toISOString() 
    };
    setRecords(prev => [newRecord, ...prev]);
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  if (view === 'LOGIN' && !currentUser) {
    return <LoginPage onLogin={handleLogin} onNavigateRegister={() => setView('REGISTER')} />;
  }

  if (view === 'REGISTER' && !currentUser) {
    return <RegisterPage sites={sites} onRegister={handleRegister} onNavigateLogin={() => setView('LOGIN')} />;
  }

  if (!currentUser) return <LoginPage onLogin={handleLogin} onNavigateRegister={() => setView('REGISTER')} />;

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      onNavigate={(v) => {
        setView(v);
        setSelectedSiteId(null);
        setSelectedTruckId(null);
      }}
      currentView={view}
    >
      {view === 'FLEET_DASHBOARD' && (
        <FleetDashboard 
          sites={sites} 
          trucks={trucks} 
          onSelectTruck={(id) => {
            setSelectedTruckId(id);
            setView('DETAILS');
          }}
        />
      )}

      {view === 'SITES' && (
        <SitesPage 
          sites={filteredSites} 
          role={currentUser.role}
          onSelectSite={(id) => {
            setSelectedSiteId(id);
            setView('TRUCKS');
          }}
          onAddSite={(s) => setSites([...sites, { ...s, id: `site-${Date.now()}` }])}
          onDeleteSite={(id) => setSites(sites.filter(s => s.id !== id))}
        />
      )}

      {view === 'TRUCKS' && activeSite && (
        <TrucksPage 
          site={activeSite} 
          trucks={currentSiteTrucks} 
          role={currentUser.role}
          onSelectTruck={(id) => {
            setSelectedTruckId(id);
            setView('DETAILS');
          }}
          onBack={() => setView('SITES')}
          onAddTruck={(t) => setTrucks([...trucks, { ...t, id: `truck-${Date.now()}`, status: TruckStatus.IDLE, fuelLevel: 100, lastMaintenance: new Date().toISOString().split('T')[0], nextMaintenanceInKm: 2000 }])}
          onDeleteTruck={(id) => setTrucks(trucks.filter(t => t.id !== id))}
        />
      )}

      {view === 'DETAILS' && activeTruck && (
        <DetailsPage 
          truck={activeTruck} 
          records={currentTruckRecords} 
          role={currentUser.role}
          onBack={() => setView('FLEET_DASHBOARD')}
          onAddRecord={addRecord}
          onDeleteRecord={deleteRecord}
        />
      )}
    </Layout>
  );
};

export default App;
