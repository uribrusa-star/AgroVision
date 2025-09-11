

export type UserRole = 'Productor' | 'Ingeniero Agronomo' | 'Encargado';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  password?: string; // Added for mock authentication
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

export type AgronomistLogType = 
    | 'Fertilización' 
    | 'Fumigación' 
    | 'Control' 
    | 'Sanidad'
    | 'Labor Cultural'
    | 'Riego'
    | 'Condiciones Ambientales';


export type AgronomistLog = {
    id: string;
    date: string;
    type: AgronomistLogType;
    batchId?: string;
    product?: string;
    notes: string;
    imageUrl?: string;
    imageHint?: string;
}

export type PhenologyLog = {
    id: string;
    date: string;
    developmentState: 'Floración' | 'Fructificación' | 'Maduración';
    batchId?: string;
    flowerCount?: number;
    fruitCount?: number;
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
  geoJsonData?: string;
};

export type ProducerLog = {
    id: string;
    date: string;
    notes: string;
}

export type Transaction = {
    id: string;
    date: string;
    type: 'Ingreso' | 'Gasto';
    category: string;
    description: string;
    amount: number;
}


export type AppData = {
  loading: boolean;
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  harvests: Harvest[];
  collectors: Collector[];
  agronomistLogs: AgronomistLog[];
  phenologyLogs: PhenologyLog[];
  batches: Batch[];
  collectorPaymentLogs: CollectorPaymentLog[];
  establishmentData: EstablishmentData | null;
  producerLogs: ProducerLog[];
  transactions: Transaction[];
  addHarvest: (harvest: Omit<Harvest, 'id'>, hoursWorked: number) => Promise<string | undefined>;
  editCollector: (collector: Collector) => Promise<void>;
  deleteCollector: (collectorId: string) => Promise<void>;
  addAgronomistLog: (log: Omit<AgronomistLog, 'id'>) => Promise<void>;
  editAgronomistLog: (log: AgronomistLog) => Promise<void>;
  deleteAgronomistLog: (logId: string) => Promise<void>;
  addPhenologyLog: (log: Omit<PhenologyLog, 'id'>) => Promise<void>;
  editPhenologyLog: (log: PhenologyLog) => Promise<void>;
  deletePhenologyLog: (logId: string) => Promise<void>;
  addCollector: (collector: Omit<Collector, 'id'>) => Promise<void>;
  addBatch: (batch: Omit<Batch, 'id' | 'status' | 'preloadedDate'> & { id: string, preloadedDate: string, status: string }) => Promise<void>;
  deleteBatch: (batchId: string) => Promise<void>;
  addCollectorPaymentLog: (log: Omit<CollectorPaymentLog, 'id'>) => Promise<void>;
  deleteCollectorPaymentLog: (logId: string) => Promise<void>;
  updateEstablishmentData: (data: Partial<EstablishmentData>) => Promise<void>;
  addProducerLog: (log: Omit<ProducerLog, 'id'>) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
  isClient: boolean;
};
