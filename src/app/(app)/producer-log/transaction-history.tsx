
'use client';

import React, { useContext, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function TransactionHistory() {
  const { loading, transactions } = useContext(AppDataContext);

  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), 
    [transactions]
  );

  return (
    <Card>
        <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>Un registro de los últimos gastos e ingresos.</CardDescription>
        </CardHeader>
        <CardContent>
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
                      <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                {transaction.type === 'Ingreso' 
                                    ? <ArrowUpCircle className="h-4 w-4 text-green-500" /> 
                                    : <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                }
                                <div>
                                    <p className="font-medium">{transaction.description}</p>
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
        </CardContent>
    </Card>
  )
}
