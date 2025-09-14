
'use client';

import { MoreHorizontal } from 'lucide-react';
import React, { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AppDataContext } from '@/context/app-data-context.tsx';
import type { Packer } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const PackerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
});

export default function PackersPage() {
  const { loading, packers, addPacker, currentUser } = React.useContext(AppDataContext);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof PackerSchema>>({
    resolver: zodResolver(PackerSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (isAddDialogOpen) {
      form.reset({ name: '' });
    }
  }, [isAddDialogOpen, form]);


  const onAddSubmit = (values: z.infer<typeof PackerSchema>) => {
    const newName = values.name.trim();
    if (packers.some(p => p.name.toLowerCase() === newName.toLowerCase())) {
      form.setError('name', { type: 'manual', message: 'Ya existe un embalador con este nombre.' });
      return;
    }
    
    startTransition(async () => {
        await addPacker({
          name: newName,
          avatar: `${Math.floor(Math.random() * 1000)}`,
          totalPackaged: 0,
          hoursWorked: 0,
          packagingRate: 0,
          joinDate: new Date().toISOString(),
        });
        toast({ title: "Embalador Agregado", description: `Se ha agregado a ${newName} al sistema.` });
        setIsAddDialogOpen(false);
        form.reset({ name: '' });
    });
  };

  if (!currentUser) return null;
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Encargado';

  return (
    <>
      <PageHeader
        title="Gestión de Embaladores"
        description="Vea y gestione su equipo de embalaje."
      >
        {canManage && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>Agregar Nuevo Embalador</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Nuevo Embalador</DialogTitle>
                        <DialogDescription>
                            Complete los detalles para agregar un nuevo embalador al sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej. María López" disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isPending}>{isPending ? 'Agregando...' : 'Agregar Embalador'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        )}
      </PageHeader>
      
      <div className="w-full max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Todos los Embaladores</CardTitle>
            <CardDescription>Una lista de todos los embaladores en su organización.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Total Embalado</TableHead>
                  <TableHead className="hidden lg:table-cell">Productividad (kg/hr)</TableHead>
                  <TableHead className="hidden sm:table-cell">Se unió</TableHead>
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
                  </TableRow>
                ))}
                {!loading && packers.map((packer) => (
                  <TableRow key={packer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://picsum.photos/seed/${packer.avatar}/40/40`} alt={packer.name} />
                          <AvatarFallback>{packer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{packer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{packer.totalPackaged.toLocaleString('es-ES')} kg</TableCell>
                    <TableCell className="hidden lg:table-cell">{packer.packagingRate.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(packer.joinDate).toLocaleDateString('es-ES')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
