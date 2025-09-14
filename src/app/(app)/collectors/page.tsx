'use client';

import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState, useTransition } from 'react';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppDataContext } from '@/context/app-data-context';
import type { Collector } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function CollectorsPage() {
  const { loading, collectors, harvests, deleteCollector, currentUser } = React.useContext(AppDataContext);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const getCollectorHistory = (collectorId: string) => {
    return harvests.filter(h => h.collector.id === collectorId);
  };

  const handleDelete = (collectorId: string) => {
    startTransition(async () => {
      await deleteCollector(collectorId);
      toast({ title: "Recolector Eliminado", description: "El recolector y sus datos asociados han sido eliminados." });
    });
  };

  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Encargado';

  return (
    <>
      <PageHeader
        title="Gestión de Recolectores"
        description="Vea, gestione y siga la productividad de sus recolectores."
      />

      <div className="w-full max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Todos los Recolectores</CardTitle>
            <CardDescription>Una lista de todos los recolectores en su organización.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Total Cosechado</TableHead>
                  <TableHead className="hidden lg:table-cell">Productividad (kg/hr)</TableHead>
                  <TableHead className="hidden sm:table-cell">Se unió</TableHead>
                  {canManage && <TableHead><span className="sr-only">Acciones</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-4 w-[60px]" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Skeleton className="h-4 w-[40px]" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!loading && collectors.map((collector) => (
                  <TableRow key={collector.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://picsum.photos/seed/${collector.avatar}/40/40`} alt={collector.name} />
                          <AvatarFallback>{collector.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{collector.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{collector.totalHarvested.toLocaleString('es-ES')} kg</TableCell>
                    <TableCell className="hidden lg:table-cell">{collector.productivity.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(collector.joinDate).toLocaleDateString('es-ES')}</TableCell>
                    {canManage && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setSelectedCollector(collector); }}>
                              Ver Historial
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => { e.preventDefault(); handleDelete(collector.id); }}>
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedCollector} onOpenChange={(isOpen) => !isOpen && setSelectedCollector(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedCollector && (
            <>
              <DialogHeader>
                <DialogTitle>Historial de Cosecha: {selectedCollector.name}</DialogTitle>
                <DialogDescription>
                  Revise todas las entradas de cosecha para este recolector.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead className="text-right">Kilogramos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const history = getCollectorHistory(selectedCollector.id);
                      if (history.length > 0) {
                        return history.map(h => (
                          <TableRow key={h.id}>
                            <TableCell>{new Date(h.date).toLocaleDateString('es-ES')}</TableCell>
                            <TableCell><Badge variant="outline">{h.batchNumber}</Badge></TableCell>
                            <TableCell className="text-right font-medium">{h.kilograms} kg</TableCell>
                          </TableRow>
                        ));
                      }
                      return (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">No se encontró historial de cosecha.</TableCell>
                        </TableRow>
                      );
                    })()}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedCollector(null)}>Cerrar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
