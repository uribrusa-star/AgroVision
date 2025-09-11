import type { Collector, Harvest, MonthlyData, AgronomistLog, Batch, CollectorPaymentLog, User, EstablishmentData } from './types';

export const users: User[] = [
  { id: 'user-productor', name: 'Productor Admin', email: 'productor@agrovision.co', role: 'Productor', avatar: 'user-1', password: 'productor123' },
  { id: 'user-agronomo', name: 'Ingeniero Agrónomo', email: 'agronomo@agrovision.co', role: 'Ingeniero Agronomo', avatar: 'user-2', password: 'ingeniero123' },
  { id: 'user-encargado', name: 'Encargado de Campo', email: 'encargado@agrovision.co', role: 'Encargado', avatar: 'user-3', password: 'encargado123' },
];

export const initialEstablishmentData: Omit<EstablishmentData, 'id'> = {
  producer: "Finca Las Fresas",
  technicalManager: "Ing. Agr. Juan Pérez",
  location: {
    coordinates: "-26.83, -65.22",
    locality: "Lules",
    province: "Tucumán"
  },
  area: {
    total: 10, // ha
    strawberry: 5 // ha
  },
  system: "Bajo túnel",
  planting: {
    variety: "Camino Real, San Andreas",
    date: "2024-04-15",
    origin: "Vivero certificado 'Génesis'",
    density: "60,000 plantas/ha",
    mulching: "Plástico negro"
  },
  soil: {
    type: "Franco arcilloso",
    analysis: true
  },
  irrigation: {
    system: "Goteo",
    flowRate: "1.2 L/h por gotero",
    frequency: "3 veces por semana",
    waterAnalysis: true
  },
  management: {
    weeds: "Manual y cobertura plástica",
    sanitaryPlan: "Monitoreo semanal de plagas y enfermedades",
  },
  harvest: {
    period: "Agosto a Diciembre",
    frequency: "2-3 veces por semana",
    destination: "Mercado fresco local y mayorista"
  },
  economics: {
    objective: "Maximizar rendimiento y calidad para mercado fresco."
  },
  geoJsonData: "",
};


// The following are now just for type reference and initial structure,
// but the actual data will be fetched from Firestore.
export const collectors: Collector[] = [];
export const harvests: Harvest[] = [];
export const agronomistLogs: AgronomistLog[] = [];
export const batches: Batch[] = [];
export const collectorPaymentLogs: CollectorPaymentLog[] = [];
