
'use client';

import React, { useContext, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import { ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TransactionHistory() {
  const { loading, transactions } = useContext(AppDataContext);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [transactions]
  );
  
  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Historial de Transacciones</CardTitle>
                <CardDescription>Un registro de los últimos gastos e ingresos.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
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
                    {!loading && sortedTransactions.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={3} className="text-center">No hay transacciones registradas.</TableCell>
                        </TableRow>
                    )}
                    {!loading && sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id} onClick={() => handleRowClick(transaction)} className="cursor-pointer">
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {transaction.type === 'Ingreso' 
                                        ? <ArrowUpCircle className="h-4 w-4 text-green-500" /> 
                                        : <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                    }
                                    <div>
                                        <p className="font-medium truncate max-w-[120px] sm:max-w-none">{transaction.description}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('es-ES')}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{transaction.category}</Badge>
                            </TableCell>
                            <TableCell className={`text-right font-bold ${transaction.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'Ingreso' ? '+' : '-'} ${transaction.amount.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
        </Card>

        <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
            <DialogContent>
                {selectedTransaction && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedTransaction.type === 'Ingreso' 
                                    ? <ArrowUpCircle className="h-5 w-5 text-green-500" /> 
                                    : <ArrowDownCircle className="h-5 w-5 text-red-500" />
                                }
                                Detalle de la Transacción
                            </DialogTitle>
                             <DialogDescription>
                                Revisión del movimiento financiero registrado.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(selectedTransaction.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
                            </div>
                             <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                                        <Badge variant={selectedTransaction.type === 'Ingreso' ? 'default' : 'destructive'}>{selectedTransaction.type}</Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                                        <p className="font-semibold">{selectedTransaction.category}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                                        <p className="font-semibold">{selectedTransaction.description}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Monto</p>
                                        <p className={`font-bold text-lg ${selectedTransaction.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedTransaction.type === 'Ingreso' ? '+' : '-'} ${selectedTransaction.amount.toLocaleString('es-AR', {minimumFractionDigits: 2})}
                                        </p>
                                    </div>
                                </CardContent>
                             </Card>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setSelectedTransaction(null)}>Cerrar</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </>
  )
}
