
'use client';

import React, { useContext, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function PredictionHistory() {
    const { predictionLogs, loading, deletePredictionLog, currentUser } = useContext(AppDataContext);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const canDelete = currentUser?.role === 'Productor' || currentUser?.role === 'Ingeniero Agronomo';

    const getConfidenceBadgeVariant = (confidence: 'Alta' | 'Media' | 'Baja') => {
        switch (confidence) {
            case 'Alta': return 'default';
            case 'Media': return 'secondary';
            case 'Baja': return 'destructive';
            default: return 'outline';
        }
    };

    const handleDelete = (logId: string) => {
        startTransition(() => {
            deletePredictionLog(logId);
            toast({
                title: "Predicción Eliminada",
                description: "El registro de la predicción ha sido eliminado.",
            });
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Predicciones</CardTitle>
                <CardDescription>Un registro de los últimos análisis de rendimiento generados por la IA.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[550px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Lote</TableHead>
                                <TableHead>Predicción</TableHead>
                                <TableHead>Confianza</TableHead>
                                {canDelete && <TableHead className="text-right">Acción</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skel-${i}`}>
                                    <TableCell colSpan={canDelete ? 5 : 4}>
                                        <Skeleton className="h-10 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && predictionLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={canDelete ? 5 : 4} className="text-center h-24">
                                        No hay predicciones guardadas.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && predictionLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(log.date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'})}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{log.batchId}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{log.prediction}</TableCell>
                                    <TableCell>
                                        <Badge variant={getConfidenceBadgeVariant(log.confidence)}>{log.confidence}</Badge>
                                    </TableCell>
                                    {canDelete && (
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={isPending}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Está seguro de eliminar esta predicción?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. El registro se eliminará permanentemente.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(log.id)}>
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
