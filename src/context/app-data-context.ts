import React from 'react';
import type { AppData } from '@/lib/types';
import { harvests, collectors, agronomistLogs, batches } from '@/lib/data';

export const AppDataContext = React.createContext<AppData>({
  harvests: harvests,
  collectors: collectors,
  agronomistLogs: agronomistLogs,
  batches: batches,
  addHarvest: () => {},
  editCollector: () => {},
  deleteCollector: () => {},
  addAgronomistLog: () => {},
  editAgronomistLog: () => {},
  deleteAgronomistLog: () => {},
  addCollector: () => {},
  addBatch: () => {},
});

export const AppContextProvider = AppDataContext.Provider;
