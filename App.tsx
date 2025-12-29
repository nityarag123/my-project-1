
import React, { useState, useEffect, useCallback } from 'react';
import { View, User, UserRole, Site, Truck, LogRecord, RecordType } from './types';
import * as Store from './store';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SitesPage from './pages/SitesPage';
import TrucksPage from './pages/TrucksPage';
import DetailsPage from './pages/DetailsPage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(Store.getCurrentUser());
  const [view, setView] = useState<View>(currentUser ? 'SITES' : 'LOGIN');
  
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
      setView('SITES');
    } else {
      alert('Invalid username or password. Try admin/admin123');
    }
  }, [allUsers]);

  const handleRegister = useCallback((userData: Omit<User, 'id'>) => {
    const isDuplicate = allUsers.some(u => u.username === userData.username || u.email === userData.email);
    if (isDuplicate) {
      alert('Username or email already exists.');
      return;
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`
    };

    setAllUsers(prev => [...prev, newUser]);
    alert('Registration successful! Please sign in.');
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

  // Persistence Handlers
  const addSite = (site: Omit<Site, 'id'>) => {
    const newSite = { ...site, id: `site-${Date.now()}` };
    setSites(prev => [...prev, newSite]);
  };

  const deleteSite = (id: string) => {
    setSites(prev => prev.filter(s => s.id !== id));
    setTrucks(prev => prev.filter(t => t.siteId !== id));
  };

  const addTruck = (truck: Omit<Truck, 'id'>) => {
    const newTruck = { ...truck, id: `truck-${Date.now()}` };
    setTrucks(prev => [...prev, newTruck]);
  };

  const deleteTruck = (id: string) => {
    setTrucks(prev => prev.filter(t => t.id !== id));
    setRecords(prev => prev.filter(r => r.truckId !== id));
  };

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
      {view === 'SITES' && (
        <SitesPage 
          sites={filteredSites} 
          role={currentUser.role}
          onSelectSite={(id) => {
            setSelectedSiteId(id);
            setView('TRUCKS');
          }}
          onAddSite={addSite}
          onDeleteSite={deleteSite}
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
          onAddTruck={addTruck}
          onDeleteTruck={deleteTruck}
        />
      )}

      {view === 'DETAILS' && activeTruck && (
        <DetailsPage 
          truck={activeTruck} 
          records={currentTruckRecords} 
          role={currentUser.role}
          onBack={() => setView('TRUCKS')}
          onAddRecord={addRecord}
          onDeleteRecord={deleteRecord}
        />
      )}
    </Layout>
  );
};

export default App;
