
'use client';

import React, { useContext, useMemo, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import { useToast } from '@/hooks/use-toast';

function ProductionPaymentHistoryComponent() {
  const { loading, collectorPaymentLogs, deleteCollectorPaymentLog, harvests, currentUser } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const canManage = currentUser?.role === 'Productor' || currentUser?.role === 'Encargado';

  const handleDelete = (logId: string) => {
    startTransition(async () => {
      await deleteCollectorPaymentLog(logId);
      toast({
          title: "Registro Eliminado",
          description: "El registro de producción y pago ha sido eliminado exitosamente.",
      });
    });
  }

  const sortedLogs = useMemo(() =>
    [...collectorPaymentLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [collectorPaymentLogs]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Producción y Pagos</CardTitle>
        <CardDescription>Un registro de todas las cosechas y los pagos calculados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-auto">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote</TableHead>
                  <TableHead>Recolector</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  {canManage && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3}>
                        <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && sortedLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3} className="text-center">No hay registros de producción.</TableCell>
                  </TableRow>
                )}
                {!loading && sortedLogs.map(log => {
                  const harvest = harvests.find(h => h.id === log.harvestId);
                  const batchNum = harvest ? harvest.batchNumber : "L???";
                  return (
                    <TableRow key={log.id}>
                      <TableCell><Badge variant="outline">{batchNum}</Badge></TableCell>
                      <TableCell className="font-medium">{log.collectorName}</TableCell>
                      <TableCell className="text-right font-bold">${log.payment.toLocaleString('es-AR', {minimumFractionDigits: 2})}</TableCell>
                      {canManage && (
                          <TableCell className="text-right">
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPending}>
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Eliminar</span>
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de producción y pago.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(log.id)}>Continuar</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                              </AlertDialog>
                          </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const ProductionPaymentHistory = React.memo(ProductionPaymentHistoryComponent);
