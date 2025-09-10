import React from 'react';
import type { AppData } from '@/lib/types';
import { harvests, collectors, agronomistLogs } from '@/lib/data';

export const AppDataContext = React.createContext<AppData>({
  harvests: harvests,
  collectors: collectors,
  agronomistLogs: agronomistLogs,
  addHarvest: () => {},
  editCollector: () => {},
  deleteCollector: () => {},
  addAgronomistLog: () => {},
  addCollector: () => {},
});

export const AppContextProvider = AppDataContext.Provider;
