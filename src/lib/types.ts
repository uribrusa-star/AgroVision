export type Collector = {
  id: string;
  name: string;
  avatar: string;
  totalHarvested: number; // in kg
  hoursWorked: number;
  productivity: number; // kg per hour
  joinDate: string;
};

export type Harvest = {
  id: string;
  date: string;
  batchNumber: string;
  kilograms: number;
  collector: {
    id: string;
    name: string;
  };
};

export type MonthlyData = {
  month: string;
  total: number;
};

export type EngineerLogStats = {
  totalProduction: number;
  totalInputs: number;
  averagePrice: number;
  collectorCount: number;
};

export type AgronomistLog = {
    id: string;
    date: string;
    type: 'Fertilización' | 'Fumigación' | 'Control';
    product?: string;
    notes: string;
    imageUrl?: string;
    imageHint?: string;
}

export type AppData = {
  harvests: Harvest[];
  collectors: Collector[];
  agronomistLogs: AgronomistLog[];
  addHarvest: (harvest: Harvest) => void;
  editCollector: (collector: Collector) => void;
  deleteCollector: (collectorId: string) => void;
  addAgronomistLog: (log: AgronomistLog) => void;
  addCollector: (collector: Collector) => void;
};
