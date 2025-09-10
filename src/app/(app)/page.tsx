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


export default function DashboardPage() {
  const { harvests, collectors } = React.useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const calculateDashboardStats = (harvests: Harvest[]) => {
    if (harvests.length === 0) {
      return {
        totalHarvest: 0,
        averageYield: 0,
        peakDay: null,
      };
    }

    const totalHarvest = harvests.reduce((acc, h) => acc + h.kilograms, 0);
    const averageYield = totalHarvest / harvests.length;

    const dailyHarvests: { [key: string]: number } = harvests.reduce((acc, h) => {
      const date = new Date(h.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += h.kilograms;
      return acc;
    }, {} as { [key: string]: number });

    const peakDay = Object.keys(dailyHarvests).reduce((a, b) => dailyHarvests[a] > dailyHarvests[b] ? a : b);


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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cosecha Total</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient ? dashboardStats.totalHarvest.toLocaleString('es-ES', { maximumFractionDigits: 0 }) : 'Cargando...'} kg</div>
            <p className="text-xs text-muted-foreground">+15.2% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento Promedio</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient ? dashboardStats.averageYield.toLocaleString('es-ES', { maximumFractionDigits: 1 }) : 'Cargando...'} kg/lote</div>
            <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recolectores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{isClient ? dashboardStats.activeCollectors.toLocaleString('es-ES') : 'Cargando...'}</div>
            <p className="text-xs text-muted-foreground">Actualmente en el campo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Día Pico</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient && dashboardStats.peakDay ? new Date(dashboardStats.peakDay).toLocaleDateString('es-ES') : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Cosecha más alta esta temporada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-8">
        <MonthlyHarvestChart harvests={harvests} />

        <Card>
          <CardHeader>
            <CardTitle>Cosechas Recientes</CardTitle>
            <CardDescription>Una lista de las entradas de cosecha más recientes.</CardDescription>
          </CardHeader>
          <CardContent>
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
                {harvests.slice(0, 5).map((harvest) => (
                  <TableRow key={harvest.id}>
                    <TableCell>
                      <Badge variant="outline">{harvest.batchNumber}</Badge>
                    </TableCell>
                    <TableCell>{harvest.collector.name}</TableCell>
                    <TableCell className="text-right font-medium">{isClient ? harvest.kilograms.toLocaleString('es-ES') : '...'} kg</TableCell>
                    <TableCell className="text-right text-muted-foreground">{isClient ? new Date(harvest.date).toLocaleDateString('es-ES') : '...'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
