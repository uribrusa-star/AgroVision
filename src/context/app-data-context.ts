
import React from 'react';
import type { AppData } from '@/lib/types';
import { users } from '@/lib/data';

const defaultUser = users.find(u => u.role === 'Productor')!;

export const AppDataContext = React.createContext<AppData>({
  loading: true,
  currentUser: defaultUser,
  users: users,
  setCurrentUser: () => {},
  harvests: [],
  collectors: [],
  agronomistLogs: [],
  phenologyLogs: [],
  batches: [],
  collectorPaymentLogs: [],
  establishmentData: null,
  addHarvest: async () => {},
  editCollector: async () => {},
  deleteCollector: async () => {},
  addAgronomistLog: async () => {},
  editAgronomistLog: async () => {},
  deleteAgronomistLog: async () => {},
  addPhenologyLog: async () => {},
  editPhenologyLog: async () => {},
  deletePhenologyLog: async () => {},
  addCollector: async () => {},
  addBatch: async () => {},
  deleteBatch: async () => {},
  addCollectorPaymentLog: async () => {},
  deleteCollectorPaymentLog: async () => {},
  updateEstablishmentData: async () => {},
  isClient: false,
});

export const AppContextProvider = AppDataContext.Provider;

