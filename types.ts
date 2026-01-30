
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export enum TruckStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  TRANSIT = 'TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Site {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
}

export interface Truck {
  id: string;
  truckNumber: string;
  siteId: string;
  status: TruckStatus;
  eta?: string;
  fuelLevel: number; // 0-100
  lastMaintenance: string;
  nextMaintenanceInKm: number;
}

export enum RecordType {
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING',
  POD = 'POD',
}

export interface LogRecord {
  id: string;
  truckId: string;
  material: string;
  quantity: string;
  type: RecordType;
  timestamp: string;
  podImageUrl?: string;
  signature?: string;
  notes?: string;
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

export type View = 'LOGIN' | 'REGISTER' | 'SITES' | 'TRUCKS' | 'DETAILS' | 'FLEET_DASHBOARD';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
  isThinking?: boolean;
}
