import type { Collector, Harvest, MonthlyData, AgronomistLog, Batch, CollectorPaymentLog } from './types';

export const collectors: Collector[] = [
  { id: '1', name: 'Ana García', avatar: '1', totalHarvested: 1250, hoursWorked: 160, productivity: 7.8, joinDate: '2023-01-15' },
  { id: '2', name: 'Carlos Martinez', avatar: '2', totalHarvested: 980, hoursWorked: 140, productivity: 7.0, joinDate: '2023-02-20' },
  { id: '3', name: 'Sofía Rodríguez', avatar: '3', totalHarvested: 1520, hoursWorked: 180, productivity: 8.4, joinDate: '2022-11-10' },
  { id: '4', name: 'Javier Hernandez', avatar: '4', totalHarvested: 810, hoursWorked: 115, productivity: 7.04, joinDate: '2023-03-05' },
  { id: '5', name: 'Isabel Lopez', avatar: '5', totalHarvested: 1340, hoursWorked: 170, productivity: 7.88, joinDate: '2023-01-25' },
];

export const harvests: Harvest[] = [
  { id: 'H001', date: '2024-07-22', batchNumber: 'L012', kilograms: 120, collector: { id: '1', name: 'Ana García' } },
  { id: 'H002', date: '2024-07-22', batchNumber: 'L013', kilograms: 95, collector: { id: '2', name: 'Carlos Martinez' } },
  { id: 'H003', date: '2024-07-21', batchNumber: 'L010', kilograms: 150, collector: { id: '3', name: 'Sofía Rodríguez' } },
  { id: 'H004', date: '2024-07-21', batchNumber: 'L011', kilograms: 88, collector: { id: '4', name: 'Javier Hernandez' } },
  { id: 'H005', date: '2024-07-20', batchNumber: 'L009', kilograms: 130, collector: { id: '5', name: 'Isabel Lopez' } },
  { id: 'H006', date: '2024-07-20', batchNumber: 'L008', kilograms: 110, collector: { id: '1', name: 'Ana García' } },
];

export const agronomistLogs: AgronomistLog[] = [
    { id: 'LOG001', date: '2024-07-21', type: 'Fertilización', product: 'Nitrato de potasio', notes: 'Aplicación foliar en dosis de 2kg/ha.', imageUrl: 'https://picsum.photos/seed/fertilizer/400/300', imageHint: 'fertilizer bag' },
    { id: 'LOG002', date: '2024-07-19', type: 'Fumigación', product: 'Abamectina', notes: 'Control de araña roja, se observa baja incidencia.', imageUrl: 'https://picsum.photos/seed/pest/400/300', imageHint: 'strawberry pest' },
    { id: 'LOG003', date: '2024-07-18', type: 'Control', notes: 'Monitoreo de trampas de esporas. Sin presencia de Botrytis.' },
]

export const batches: Batch[] = [
    { id: 'L014', preloadedDate: '2024-07-23', status: 'pending' },
    { id: 'L015', preloadedDate: '2024-07-23', status: 'pending' },
    { id: 'L016', preloadedDate: '2024-07-23', status: 'pending' },
    { id: 'L012', preloadedDate: '2024-07-21', status: 'completed', completionDate: '2024-07-22' },
    { id: 'L013', preloadedDate: '2024-07-21', status: 'completed', completionDate: '2024-07-22' },
    { id: 'L010', preloadedDate: '2024-07-20', status: 'completed', completionDate: '2024-07-21' },
    { id: 'L011', preloadedDate: '2024-07-20', status: 'completed', completionDate: '2024-07-21' },
    { id: 'L009', preloadedDate: '2024-07-19', status: 'completed', completionDate: '2024-07-20' },
    { id: 'L008', preloadedDate: '2024-07-19', status: 'completed', completionDate: '2024-07-20' },
];

export const collectorPaymentLogs: CollectorPaymentLog[] = [];

export const monthlyData: MonthlyData[] = [
  { month: 'Ene', total: 1200 },
  { month: 'Feb', total: 1800 },
  { month: 'Mar', total: 2200 },
  { month: 'Abr', total: 2780 },
  { month: 'May', total: 3200 },
  { month: 'Jun', total: 3100 },
  { month: 'Jul', total: 2900 },
];

export const dashboardStats = {
  totalHarvest: 14780,
  averageYield: 115.6,
  activeCollectors: 5,
  peakDay: '2024-05-18',
};
