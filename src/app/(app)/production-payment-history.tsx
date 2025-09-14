

'use client';

import React, { useContext, useMemo, useTransition, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, HardHat, Info, Trash2, Weight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { useToast } from '@/hooks/use-toast';
import type { JuntadorPaymentLog } from '@/lib/types';

function ProductionPaymentHistoryComponent() {
  const { loading, juntadorPaymentLogs, deleteJuntadorPaymentLog, harvests, currentUser } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedLog, setSelectedLog] = useState<JuntadorPaymentLog | null>(null);

  const canManage = currentUser?.role === 'Productor' || currentUser?.role === 'Encargado';

  const handleDelete = (logId: string) => {
    startTransition(async () => {
      await deleteJuntadorPaymentLog(logId);
      toast({
          title: "Registro Eliminado",
          description: "El registro de producción y pago ha sido eliminado exitosamente.",
      });
      setSelectedLog(null); // Close the dialog after deletion
    });
  }

  const sortedLogs = useMemo(() =>
    [...juntadorPaymentLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [juntadorPaymentLogs]
  );
  
  const getHarvestForLog = (log: JuntadorPaymentLog) => harvests.find(h => h.id === log.harvestId);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Producción y Pagos</CardTitle>
          <CardDescription>Un registro de todas las cosechas y los pagos calculados. Haga clic en una fila para ver detalles.</CardDescription>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={3}>
                          <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && sortedLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No hay registros de producción.</TableCell>
                    </TableRow>
                  )}
                  {!loading && sortedLogs.map(log => {
                    const harvest = getHarvestForLog(log);
                    const batchNum = harvest ? harvest.batchNumber : "L???";
                    return (
                      <TableRow key={log.id} onClick={() => setSelectedLog(log)} className="cursor-pointer">
                        <TableCell><Badge variant="outline">{batchNum}</Badge></TableCell>
                        <TableCell className="font-medium">{log.juntadorName}</TableCell>
                        <TableCell className="text-right font-bold">${log.payment.toLocaleString('es-AR', {minimumFractionDigits: 2})}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(isOpen) => !isOpen && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                   Detalles del Registro
                </DialogTitle>
                 <DialogDescription>
                    Revisión del registro de producción y pago.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedLog.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
                  </div>
                  <Card>
                      <CardContent className="p-4 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Lote</span>
                              <Badge variant="outline">{getHarvestForLog(selectedLog)?.batchNumber || 'N/A'}</Badge>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Recolector</span>
                              <span className="font-semibold">{selectedLog.juntadorName}</span>
                           </div>
                            <hr />
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Kilos Cosechados</span>
                              <span className="font-semibold">{selectedLog.kilograms.toLocaleString('es-ES')} kg</span>
                           </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Horas Trabajadas</span>
                              <span className="font-semibold">{selectedLog.hours.toLocaleString('es-ES')} hs</span>
                           </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Tarifa por Kg</span>
                              <span className="font-semibold">${selectedLog.ratePerKg.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                           </div>
                           <hr />
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-muted-foreground">Pago Total Calculado</span>
                              <span className="font-bold text-lg text-primary">${selectedLog.payment.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                           </div>
                      </CardContent>
                  </Card>
              </div>

               <DialogFooter className="flex-row justify-between w-full pt-2">
                  {canManage ? (
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" disabled={isPending}>
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de producción y el pago asociado, y reajustará las estadísticas del recolector.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(selectedLog.id)}>Continuar y Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  ) : <div />}
                  <Button onClick={() => setSelectedLog(null)} variant="secondary">Cerrar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export const ProductionPaymentHistory = React.memo(ProductionPaymentHistoryComponent);
