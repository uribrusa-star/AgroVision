import React from 'react';
import type { AppData } from '@/lib/types';
import { harvests, collectors } from '@/lib/data';

export const AppDataContext = React.createContext<AppData>({
  harvests: harvests,
  collectors: collectors,
  addHarvest: () => {},
});

export const AppContextProvider = AppDataContext.Provider;
