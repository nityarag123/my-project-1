
import React, { useState, useEffect, useCallback } from 'react';
import { View, User, UserRole, Site, Truck, LogRecord, RecordType, TruckStatus, Booking, VehicleType, BookingStatus, ServiceRequest } from './types';
import * as Store from './store';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SitesPage from './pages/SitesPage';
import TrucksPage from './pages/TrucksPage';
import DetailsPage from './pages/DetailsPage';
import FleetDashboard from './pages/FleetDashboard';
import CustomerModule from './pages/CustomerModule';
import VehicleManagement from './pages/VehicleManagement';
import BookingDispatch from './pages/BookingDispatch';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(Store.getCurrentUser());
  const [view, setView] = useState<View>(currentUser?.role === UserRole.CUSTOMER ? 'CUSTOMER_HOME' : currentUser ? 'FLEET_DASHBOARD' : 'LOGIN');
  
  const [sites, setSites] = useState<Site[]>(Store.getStoredSites());
  const [trucks, setTrucks] = useState<Truck[]>(Store.getStoredTrucks());
  const [records, setRecords] = useState<LogRecord[]>(Store.getStoredRecords());
  const [allUsers, setAllUsers] = useState<User[]>(Store.getStoredUsers());
  const [bookings, setBookings] = useState<Booking[]>(Store.getStoredBookings());
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(Store.getStoredVehicleTypes());
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(Store.getStoredServiceRequests());

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  useEffect(() => {
    Store.saveSites(sites);
    Store.saveTrucks(trucks);
    Store.saveRecords(records);
    Store.saveUsers(allUsers);
    Store.saveBookings(bookings);
    Store.saveVehicleTypes(vehicleTypes);
    Store.saveServiceRequests(serviceRequests);
  }, [sites, trucks, records, allUsers, bookings, vehicleTypes, serviceRequests]);

  const handleLogin = useCallback((usernameOrEmail: string, password: string) => {
    const user = allUsers.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
      u.password === password
    );

    if (user) {
      setCurrentUser(user);
      Store.setCurrentUser(user);
      setView(user.role === UserRole.CUSTOMER ? 'CUSTOMER_HOME' : 'FLEET_DASHBOARD');
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

  const handleAssignBooking = (bookingId: string, truckId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: BookingStatus.ASSIGNED, truckId } : b
    ));
    setTrucks(prev => prev.map(t => 
      t.id === truckId ? { ...t, status: TruckStatus.ASSIGNED } : t
    ));
    
    const targetTruck = trucks.find(t => t.id === truckId);
    if (targetTruck) {
      setSites(prev => prev.map(s => s.id === targetTruck.siteId ? { ...s, queue: [...s.queue, truckId] } : s));
    }
  };

  const filteredSites = currentUser?.role === UserRole.OPERATOR && currentUser.assignedSiteId
    ? sites.filter(s => s.id === currentUser.assignedSiteId)
    : sites;

  const currentSiteTrucks = trucks.filter(t => t.siteId === selectedSiteId);
  const currentTruckRecords = records.filter(r => r.truckId === selectedTruckId);

  const activeSite = sites.find(s => s.id === selectedSiteId);
  const activeTruck = trucks.find(t => t.id === selectedTruckId);

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
      {view === 'CUSTOMER_HOME' && (
        <CustomerModule 
          user={currentUser} 
          bookings={bookings.filter(b => b.customerId === currentUser.id)}
          vehicleTypes={vehicleTypes}
          trucks={trucks}
          serviceRequests={serviceRequests}
          onAddBooking={(b) => setBookings([b, ...bookings])}
          onUpdateBooking={(u) => setBookings(bookings.map(b => b.id === u.id ? u : b))}
        />
      )}

      {view === 'VEHICLE_MGMT' && (
        <VehicleManagement 
          vehicleTypes={vehicleTypes}
          onUpdateTypes={setVehicleTypes}
          role={currentUser.role}
        />
      )}

      {view === 'BOOKING_DISPATCH' && (
        <BookingDispatch 
          bookings={bookings}
          trucks={trucks}
          vehicleTypes={vehicleTypes}
          onAssign={handleAssignBooking}
        />
      )}

      {view === 'FLEET_DASHBOARD' && (
        <FleetDashboard 
          sites={sites} 
          trucks={trucks} 
          users={allUsers}
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
          onAddSite={(s) => setSites([...sites, { ...s, id: `site-${Date.now()}`, productivityScore: 0, activeTrips: 0, lat:0, lng:0, queue: [] }])}
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
          onAddTruck={(t) => setTrucks([...trucks, { ...t, id: `truck-${Date.now()}`, vehicleTypeId: 'v1', status: TruckStatus.IDLE, fuelLevel: 100, lastMaintenance: new Date().toISOString(), nextMaintenanceInKm: 1500, healthIndex: 100 }])}
          onDeleteTruck={(id) => setTrucks(trucks.filter(t => t.id !== id))}
        />
      )}

      {view === 'DETAILS' && activeTruck && (
        <DetailsPage 
          truck={activeTruck} 
          records={currentTruckRecords} 
          serviceRequests={serviceRequests.filter(s => s.truckId === activeTruck.id)}
          role={currentUser.role}
          onBack={() => setView('FLEET_DASHBOARD')}
          onAddRecord={(r) => setRecords([{ ...r, id: `r-${Date.now()}`, timestamp: new Date().toISOString() }, ...records])}
          onDeleteRecord={(id) => setRecords(records.filter(r => r.id !== id))}
          onAddServiceRequest={(s) => setServiceRequests([s, ...serviceRequests])}
          onUpdateServiceRequest={(s) => setServiceRequests(serviceRequests.map(item => item.id === s.id ? s : item))}
        />
      )}
    </Layout>
  );
};

export default App;
