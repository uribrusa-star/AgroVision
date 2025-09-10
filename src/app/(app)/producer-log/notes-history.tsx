
'use client';

import React, { useContext, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import type { ProducerLog } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export function NotesHistory() {
  const { loading, producerLogs } = useContext(AppDataContext);
  const [selectedLog, setSelectedLog] = useState<ProducerLog | null>(null);

  const sortedLogs = useMemo(() => 
    [...producerLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [producerLogs]
  );

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Historial de Observaciones</CardTitle>
            <CardDescription>Sus últimas notas y pensamientos registrados.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[300px]">
              {loading && <Skeleton className="h-10 w-full" />}
              {!loading && sortedLogs.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No hay notas registradas.</p>
                </div>
              )}
              {!loading && (
                <div className="space-y-4">
                  {sortedLogs.map(log => (
                    <div 
                      key={log.id} 
                      className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(log.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                      <p className="text-sm whitespace-pre-wrap truncate">{log.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedLog && (
            <>
              <DialogHeader>
                  <DialogTitle>Detalle de la Observación</DialogTitle>
                   <DialogDescription>
                      Revisión de la nota registrada en la bitácora.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedLog.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
                  </div>
                   <Card>
                      <CardContent className="p-4">
                          <p className="text-foreground whitespace-pre-wrap">{selectedLog.notes}</p>
                      </CardContent>
                   </Card>
              </div>
              <DialogFooter>
                  <Button onClick={() => setSelectedLog(null)}>Cerrar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
