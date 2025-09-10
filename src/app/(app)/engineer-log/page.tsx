
'use client';

import React, { useContext } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, HardHat, Package, Sprout, BarChart, Weight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import { ApplicationLogForm } from './application-log-form';
import { HarvestSummary } from './harvest-summary';
import { BatchYieldChart } from './batch-yield-chart';
import { ApplicationHistory } from './application-history';
import { MonthlyHarvestChart } from '../monthly-harvest-chart';


export default function EngineerLogPage() {
  const { loading, collectors, harvests, collectorPaymentLogs, batches, currentUser } = useContext(AppDataContext);
  
  const totalProduction = harvests.reduce((acc, h) => acc + h.kilograms, 0);
  
  // We need to calculate the average yield based on harvested batches, not all completed batches.
  // A batch is considered "harvested" if there's at least one harvest record for it.
  const harvestedBatchIds = [...new Set(harvests.map(h => h.batchNumber))];
  const totalKgInHarvestedBatches = harvestedBatchIds.reduce((total, batchId) => {
    const batchKilos = harvests.filter(h => h.batchNumber === batchId).reduce((sum, h) => sum + h.kilograms, 0);
    return total + batchKilos;
  }, 0);
  
  const averageYieldPerBatch = harvestedBatchIds.length > 0 ? totalKgInHarvestedBatches / harvestedBatchIds.length : 0;
  
  const canManageApplications = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo' || currentUser.role === 'Encargado';


  return (
    <>
      <PageHeader
        title="Bitácora del Agrónomo"
        description="Gestión de aplicaciones y visión general de la producción."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción Total</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : `${totalProduction.toLocaleString('es-ES')} kg`}</div>
            <p className="text-xs text-muted-foreground">Acumulado de la temporada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento Promedio/Lote</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : `${averageYieldPerBatch.toFixed(1)} kg`}</div>
            <p className="text-xs text-muted-foreground">Promedio en lotes cosechados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recolectores</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : collectors.length}</div>
            <p className="text-xs text-muted-foreground">Activos esta temporada</p>
          </CardContent>
        </Card>
      </div>

       <div className="mb-8">
          <div className="grid grid-cols-1 gap-8 mt-4">
            {canManageApplications ? <ApplicationLogForm /> : <Card><CardHeader><CardTitle>Acceso Denegado</CardTitle><CardContent><p>No tiene permisos para registrar aplicaciones.</p></CardContent></CardHeader></Card>}
            <ApplicationHistory />
          </div>
        </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        <div id="batch-yield-chart" className="lg:col-span-1">
           <BatchYieldChart />
        </div>
         <div id="monthly-harvest-chart-container" className="lg:col-span-1">
           <MonthlyHarvestChart harvests={harvests} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        <div>
           <HarvestSummary />
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Visión General de Productividad de Recolectores</CardTitle>
                    <CardDescription>Resumen del rendimiento de cada recolector.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">Total Cosechado (kg)</TableHead>
                            <TableHead className="text-right">Horas Trabajadas</TableHead>
                            <TableHead className="text-right">Productividad (kg/hr)</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading && (
                           <TableRow>
                            <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                           </TableRow>
                        )}
                        {!loading && collectors.map((collector) => (
                            <TableRow key={collector.id}>
                            <TableCell className="font-medium">{collector.name}</TableCell>
                            <TableCell className="text-right">{collector.totalHarvested.toLocaleString('es-ES')}</TableCell>
                            <TableCell className="text-right">{collector.hoursWorked.toLocaleString('es-ES')}</TableCell>
                            <TableCell className="text-right font-bold">{collector.productivity.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
