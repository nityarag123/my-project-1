
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export interface Site {
  id: string;
  name: string;
  location: string;
}

export interface Truck {
  id: string;
  truckNumber: string;
  siteId: string;
}

export enum RecordType {
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING',
}

export interface LogRecord {
  id: string;
  truckId: string;
  material: string;
  quantity: string;
  type: RecordType;
  timestamp: string;
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

export type View = 'LOGIN' | 'REGISTER' | 'SITES' | 'TRUCKS' | 'DETAILS';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: Array<{ title: string; uri: string }>;
  isThinking?: boolean;
}
