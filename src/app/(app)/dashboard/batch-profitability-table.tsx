
'use client';

import React, { useContext, useMemo } from 'react';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DollarSign, HardHat, TestTube2, Weight } from 'lucide-react';

export function BatchProfitabilityTable() {
    const { loading, batches, harvests, collectorPaymentLogs, culturalPracticeLogs, agronomistLogs, supplies, transactions } = useContext(AppDataContext);

    const batchData = useMemo(() => {
        const harvestedBatchIds = [...new Set(harvests.map(h => h.batchNumber))];
        
        return harvestedBatchIds.map(batchId => {
            const batchHarvests = harvests.filter(h => h.batchNumber === batchId);
            const totalKilos = batchHarvests.reduce((sum, h) => sum + h.kilograms, 0);

            const harvestLaborCost = collectorPaymentLogs.filter(p => batchHarvests.some(h => h.id === p.harvestId)).reduce((sum, p) => sum + p.payment, 0);
            const culturalPracticeCost = culturalPracticeLogs.filter(p => p.batchId === batchId).reduce((sum, p) => sum + p.payment, 0);
            const totalLaborCost = harvestLaborCost + culturalPracticeCost;

            const batchApplications = agronomistLogs.filter(log => log.batchId === batchId && log.product && log.quantityUsed);
            const inputCost = batchApplications.reduce((sum, app) => {
                const supplyPurchase = transactions.find(t => t.type === 'Gasto' && t.category === 'Insumos' && t.description.includes(app.product!) && t.pricePerUnit);
                if (supplyPurchase && supplyPurchase.pricePerUnit) {
                    return sum + (app.quantityUsed! * supplyPurchase.pricePerUnit);
                }
                return sum;
            }, 0);
            
            const totalCost = totalLaborCost + inputCost;
            const costPerKg = totalKilos > 0 ? totalCost / totalKilos : 0;
            
            return {
                id: batchId,
                totalKilos,
                totalLaborCost,
                inputCost,
                totalCost,
                costPerKg
            };
        });
    }, [harvests, collectorPaymentLogs, culturalPracticeLogs, agronomistLogs, supplies, transactions]);

    if (loading) {
        return <Skeleton className="h-[300px] w-full" />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Análisis de Rentabilidad por Lote</CardTitle>
                <CardDescription>Desglose de producción y costos para cada lote cosechado.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-[400px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lote</TableHead>
                                <TableHead className="text-right">Producción (kg)</TableHead>
                                <TableHead className="text-right">Costo Mano Obra</TableHead>
                                <TableHead className="text-right">Costo Insumos</TableHead>
                                <TableHead className="text-right">Costo Total</TableHead>
                                <TableHead className="text-right font-bold">Costo por Kg</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batchData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No hay datos de lotes cosechados para analizar.
                                    </TableCell>
                                </TableRow>
                            )}
                            {batchData.map(batch => (
                                <TableRow key={batch.id}>
                                    <TableCell><Badge variant="outline">{batch.id}</Badge></TableCell>
                                    <TableCell className="text-right font-semibold flex items-center justify-end gap-2"><Weight className="h-4 w-4 text-muted-foreground" /> {batch.totalKilos.toLocaleString('es-AR')}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2"><HardHat className="h-4 w-4 text-muted-foreground" /> ${batch.totalLaborCost.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2"><TestTube2 className="h-4 w-4 text-muted-foreground" /> ${batch.inputCost.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> ${batch.totalCost.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right font-bold">${batch.costPerKg.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
