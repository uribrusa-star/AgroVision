import type { Collector, Harvest, MonthlyData, AgronomistLog, Batch, CollectorPaymentLog, User } from './types';

export const users: User[] = [
  { id: 'user-productor', name: 'Productor Admin', email: 'productor@agrovision.co', role: 'Productor', avatar: 'user-1' },
  { id: 'user-agronomo', name: 'Ingeniero Agrónomo', email: 'agronomo@agrovision.co', role: 'Ingeniero Agronomo', avatar: 'user-2' },
  { id: 'user-encargado', name: 'Encargado de Campo', email: 'encargado@agrovision.co', role: 'Encargado', avatar: 'user-3' },
];

// The following are now just for type reference and initial structure,
// but the actual data will be fetched from Firestore.
export const collectors: Collector[] = [];
export const harvests: Harvest[] = [];
export const agronomistLogs: AgronomistLog[] = [];
export const batches: Batch[] = [];
export const collectorPaymentLogs: CollectorPaymentLog[] = [];
