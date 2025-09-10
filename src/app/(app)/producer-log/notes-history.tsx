
'use client';

import React, { useContext, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';

export function NotesHistory() {
  const { loading, producerLogs } = useContext(AppDataContext);

  const sortedLogs = useMemo(() => 
    [...producerLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [producerLogs]
  );

  return (
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
                  <div key={log.id} className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(log.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
      </CardContent>
    </Card>
  )
}

