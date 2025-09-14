

'use client';

import React, { useContext, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import type { ProducerLog } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle, NotebookText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NotesHistory() {
  const { loading, producerLogs } = useContext(AppDataContext);
  const [selectedLog, setSelectedLog] = useState<ProducerLog | null>(null);

  const sortedLogs = useMemo(() => 
    [...producerLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [producerLogs]
  );

  const getLogTypeInfo = (log: ProducerLog) => {
    if (log.type === 'Actividad Omitida') {
        return { icon: AlertCircle, color: 'text-amber-500', title: 'Actividad Omitida' };
    }
    return { icon: NotebookText, color: 'text-muted-foreground', title: 'Nota Personal' };
  };


  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Historial de Observaciones</CardTitle>
            <CardDescription>Sus últimas notas y registros de actividad omitida.</CardDescription>
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
                  {sortedLogs.map(log => {
                    const { icon: Icon, color } = getLogTypeInfo(log);
                    return (
                        <div 
                        key={log.id} 
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLog(log)}
                        >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">
                                {new Date(log.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                            {log.type === 'Actividad Omitida' && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                    <AlertCircle className="h-3 w-3 mr-1"/>
                                    Actividad Omitida
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap truncate">{log.omittedActivity ? `Actividad Omitida: ${log.omittedActivity}. ` : ''}{log.notes}</p>
                        </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedLog && (() => {
            const { icon: Icon, title } = getLogTypeInfo(selectedLog);
            return (
                <>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Icon className="h-5 w-5" />{title}</DialogTitle>
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
                        <CardContent className="p-4 space-y-2">
                             {selectedLog.omittedActivity && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Actividad Omitida</p>
                                    <p className="font-semibold">{selectedLog.omittedActivity}</p>
                                </div>
                             )}
                            <p className="text-sm font-medium text-muted-foreground">{selectedLog.omittedActivity ? 'Razón / Notas' : 'Notas'}</p>
                            <p className="text-foreground whitespace-pre-wrap">{selectedLog.notes}</p>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    <Button onClick={() => setSelectedLog(null)}>Cerrar</Button>
                </DialogFooter>
                </>
            );
            })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
