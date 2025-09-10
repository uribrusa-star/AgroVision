
import React from 'react';
import type { AppData, ProducerLog, Transaction, User } from '@/lib/types';
import { users } from '@/lib/data';

export const AppDataContext = React.createContext<AppData>({
  loading: true,
  currentUser: null,
  users: users,
  setCurrentUser: () => {},
  harvests: [],
  collectors: [],
  agronomistLogs: [],
  phenologyLogs: [],
  batches: [],
  collectorPaymentLogs: [],
  establishmentData: null,
  producerLogs: [],
  transactions: [],
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
  addProducerLog: async () => {},
  addTransaction: async () => {},
  isClient: false,
});

export const AppContextProvider = AppDataContext.Provider;
