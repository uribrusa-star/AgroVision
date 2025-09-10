
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { BarChart as BarChartIcon, CalendarDays, Users, Weight } from "lucide-react";
import { MonthlyHarvestChart } from "./monthly-harvest-chart";
import { AppDataContext } from '@/context/app-data-context';
import type { Harvest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BatchYieldChart } from './engineer-log/batch-yield-chart';


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
      const date = new Date(h.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += h.kilograms;
      return acc;
    }, {} as { [key: string]: number });

    const peakDay = Object.keys(dailyHarvests).reduce((a, b) => dailyHarvests[a] > dailyHarvests[b] ? a : b, '');


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
  
  const sortedHarvests = [...harvests].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <PageHeader title="Panel de Control" description="Estadísticas clave y actividad reciente." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-24" /> : (dashboardStats.peakDay ? new Date(dashboardStats.peakDay).toLocaleDateString('es-ES', {timeZone: 'UTC'}) : 'N/A')}</div>
            <p className="text-xs text-muted-foreground">Cosecha más alta esta temporada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 mt-8">
        <div id="monthly-harvest-chart-container" className="lg:col-span-3">
          <MonthlyHarvestChart harvests={harvests} />
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
                    {loading && (
                    <TableRow>
                        <TableCell colSpan={4}><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                    )}
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
      </div>
      <div id="batch-yield-chart" className="mt-8">
        <BatchYieldChart />
      </div>
    </>
  );
}
