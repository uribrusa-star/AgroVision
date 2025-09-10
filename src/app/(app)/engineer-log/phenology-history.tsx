
'use client';

import React, { useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Flower, Grape, Sun } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import type { PhenologyLog } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const LogSchema = z.object({
  developmentState: z.enum(['Floración', 'Fructificación', 'Maduración'], {
    required_error: "El estado de desarrollo es requerido.",
  }),
  flowerCount: z.coerce.number().optional(),
  fruitCount: z.coerce.number().optional(),
  notes: z.string().min(5, "Las notas deben tener al menos 5 caracteres."),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function PhenologyHistory() {
  const { loading, phenologyLogs, editPhenologyLog, deletePhenologyLog, currentUser } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<PhenologyLog | null>(null);

  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo' || currentUser.role === 'Encargado';

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
  });

  useEffect(() => {
    if (selectedLog) {
      form.reset({
        developmentState: selectedLog.developmentState,
        flowerCount: selectedLog.flowerCount,
        fruitCount: selectedLog.fruitCount,
        notes: selectedLog.notes,
      });
    }
  }, [selectedLog, form]);

  const handleEdit = (log: PhenologyLog) => {
    setSelectedLog(log);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (logId: string) => {
    deletePhenologyLog(logId);
    toast({
      title: "Registro Eliminado",
      description: "La entrada del registro ha sido eliminada exitosamente.",
    });
  };

  const onEditSubmit = (values: LogFormValues) => {
    if (selectedLog) {
      editPhenologyLog({
        ...selectedLog,
        developmentState: values.developmentState,
        flowerCount: values.flowerCount,
        fruitCount: values.fruitCount,
        notes: values.notes,
      });
      setIsEditDialogOpen(false);
      setSelectedLog(null);
      toast({
        title: "Registro Actualizado",
        description: "La entrada del registro ha sido actualizada exitosamente.",
      });
    }
  };

  const getStateInfo = (state: PhenologyLog['developmentState']) => {
    switch (state) {
      case 'Floración': return { variant: 'default', icon: Flower, label: 'Floración' };
      case 'Fructificación': return { variant: 'secondary', icon: Grape, label: 'Fructificación' };
      case 'Maduración': return { variant: 'destructive', icon: Sun, label: 'Maduración' };
      default: return { variant: 'outline', icon: MoreHorizontal, label: state };
    }
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <Card>
        <CardHeader>
            <CardTitle>Historial de Fenología</CardTitle>
            <CardDescription>Registro de todas las observaciones fenológicas del cultivo.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Conteos</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Imagen</TableHead>
                    {canManage && <TableHead><span className="sr-only">Acciones</span></TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 6: 5}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && phenologyLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 6: 5} className="text-center">No hay registros de fenología.</TableCell>
                  </TableRow>
                )}
                {!loading && phenologyLogs.map((log) => {
                    const stateInfo = getStateInfo(log.developmentState);
                    return (
                        <TableRow key={log.id}>
                            <TableCell>{new Date(log.date).toLocaleDateString('es-ES')}</TableCell>
                            <TableCell>
                                <Badge variant={stateInfo.variant} className="gap-1">
                                    <stateInfo.icon className="h-3 w-3" />
                                    {stateInfo.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                                <p>Flores: {log.flowerCount ?? '-'}</p>
                                <p>Frutos: {log.fruitCount ?? '-'}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-muted-foreground max-w-xs truncate">{log.notes}</p>
                            </TableCell>
                            <TableCell>
                            {log.imageUrl && (
                                <div className="relative w-24 h-16 rounded-md overflow-hidden">
                                    <Image 
                                    src={log.imageUrl}
                                    alt={log.notes}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={log.imageHint}
                                    />
                                </div>
                            )}
                            </TableCell>
                            {canManage && (
                                <TableCell>
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
                                        <DropdownMenuItem onSelect={() => handleEdit(log)}>Editar</DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Eliminar</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de fenología.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(log.id)}>Continuar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                </TableCell>
                            )}
                        </TableRow>
                    )
                })}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Registro de Fenología</DialogTitle>
          <DialogDescription>
            Actualice los detalles del registro. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="developmentState"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Estado de Desarrollo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!canManage}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Floración">Floración</SelectItem>
                            <SelectItem value="Fructificación">Fructificación</SelectItem>
                            <SelectItem value="Maduración">Maduración</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <div className="grid md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="flowerCount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nº Flores (aprox.)</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} disabled={!canManage} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fruitCount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nº Frutos (aprox.)</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} disabled={!canManage} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el vigor, color de hojas, síntomas, etc."
                      className="resize-none"
                      {...field}
                      disabled={!canManage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Note: Image editing is not implemented in this version for simplicity */}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={!canManage}>Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
