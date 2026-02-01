
import { Site, Truck, LogRecord, User, UserRole, RecordType, TruckStatus, VehicleType, Booking, ServiceRequest } from './types';

const STORAGE_KEYS = {
  SITES: 'ip360_sites',
  TRUCKS: 'ip360_trucks',
  RECORDS: 'ip360_records',
  USER: 'ip360_user',
  ALL_USERS: 'ip360_all_users',
  BOOKINGS: 'ip360_bookings',
  VEHICLE_TYPES: 'ip360_vehicle_catalog',
  SERVICE_REQUESTS: 'ip360_service_requests',
};

const INITIAL_VEHICLE_TYPES: VehicleType[] = [
  { id: 'v1', name: 'Auto 3-Wheeler', capacity: '500 KG', dimensions: '4x3x3 ft', basePriceKm: 15, waitingChargeHr: 50, icon: 'Truck', description: 'Perfect for small city deliveries.', isActive: true },
  { id: 'v2', name: 'Mini Truck (Tata Ace)', capacity: '1.5 Tons', dimensions: '7x4.5x5 ft', basePriceKm: 25, waitingChargeHr: 100, icon: 'Truck', description: 'The "Chota Hathi" for bulk goods.', isActive: true },
  { id: 'v3', name: 'Tempo (Eicher)', capacity: '4 Tons', dimensions: '14x7x7 ft', basePriceKm: 45, waitingChargeHr: 200, icon: 'Truck', description: 'Ideal for medium warehouse shifts.', isActive: true },
  { id: 'v6', name: 'Container Truck', capacity: '32 Tons', dimensions: '40x8x8.5 ft', basePriceKm: 150, waitingChargeHr: 800, icon: 'Truck', description: 'Maximum safety for sensitive cargo.', isActive: true },
];

export const getStoredVehicleTypes = (): VehicleType[] => {
  const data = localStorage.getItem(STORAGE_KEYS.VEHICLE_TYPES);
  return data ? JSON.parse(data) : INITIAL_VEHICLE_TYPES;
};

export const saveVehicleTypes = (types: VehicleType[]) => {
  localStorage.setItem(STORAGE_KEYS.VEHICLE_TYPES, JSON.stringify(types));
};

export const getStoredBookings = (): Booking[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return data ? JSON.parse(data) : [];
};

export const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
};

export const getStoredServiceRequests = (): ServiceRequest[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SERVICE_REQUESTS);
  return data ? JSON.parse(data) : [];
};

export const saveServiceRequests = (requests: ServiceRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests));
};

export const getStoredSites = (): Site[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SITES);
  return data ? JSON.parse(data) : [
    { id: 'site-1', name: 'Hyderabad Metro Phase 2', location: 'Hyderabad', lat: 17.3850, lng: 78.4867, queue: [], productivityScore: 88, activeTrips: 12 },
    { id: 'site-2', name: 'Bengaluru IT Corridor', location: 'Bengaluru', lat: 12.9716, lng: 77.5946, queue: [], productivityScore: 92, activeTrips: 8 }
  ];
};

export const saveSites = (sites: Site[]) => {
  localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(sites));
};

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
  const initialUsers: User[] = [
    { id: 'u1', username: 'admin', fullName: 'Fleet Director', email: 'admin@infrapulse.com', password: 'admin', role: UserRole.ADMIN },
    { id: 'u2', username: 'op1', fullName: 'Site Engineer 1', email: 'op1@infrapulse.com', password: 'op1', role: UserRole.OPERATOR, assignedSiteId: 'site-1' },
    { id: 'u3', username: 'cust1', fullName: 'Rohan Sharma', email: 'rohan@gmail.com', password: 'cust1', role: UserRole.CUSTOMER },
  ];
  return data ? JSON.parse(data) : initialUsers;
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
};

export const getStoredTrucks = (): Truck[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRUCKS);
  return data ? JSON.parse(data) : [];
};

export const saveTrucks = (trucks: Truck[]) => {
  localStorage.setItem(STORAGE_KEYS.TRUCKS, JSON.stringify(trucks));
};

export const getStoredRecords = (): LogRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
  return data ? JSON.parse(data) : [];
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
