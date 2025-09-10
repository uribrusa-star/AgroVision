'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { harvests, dashboardStats } from "@/lib/data";
import { BarChart as BarChartIcon, CalendarDays, Users, Weight } from "lucide-react";
import { MonthlyHarvestChart } from "./monthly-harvest-chart";


export default function DashboardPage() {
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
            <div className="text-2xl font-bold">{dashboardStats.totalHarvest.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">+15.2% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento Promedio</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.averageYield.toLocaleString()} kg/lote</div>
            <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recolectores Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardStats.activeCollectors}</div>
            <p className="text-xs text-muted-foreground">Actualmente en el campo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Día Pico</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(dashboardStats.peakDay).toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground">Cosecha más alta esta temporada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-8">
        <MonthlyHarvestChart />

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
                    <TableCell className="text-right font-medium">{harvest.kilograms} kg</TableCell>
                    <TableCell className="text-right text-muted-foreground">{new Date(harvest.date).toLocaleDateString()}</TableCell>
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
