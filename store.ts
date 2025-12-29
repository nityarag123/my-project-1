
import { Site, Truck, LogRecord, User, UserRole, RecordType } from './types';

const STORAGE_KEYS = {
  SITES: 'kvr_sites',
  TRUCKS: 'kvr_trucks',
  RECORDS: 'kvr_records',
  USER: 'kvr_user',
  ALL_USERS: 'kvr_all_users',
};

const INITIAL_SITES: Site[] = [
  { id: 'site-1', name: 'Vizag Smart City Project', location: 'Visakhapatnam' },
  { id: 'site-2', name: 'Hyderabad Metro Phase 2', location: 'Hyderabad' },
  { id: 'site-3', name: 'Amaravati Infra Development', location: 'Vijayawada' },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', fullName: 'System Administrator', email: 'admin@kvrinfra.com', password: 'admin123', role: UserRole.ADMIN },
  { id: 'u2', username: 'op1', fullName: 'Site Operator 1', email: 'op1@kvrinfra.com', password: 'op123', role: UserRole.OPERATOR, assignedSiteId: 'site-1' },
];

const INITIAL_TRUCKS: Truck[] = [
  { id: 't1', truckNumber: 'AP 31 TV 1234', siteId: 'site-1' },
  { id: 't2', truckNumber: 'TS 09 XY 5678', siteId: 'site-1' },
  { id: 't3', truckNumber: 'AP 16 AB 9012', siteId: 'site-2' },
];

const INITIAL_RECORDS: LogRecord[] = [
  { id: 'r1', truckId: 't1', material: 'Cement', quantity: '20 Tons', type: RecordType.LOADING, timestamp: new Date().toISOString() },
  { id: 'r2', truckId: 't1', material: 'Sand', quantity: '15 Tons', type: RecordType.UNLOADING, timestamp: new Date().toISOString() },
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
