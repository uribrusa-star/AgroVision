
export type UserRole = 'Productor' | 'Ingeniero Agronomo' | 'Encargado';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
};

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
  harvestId: string;
  collectorId: string;
  collectorName: string;
  kilograms: number;
  hours: number;
  ratePerKg: number;
  payment: number;
}

export type EstablishmentData = {
  id: string;
  producer: string;
  technicalManager: string;
  location: {
    coordinates: string;
    locality: string;
    province: string;
  };
  area: {
    total: number;
    strawberry: number;
  };
  system: string;
  planting: {
    variety: string;
    date: string;
    origin: string;
    density: string;
    mulching: string;
  };
  soil: {
    type: string;
    analysis: boolean;
  };
  irrigation: {
    system: string;
    flowRate: string;
    frequency: string;
    waterAnalysis: boolean;
  };
  management: {
    weeds: string;
    sanitaryPlan: string;
  };
  harvest: {
    period: string;
    frequency: string;
    destination: string;
  };
  economics: {
    objective: string;
  };
};


export type AppData = {
  loading: boolean;
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  harvests: Harvest[];
  collectors: Collector[];
  agronomistLogs: AgronomistLog[];
  batches: Batch[];
  collectorPaymentLogs: CollectorPaymentLog[];
  establishmentData: EstablishmentData | null;
  addHarvest: (harvest: Omit<Harvest, 'id'>) => Promise<string | undefined>;
  editCollector: (collector: Collector) => Promise<void>;
  deleteCollector: (collectorId: string) => Promise<void>;
  addAgronomistLog: (log: Omit<AgronomistLog, 'id'>) => Promise<void>;
  editAgronomistLog: (log: AgronomistLog) => Promise<void>;
  deleteAgronomistLog: (logId: string) => Promise<void>;
  addCollector: (collector: Omit<Collector, 'id'>) => Promise<void>;
  addBatch: (batch: Omit<Batch, 'id' | 'status' | 'preloadedDate'> & { id: string, preloadedDate: string, status: string }) => Promise<void>;
  deleteBatch: (batchId: string) => Promise<void>;
  addCollectorPaymentLog: (log: Omit<CollectorPaymentLog, 'id'>) => Promise<void>;
  deleteCollectorPaymentLog: (logId: string) => Promise<void>;
  updateEstablishmentData: (data: Partial<EstablishmentData>) => Promise<void>;
  isClient: boolean;
};

