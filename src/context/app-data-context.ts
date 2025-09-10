import React from 'react';
import type { AppData } from '@/lib/types';
import { users, harvests, collectors, agronomistLogs, batches, collectorPaymentLogs } from '@/lib/data';

const defaultUser = users.find(u => u.role === 'Productor')!;

export const AppDataContext = React.createContext<AppData>({
  loading: true,
  currentUser: defaultUser,
  users: users,
  setCurrentUser: () => {},
  harvests: [],
  collectors: [],
  agronomistLogs: [],
  batches: [],
  collectorPaymentLogs: [],
  addHarvest: async () => {},
  editCollector: async () => {},
  deleteCollector: async () => {},
  addAgronomistLog: async () => {},
  editAgronomistLog: async () => {},
  deleteAgronomistLog: async () => {},
  addCollector: async () => {},
  addBatch: async () => {},
  deleteBatch: async () => {},
  addCollectorPaymentLog: async () => {},
  deleteCollectorPaymentLog: async () => {},
});

export const AppContextProvider = AppDataContext.Provider;
