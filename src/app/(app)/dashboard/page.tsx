

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { BarChart as BarChartIcon, CalendarDays, Users, Weight } from "lucide-react";
import { AppDataContext } from '@/context/app-data-context';
import type { Harvest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BatchYieldChart } from '@/app/(app)/engineer-log/batch-yield-chart';
import { ProductionPaymentHistory } from '@/app/(app)/production-payment-history';
import { MonthlyHarvestChart } from '@/app/(app)/monthly-harvest-chart';


export default function DashboardPage() {
  const { loading, harvests, collectors } = React.useContext(AppDataContext);

  const calculateDashboardStats = (harvests: Harvest[]) => {
    if (harvests.length === 0) {
      return {
        totalHarvest: 0,
        averageYield: 0,
        peakDay: null,
      };
    }

    const totalHarvest = harvests.reduce((acc, h) => acc + h.kilograms, 0);
    
    const harvestsByBatch = harvests.reduce((acc, h) => {
        if (!acc[h.batchNumber]) {
            acc[h.batchNumber] = 0;
        }
        acc[h.batchNumber] += h.kilograms;
        return acc;
    }, {} as {[key: string]: number});

    const numberOfBatches = Object.keys(harvestsByBatch).length;
    const averageYield = numberOfBatches > 0 ? totalHarvest / numberOfBatches : 0;

    const dailyHarvests: { [key: string]: number } = harvests.reduce((acc, h) => {
      // Use local date string to avoid timezone issues with toISOString()
      const date = new Date(h.date).toLocaleDateString('es-ES');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += h.kilograms;
      return acc;
    }, {} as { [key: string]: number });

    const peakDay = Object.keys(dailyHarvests).length > 0
        ? Object.keys(dailyHarvests).reduce((a, b) => dailyHarvests[a] > dailyHarvests[b] ? a : b)
        : null;


    return {
      totalHarvest,
      averageYield,
      peakDay,
    };
  };
  

  const dashboardStats = {
    ...calculateDashboardStats(harvests),
    activeCollectors: collectors.length,
  };

  return (
    <>
      <PageHeader title="Panel de Control" description="Estadísticas clave y actividad reciente." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cosecha Total</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : `${dashboardStats.totalHarvest.toLocaleString('es-ES', { maximumFractionDigits: 0 })} kg`}</div>
            <p className="text-xs text-muted-foreground">Acumulado de la temporada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento Promedio</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : `${dashboardStats.averageYield.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg/lote`}</div>
            <p className="text-xs text-muted-foreground">Promedio por lote cosechado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recolectores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-12" /> : `+${dashboardStats.activeCollectors.toLocaleString('es-ES')}`}</div>
            <p className="text-xs text-muted-foreground">Actualmente en el campo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Día Pico</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : (dashboardStats.peakDay || 'N/A')}</div>
            <p className="text-xs text-muted-foreground">Cosecha más alta esta temporada</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <MonthlyHarvestChart harvests={harvests} />
        <BatchYieldChart />
        <div className="lg:col-span-2">
            <Card>
            <CardHeader>
                <CardTitle>Cosechas Recientes</CardTitle>
                <CardDescription>Una lista de las entradas de cosecha más recientes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-[300px] overflow-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Recolector</TableHead>
                    <TableHead className="text-right">Kilogramos</TableHead>
                    <TableHead>Fecha</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && (
                    <TableRow>
                        <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                    )}
                    {!loading && harvests.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No hay cosechas recientes.</TableCell>
                        </TableRow>
                    )}
                    {!loading && harvests.slice(0, 5).map((harvest) => (
                    <TableRow key={harvest.id}>
                        <TableCell>
                        <Badge variant="outline">{harvest.batchNumber}</Badge>
                        </TableCell>
                        <TableCell>{harvest.collector.name}</TableCell>
                        <TableCell className="text-right font-medium">{harvest.kilograms.toLocaleString('es-ES')} kg</TableCell>
                        <TableCell className="text-right text-muted-foreground">{new Date(harvest.date).toLocaleDateString('es-ES')}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                </div>
            </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
          <ProductionPaymentHistory />
        </div>
        <div className="lg:col-span-2">
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
