
'use client';

import React, { useContext, useMemo, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, HardHat, Info, Trash2 } from 'lucide-react';
import type { PackagingLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

function PackagingHistoryComponent() {
  const { loading, packagingLogs, deletePackagingLog, currentUser } = useContext(AppDataContext);
  const [selectedLog, setSelectedLog] = useState<PackagingLog | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const canManage = currentUser?.role === 'Productor' || currentUser?.role === 'Encargado';

  const sortedLogs = useMemo(() =>
    [...(packagingLogs || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [packagingLogs]
  );
  
  const handleDelete = (logId: string) => {
    startTransition(async () => {
        await deletePackagingLog(logId);
        toast({
            title: "Registro Eliminado",
            description: "El registro de embalaje ha sido eliminado.",
        });
        setSelectedLog(null);
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Embalaje</CardTitle>
          <CardDescription>Un registro de los últimos trabajos de embalaje. Haga clic para ver detalles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Embalador</TableHead>
                    <TableHead className="text-right">Kilos</TableHead>
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
                      <TableCell colSpan={4} className="text-center">No hay registros de embalaje.</TableCell>
                    </TableRow>
                  )}
                  {!loading && sortedLogs.map(log => (
                    <TableRow key={log.id} onClick={() => setSelectedLog(log)} className="cursor-pointer">
                      <TableCell>{new Date(log.date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="font-medium">{log.packerName}</TableCell>
                      <TableCell className="text-right">{log.kilogramsPackaged.toLocaleString('es-ES')} kg</TableCell>
                      <TableCell className="text-right font-bold">${log.payment.toLocaleString('es-AR', {minimumFractionDigits: 2})}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
       <Dialog open={!!selectedLog} onOpenChange={(isOpen) => !isOpen && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-xl">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                   Detalles del Registro de Embalaje
                </DialogTitle>
                 <DialogDescription>
                    Revisión del registro de embalaje y pago.
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
                              <span className="text-sm text-muted-foreground">Embalador</span>
                              <span className="font-semibold">{selectedLog.packerName}</span>
                           </div>
                            <hr />
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Kilos Embalados</span>
                              <span className="font-semibold">{selectedLog.kilogramsPackaged.toLocaleString('es-ES')} kg</span>
                           </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Horas Trabajadas</span>
                              <span className="font-semibold">{selectedLog.hoursWorked.toLocaleString('es-ES')} hs</span>
                           </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Costo por Hora</span>
                              <span className="font-semibold">${selectedLog.costPerHour.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
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
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de embalaje y reajustará las estadísticas del embalador.
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

export const PackagingHistory = React.memo(PackagingHistoryComponent);
