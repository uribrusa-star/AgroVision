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

export type Batch = {
  id: string;
  preloadedDate: string;
  status: 'pending' | 'completed';
  completionDate?: string;
}

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

export type CollectorPaymentLog = {
  id: string;
  date: string;
  collectorId: string;
  collectorName: string;
  kilograms: number;
  hours: number;
  ratePerKg: number;
  payment: number;
}

export type AppData = {
  harvests: Harvest[];
  collectors: Collector[];
  agronomistLogs: AgronomistLog[];
  batches: Batch[];
  collectorPaymentLogs: CollectorPaymentLog[];
  addHarvest: (harvest: Harvest) => void;
  editCollector: (collector: Collector) => void;
  deleteCollector: (collectorId: string) => void;
  addAgronomistLog: (log: AgronomistLog) => void;
  editAgronomistLog: (log: AgronomistLog) => void;
  deleteAgronomistLog: (logId: string) => void;
  addCollector: (collector: Collector) => void;
  addBatch: (batch: Batch) => void;
  addCollectorPaymentLog: (log: CollectorPaymentLog) => void;
};
