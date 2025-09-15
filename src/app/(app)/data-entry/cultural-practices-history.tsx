
'use client';

import React, { useContext, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context.tsx';

export function CulturalPracticesHistory() {
  const { loading, culturalPracticeLogs } = useContext(AppDataContext);

  const sortedLogs = useMemo(() =>
    [...culturalPracticeLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [culturalPracticeLogs]
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Labores Pagadas</CardTitle>
        <CardDescription>Un registro de los últimos pagos por labores culturales.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-auto">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Personal</TableHead>
                  <TableHead>Labor</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && sortedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No hay registros de labores.</TableCell>
                  </TableRow>
                )}
                {!loading && sortedLogs.map(log => (
                  <TableRow key={log.id} className="cursor-pointer">
                    <TableCell>{new Date(log.date).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="font-medium">{log.personName}</TableCell>
                    <TableCell>{log.practiceType}</TableCell>
                    <TableCell className="text-right font-bold">${log.payment.toLocaleString('es-AR', {minimumFractionDigits: 2})}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
