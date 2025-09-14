
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { BarChart as BarChartIcon, CalendarDays, DollarSign, Weight } from "lucide-react";
import { AppDataContext } from '@/context/app-data-context.tsx';
import type { Harvest, CollectorPaymentLog, PackagingLog } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BatchYieldChart } from '@/app/(app)/engineer-log/batch-yield-chart';
import { MonthlyHarvestChart } from '@/app/(app)/monthly-harvest-chart';
import { CostDistributionChart } from './cost-distribution-chart';
import { ProductionPaymentHistory } from '../production-payment-history';
import { PackagingHistory } from '../data-entry/packaging-history';


export default function DashboardPage() {
  const { loading, harvests, collectors, collectorPaymentLogs, packagingLogs } = React.useContext(AppDataContext);

  const calculateDashboardStats = (harvests: Harvest[], paymentLogs: CollectorPaymentLog[], packagingLogs: PackagingLog[]) => {
    if (harvests.length === 0) {
      return {
        totalHarvest: 0,
        averageYield: 0,
        peakDay: null,
        totalLaborCost: 0,
      };
    }

    const totalHarvest = harvests.reduce((acc, h) => acc + h.kilograms, 0);
    const totalHarvestLaborCost = (paymentLogs || []).reduce((acc, p) => acc + p.payment, 0);
    const totalPackagingLaborCost = (packagingLogs || []).reduce((acc, p) => acc + p.payment, 0);
    const totalLaborCost = totalHarvestLaborCost + totalPackagingLaborCost;
    
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
      totalLaborCost,
    };
  };
  

  const dashboardStats = calculateDashboardStats(harvests, collectorPaymentLogs, packagingLogs);
  const sortedHarvests = [...harvests].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
            <CardTitle className="text-sm font-medium">Costo de Mano de Obra</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : `$${dashboardStats.totalLaborCost.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}</div>
            <p className="text-xs text-muted-foreground">Cosecha + Embalaje</p>
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
            <CardTitle className="text-sm font-medium">Día Pico de Cosecha</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : (dashboardStats.peakDay || 'N/A')}</div>
            <p className="text-xs text-muted-foreground">El día más productivo</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <MonthlyHarvestChart harvests={harvests} />
        </div>
        <CostDistributionChart />
        <div className="lg:col-span-3">
          <BatchYieldChart />
        </div>
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
                    {loading && Array.from({ length: 3 }).map((_,i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                      </TableRow>
                    ))}
                    {!loading && sortedHarvests.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No hay cosechas recientes.</TableCell>
                        </TableRow>
                    )}
                    {!loading && sortedHarvests.slice(0, 5).map((harvest) => (
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
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Productividad</CardTitle>
                    <CardDescription>Resumen del rendimiento de cada recolector.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-right">kg/hr</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading && Array.from({ length: 3 }).map((_,i) => (
                           <TableRow key={i}>
                            <TableCell colSpan={2}><Skeleton className="h-8 w-full" /></TableCell>
                           </TableRow>
                        ))}
                        {!loading && [...collectors].sort((a,b) => b.productivity - a.productivity).map((collector) => (
                            <TableRow key={collector.id}>
                            <TableCell className="font-medium">{collector.name}</TableCell>
                            <TableCell className="text-right font-bold">{collector.productivity.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <ProductionPaymentHistory />
        <PackagingHistory />
      </div>
    </>
  );
}
