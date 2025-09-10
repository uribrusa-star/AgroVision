'use client';

import React, { useActionState, useState, useContext, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { DollarSign, HardHat, Sprout, Tractor, Weight } from 'lucide-react';
import { engineerLogStats } from '@/lib/data';
import { handleSummarizeHarvest } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppDataContext } from '@/context/app-data-context';
import { ApplicationLogForm } from './application-log-form';
import type { AgronomistLog } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const initialState = {
  summary: '',
  loading: false,
};

function HarvestSummary() {
  const [state, formAction] = useActionState(handleSummarizeHarvest, initialState);
  const [showSummary, setShowSummary] = useState(false);
  const { harvests } = useContext(AppDataContext);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSummary(true);
    const formData = new FormData();
    formData.set('harvests', JSON.stringify(harvests));
    formAction(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Resumen de Cosecha con IA</CardTitle>
          <CardDescription>Genere un resumen completo de todos los datos de cosecha utilizando IA para identificar tendencias y perspectivas.</CardDescription>
        </CardHeader>
        {showSummary && (
          <CardContent>
            {state.loading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[75%]" />
              </div>
            )}
            {state.summary && (
              <Alert>
                <AlertTitle>Resumen Generado</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">{state.summary}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
        <CardFooter>
          <Button type="submit" disabled={state.loading}>
            {state.loading ? 'Generando...' : 'Generar Resumen'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

function ApplicationHistory() {
  const { agronomistLogs } = useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getTypeVariant = (type: AgronomistLog['type']) => {
    switch (type) {
      case 'Fertilización': return 'default';
      case 'Fumigación': return 'destructive';
      case 'Control': return 'secondary';
      default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
          <CardTitle>Historial de Aplicaciones</CardTitle>
          <CardDescription>Registro de todas las aplicaciones de productos y controles realizados.</CardDescription>
      </CardHeader>
      <CardContent>
          <Table>
              <TableHeader>
              <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto/Notas</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
              {agronomistLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No hay registros de aplicaciones.</TableCell>
                </TableRow>
              )}
              {agronomistLogs.map((log) => (
                  <TableRow key={log.id}>
                      <TableCell>{isClient ? new Date(log.date).toLocaleDateString('es-ES') : '...'}</TableCell>
                      <TableCell><Badge variant={getTypeVariant(log.type)}>{log.type}</Badge></TableCell>
                      <TableCell>
                        <p className="font-medium">{log.product}</p>
                        <p className="text-sm text-muted-foreground">{log.notes}</p>
                      </TableCell>
                  </TableRow>
              ))}
              </TableBody>
          </Table>
      </CardContent>
  </Card>
  )
}

export default function EngineerLogPage() {
  const { collectors } = useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <PageHeader
        title="Bitácora del Agrónomo"
        description="Validación cruzada avanzada y visión general de la producción."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Producción Total</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient ? engineerLogStats.totalProduction.toLocaleString('es-ES') : 'Cargando...'} kg</div>
            <p className="text-xs text-muted-foreground">Acumulado de la temporada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total de Insumos</CardTitle>
            <Tractor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isClient ? engineerLogStats.totalInputs.toLocaleString('es-ES') : 'Cargando...'}</div>
            <p className="text-xs text-muted-foreground">Fertilizantes, agua, etc.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Promedio/kg</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isClient ? engineerLogStats.averagePrice.toFixed(2) : '...'}</div>
            <p className="text-xs text-muted-foreground">Promedio de mercado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Recolectores</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectors.length}</div>
            <p className="text-xs text-muted-foreground">Activos esta temporada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        <ApplicationLogForm />
        <ApplicationHistory />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
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
                        {collectors.map((collector) => (
                            <TableRow key={collector.id}>
                            <TableCell className="font-medium">{collector.name}</TableCell>
                            <TableCell className="text-right">{isClient ? collector.totalHarvested.toLocaleString('es-ES') : '...'}</TableCell>
                            <TableCell className="text-right">{collector.hoursWorked}</TableCell>
                            <TableCell className="text-right font-bold">{isClient ? collector.productivity.toFixed(2) : '...'}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div>
          <HarvestSummary />
        </div>
      </div>
    </>
  );
}
