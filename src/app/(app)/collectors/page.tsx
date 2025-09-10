'use client';

import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AppDataContext } from '@/context/app-data-context';
import type { Collector } from '@/lib/types';

const CollectorSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
});

export default function CollectorsPage() {
  const { collectors, harvests, editCollector, deleteCollector } = React.useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof CollectorSchema>>({
    resolver: zodResolver(CollectorSchema),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (selectedCollector) {
      form.reset({ name: selectedCollector.name });
    }
  }, [selectedCollector, form]);


  const getCollectorHistory = (collectorId: string) => {
    return harvests.filter(h => h.collector.id === collectorId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleEdit = (collector: Collector) => {
    setSelectedCollector(collector);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (collectorId: string) => {
    deleteCollector(collectorId);
  };

  const onEditSubmit = (values: z.infer<typeof CollectorSchema>) => {
    if (selectedCollector) {
      editCollector({ ...selectedCollector, name: values.name });
      setIsEditDialogOpen(false);
      setSelectedCollector(null);
    }
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
                      <AlertDialog>
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
                            <DropdownMenuItem onSelect={() => handleEdit(collector)}>Editar</DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Eliminar</DropdownMenuItem>
                            </AlertDialogTrigger>
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
                        
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente al recolector y todos sus datos de cosecha asociados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(collector.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>

                      </AlertDialog>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Recolector</DialogTitle>
            <DialogDescription>
              Actualice los detalles del recolector. Haga clic en guardar cuando haya terminado.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
