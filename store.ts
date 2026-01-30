
import { Site, Truck, LogRecord, User, UserRole, RecordType, TruckStatus } from './types';

const STORAGE_KEYS = {
  SITES: 'ip360_sites',
  TRUCKS: 'ip360_trucks',
  RECORDS: 'ip360_records',
  USER: 'ip360_user',
  ALL_USERS: 'ip360_all_users',
};

const INITIAL_SITES: Site[] = [
  { id: 'site-1', name: 'Vizag Smart City', location: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { id: 'site-2', name: 'Hyderabad Metro P2', location: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { id: 'site-3', name: 'Amaravati Infra', location: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', fullName: 'Fleet Director', email: 'admin@infrapulse.com', password: 'admin', role: UserRole.ADMIN },
  { id: 'u2', username: 'op1', fullName: 'Site Engineer 1', email: 'op1@infrapulse.com', password: 'op1', role: UserRole.OPERATOR, assignedSiteId: 'site-1' },
];

const INITIAL_TRUCKS: Truck[] = [
  { 
    id: 't1', 
    truckNumber: 'AP 31 TV 1234', 
    siteId: 'site-1', 
    status: TruckStatus.TRANSIT, 
    eta: '14:30 PM', 
    fuelLevel: 65, 
    lastMaintenance: '2025-01-10', 
    nextMaintenanceInKm: 1200 
  },
  { 
    id: 't2', 
    truckNumber: 'TS 09 XY 5678', 
    siteId: 'site-1', 
    status: TruckStatus.LOADING, 
    fuelLevel: 42, 
    lastMaintenance: '2024-12-15', 
    nextMaintenanceInKm: 150 
  },
  { 
    id: 't3', 
    truckNumber: 'AP 16 AB 9012', 
    siteId: 'site-2', 
    status: TruckStatus.MAINTENANCE, 
    fuelLevel: 12, 
    lastMaintenance: '2025-02-01', 
    nextMaintenanceInKm: 0 
  },
];

const INITIAL_RECORDS: LogRecord[] = [
  { id: 'r1', truckId: 't1', material: 'Structural Steel', quantity: '12 Tons', type: RecordType.LOADING, timestamp: new Date().toISOString() },
  { id: 'r2', truckId: 't1', material: 'Delivery Manifest', quantity: 'N/A', type: RecordType.POD, timestamp: new Date().toISOString(), podImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400', notes: 'Received by Site Lead' },
];

export const getStoredSites = (): Site[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SITES);
  return data ? JSON.parse(data) : INITIAL_SITES;
};

export const saveSites = (sites: Site[]) => {
  localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
};

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
  return data ? JSON.parse(data) : INITIAL_USERS;
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
};

export const getStoredTrucks = (): Truck[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRUCKS);
  return data ? JSON.parse(data) : INITIAL_TRUCKS;
};

export const saveTrucks = (trucks: Truck[]) => {
  localStorage.setItem(STORAGE_KEYS.TRUCKS, JSON.stringify(trucks));
};

export const getStoredRecords = (): LogRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
  return data ? JSON.parse(data) : INITIAL_RECORDS;
};

export const saveRecords = (records: LogRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};
