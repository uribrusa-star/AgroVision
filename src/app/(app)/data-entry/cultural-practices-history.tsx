
'use client';

import React, { useContext, useMemo, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context.tsx';
import type { CulturalPracticeLog } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, HardHat, Info, Trash2, Watch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

function CulturalPracticesHistoryComponent() {
  const { loading, culturalPracticeLogs, deleteCulturalPracticeLog, currentUser } = useContext(AppDataContext);
  const [selectedLog, setSelectedLog] = useState<CulturalPracticeLog | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const canManage = currentUser?.role === 'Productor' || currentUser?.role === 'Encargado';

  const sortedLogs = useMemo(() =>
    [...culturalPracticeLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [culturalPracticeLogs]
  );
  
  const handleDelete = (logId: string) => {
    startTransition(async () => {
      await deleteCulturalPracticeLog(logId);
      toast({
          title: "Registro Eliminado",
          description: "El registro de la labor ha sido eliminado exitosamente.",
      });
      setSelectedLog(null);
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Labores Culturales</CardTitle>
          <CardDescription>Un registro de los últimos pagos por labores culturales. Haga clic para ver detalles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Labor</TableHead>
                    <TableHead>Personal</TableHead>
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
                    <TableRow key={log.id} onClick={() => setSelectedLog(log)} className="cursor-pointer">
                      <TableCell>{new Date(log.date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell><Badge variant="secondary">{log.practiceType}</Badge></TableCell>
                      <TableCell className="font-medium">{log.personnelName}</TableCell>
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
        <DialogContent className="sm:max-w-2xl">
          {selectedLog && (
            <AlertDialog>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                   Detalles del Registro de Labor
                </DialogTitle>
                 <DialogDescription>
                    Revisión del registro de labor cultural y pago asociado.
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
                              <span className="text-sm text-muted-foreground">Tipo de Labor</span>
                              <Badge variant="secondary">{selectedLog.practiceType}</Badge>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Personal</span>
                              <span className="font-semibold flex items-center gap-2"><HardHat className="h-4 w-4" /> {selectedLog.personnelName}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Lote</span>
                              <Badge variant="outline">{selectedLog.batchId || 'General'}</Badge>
                           </div>
                            <hr />
                           <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Horas Trabajadas</span>
                              <span className="font-semibold flex items-center gap-2"><Watch className="h-4 w-4"/> {selectedLog.hoursWorked.toLocaleString('es-ES')} hs</span>
                           </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Costo por Hora</span>
                              <span className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" /> {selectedLog.costPerHour.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                           </div>
                           <hr />
                           <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-muted-foreground">Pago Total Calculado</span>
                              <span className="font-bold text-lg text-primary">${selectedLog.payment.toLocaleString('es-AR', {minimumFractionDigits: 2})}</span>
                           </div>
                            <hr />
                           <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">Notas</span>
                                <p className="font-semibold">{selectedLog.notes}</p>
                           </div>
                      </CardContent>
                  </Card>
              </div>

               <DialogFooter className="flex-row justify-between w-full pt-2">
                  {canManage ? (
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" disabled={isPending}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                          </Button>
                      </AlertDialogTrigger>
                  ) : <div />}
                  <Button onClick={() => setSelectedLog(null)} variant="secondary">Cerrar</Button>
                   <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de la labor y el pago asociado.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(selectedLog.id)}>Continuar y Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </DialogFooter>
            </AlertDialog>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export const CulturalPracticesHistory = React.memo(CulturalPracticesHistoryComponent);

    