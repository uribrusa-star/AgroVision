import React from 'react';
import type { AppData, User } from '@/lib/types';
import { harvests, collectors, agronomistLogs, batches, collectorPaymentLogs, users } from '@/lib/data';

const defaultUser = users.find(u => u.role === 'Productor')!;

export const AppDataContext = React.createContext<AppData>({
  currentUser: defaultUser,
  users: users,
  setCurrentUser: () => {},
  harvests: harvests,
  collectors: collectors,
  agronomistLogs: agronomistLogs,
  batches: batches,
  collectorPaymentLogs: collectorPaymentLogs,
  addHarvest: () => {},
  editCollector: () => {},
  deleteCollector: () => {},
  addAgronomistLog: () => {},
  editAgronomistLog: () => {},
  deleteAgronomistLog: () => {},
  addCollector: () => {},
  addBatch: () => {},
  deleteBatch: () => {},
  addCollectorPaymentLog: () => {},
  deleteCollectorPaymentLog: () => {},
});

export const AppContextProvider = AppDataContext.Provider;
