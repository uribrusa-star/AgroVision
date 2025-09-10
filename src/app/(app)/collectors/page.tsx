'use client';

import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppDataContext } from '@/context/app-data-context';


export default function CollectorsPage() {
  const { collectors, harvests } = React.useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCollectorHistory = (collectorId: string) => {
    return harvests.filter(h => h.collector.id === collectorId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <>
      <PageHeader
        title="Gestión de Recolectores"
        description="Vea, gestione y siga la productividad de sus recolectores."
      >
        <Button>Agregar Nuevo Recolector</Button>
      </PageHeader>
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
                <TableHead className="hidden md:table-cell">Productividad (kg/hr)</TableHead>
                <TableHead className="hidden sm:table-cell">Se unió</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectors.map((collector) => (
                <TableRow key={collector.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${collector.avatar}/40/40`} alt={collector.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{collector.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{collector.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{isClient ? collector.totalHarvested.toLocaleString('es-ES') : '...'} kg</TableCell>
                  <TableCell className="hidden md:table-cell">{isClient ? collector.productivity.toFixed(2) : '...'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{isClient ? new Date(collector.joinDate).toLocaleDateString('es-ES') : '...'}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Ver Historial</DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Historial de Cosecha: {collector.name}</DialogTitle>
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
                                const history = getCollectorHistory(collector.id);
                                if (history.length > 0) {
                                  return history.map(h => (
                                    <TableRow key={h.id}>
                                      <TableCell>{isClient ? new Date(h.date).toLocaleDateString('es-ES') : '...'}</TableCell>
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
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
