import React from 'react';
import type { AppData } from '@/lib/types';
import { harvests, collectors, agronomistLogs, batches, collectorPaymentLogs } from '@/lib/data';

export const AppDataContext = React.createContext<AppData>({
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
