
'use client';

import React, { useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Bug, Hand, Leaf, SprayCan, Wind, Thermometer, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppDataContext } from '@/context/app-data-context';
import type { AgronomistLog, AgronomistLogType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const LogSchema = z.object({
  type: z.enum(['Fertilización', 'Fumigación', 'Control', 'Sanidad', 'Labor Cultural', 'Riego', 'Condiciones Ambientales']),
  product: z.string().optional(),
  notes: z.string().min(5, "Las notas deben tener al menos 5 caracteres."),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function ApplicationHistory() {
  const { loading, agronomistLogs, editAgronomistLog, deleteAgronomistLog, currentUser } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AgronomistLog | null>(null);

  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo' || currentUser.role === 'Encargado';

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
  });

  useEffect(() => {
    if (selectedLog) {
      form.reset({
        type: selectedLog.type,
        product: selectedLog.product,
        notes: selectedLog.notes,
      });
    }
  }, [selectedLog, form]);

  const handleEdit = (log: AgronomistLog) => {
    setSelectedLog(log);
    setIsEditDialogOpen(true);
  };

  const handleDetails = (log: AgronomistLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  }
  
  const handleDelete = (logId: string) => {
    deleteAgronomistLog(logId);
    toast({
      title: "Registro Eliminado",
      description: "La entrada del registro ha sido eliminada exitosamente.",
    });
  };

  const onEditSubmit = (values: LogFormValues) => {
    if (selectedLog) {
      editAgronomistLog({
        ...selectedLog,
        type: values.type as AgronomistLogType,
        product: values.product,
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

  const getTypeInfo = (type: AgronomistLog['type']) => {
    switch (type) {
      case 'Fertilización': return { variant: 'default', icon: Leaf, label: 'Fertilización' };
      case 'Fumigación': return { variant: 'destructive', icon: SprayCan, label: 'Fumigación' };
      case 'Control': return { variant: 'secondary', icon: Bug, label: 'Control' };
      case 'Sanidad': return { variant: 'destructive', icon: Bug, label: 'Sanidad'};
      case 'Labor Cultural': return { variant: 'secondary', icon: Hand, label: 'Labor Cultural'};
      case 'Riego': return { variant: 'default', icon: Wind, label: 'Riego'};
      case 'Condiciones Ambientales': return { variant: 'outline', icon: Thermometer, label: 'Clima'};
      default: return { variant: 'outline', icon: MoreHorizontal, label: type};
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Historial de Actividades</CardTitle>
            <CardDescription>Registro de todas las aplicaciones, labores, controles y observaciones realizadas en el campo.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead>Imagen</TableHead>
                    {canManage && <TableHead><span className="sr-only">Acciones</span></TableHead>}
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5: 4}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && agronomistLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canManage ? 5: 4} className="text-center">No hay registros de actividades.</TableCell>
                  </TableRow>
                )}
                {!loading && [...agronomistLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => {
                    const typeInfo = getTypeInfo(log.type);
                    return (
                    <TableRow key={log.id} onClick={() => handleDetails(log)} className="cursor-pointer">
                        <TableCell>{new Date(log.date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <Badge variant={typeInfo.variant as any} className="gap-1">
                            <typeInfo.icon className="h-3 w-3" />
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{log.product || '-'}</p>
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
                            <TableCell onClick={(e) => e.stopPropagation()}>
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
                                    <DropdownMenuItem onSelect={() => handleDetails(log)}>Ver Detalles</DropdownMenuItem>
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
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de la aplicación.
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
                )})}
                </TableBody>
            </Table>
        </CardContent>
    </Card>

    {/* Edit Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Editar Registro de Actividad</DialogTitle>
            <DialogDescription>
                Actualice los detalles del registro. Haga clic en guardar cuando haya terminado.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Actividad</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!canManage}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Condiciones Ambientales">Condiciones Ambientales</SelectItem>
                                <SelectItem value="Riego">Riego</SelectItem>
                                <SelectItem value="Fertilización">Fertilización</SelectItem>
                                <SelectItem value="Sanidad">Sanidad</SelectItem>
                                <SelectItem value="Labor Cultural">Labor Cultural</SelectItem>
                                <SelectItem value="Control">Control</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="product"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Producto/Labor/Detalle (Opcional)</FormLabel>
                            <FormControl>
                            <Input placeholder="ej., Nitrato de Calcio" {...field} disabled={!canManage} />
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
                        placeholder="Describa la aplicación, dosis, observaciones, etc."
                        className="resize-none"
                        {...field}
                        disabled={!canManage}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
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

    {/* Detail View Dialog */}
     <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
           {selectedLog && (() => {
              const typeInfo = getTypeInfo(selectedLog.type);
              return (
                 <>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           <typeInfo.icon className="h-5 w-5" />
                           Detalle del Registro de Actividad
                        </DialogTitle>
                        <DialogDescription>
                           Revisión de la entrada de la bitácora.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(selectedLog.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</span>
                        </div>
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Tipo de Actividad</p>
                                    <Badge variant={typeInfo.variant as any}>{typeInfo.label}</Badge>
                                </div>

                                {selectedLog.product && (
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Producto / Detalle</p>
                                        <p className="font-semibold">{selectedLog.product}</p>
                                    </div>
                                )}
                                
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                                    <p className="text-foreground whitespace-pre-wrap">{selectedLog.notes}</p>
                                </div>
                                
                                {selectedLog.imageUrl && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Imagen Adjunta</p>
                                        <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                                            <Image
                                                src={selectedLog.imageUrl}
                                                alt={selectedLog.notes}
                                                fill
                                                className="object-cover"
                                                data-ai-hint={selectedLog.imageHint}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsDetailOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                 </>
              );
           })()}
        </DialogContent>
     </Dialog>
    </>
  )
}
