
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  CUSTOMER = 'CUSTOMER',
}

export enum TruckStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  TRANSIT = 'TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
  ASSIGNED = 'ASSIGNED',
}

export enum BookingStatus {
  SEARCHING = 'SEARCHING',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED_PICKUP = 'ARRIVED_PICKUP',
  LOADING = 'LOADING',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_DROP = 'ARRIVED_DROP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum ServicePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum SpecialHandling {
  NONE = 'NONE',
  FRAGILE = 'FRAGILE',
  REFRIGERATED = 'REFRIGERATED',
  HAZARDOUS = 'HAZARDOUS'
}

export interface ServiceTask {
  id: string;
  description: string;
  isCompleted: boolean;
}

export interface ServiceRequest {
  id: string;
  truckId: string;
  type: string;
  priority: ServicePriority;
  description: string;
  estimatedCost: number;
  expectedDate: string;
  status: ServiceStatus;
  tasks: ServiceTask[];
  timestamp: string;
}

export interface VehicleType {
  id: string;
  name: string;
  capacity: string;
  dimensions: string;
  basePriceKm: number;
  waitingChargeHr: number;
  icon: string;
  description: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  vehicleTypeId: string;
  truckId?: string;
  pickup: string;
  drop: string;
  loadType: string;
  weight: string;
  specialHandling: SpecialHandling;
  notes?: string;
  status: BookingStatus;
  price: number;
  timestamp: string;
  driverName?: string;
  driverPhone?: string;
  podUrl?: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  queue: string[]; 
  productivityScore: number;
  activeTrips: number;
}

export interface Truck {
  id: string;
  truckNumber: string;
  siteId: string;
  vehicleTypeId: string;
  status: TruckStatus;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenanceInKm: number;
  healthIndex: number;
  driverName: string;
  driverPhone: string;
  eta?: string;
}

export enum RecordType {
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING',
  POD = 'POD',
  MAINTENANCE = 'MAINTENANCE',
  ISSUE = 'ISSUE'
}

export interface LogRecord {
  id: string;
  truckId: string;
  material: string;
  quantity: string;
  type: RecordType;
  timestamp: string;
  gps?: { lat: number, lng: number };
  notes?: string;
  podImageUrl?: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  assignedSiteId?: string;
}

export type View = 'LOGIN' | 'REGISTER' | 'SITES' | 'TRUCKS' | 'DETAILS' | 'FLEET_DASHBOARD' | 'CUSTOMER_HOME' | 'VEHICLE_MGMT' | 'BOOKING_DISPATCH';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  sources?: { title: string; uri: string }[];
}
