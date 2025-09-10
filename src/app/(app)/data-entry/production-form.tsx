
'use client';

import { useActionState, useEffect, useContext, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { handleProductionUpload } from './actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDataContext } from '@/context/app-data-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

const ProductionSchema = z.object({
  batchId: z.string().min(1, "El ID del lote es requerido."),
  kilosPerBatch: z.coerce.number().min(1, "Los kilos deben ser un número positivo."),
  farmerId: z.string().min(1, "El recolector es requerido."),
  ratePerKg: z.coerce.number().min(0.01, "La tarifa por kg es requerida."),
});

type ProductionFormValues = z.infer<typeof ProductionSchema>;

const initialState = {
  message: '',
  success: false,
  newHarvest: undefined,
  newPaymentLog: undefined,
};

export function ProductionForm() {
  const [state, formAction] = useActionState(handleProductionUpload, initialState);
  const { toast } = useToast();
  const { collectors, batches, addHarvest, addCollectorPaymentLog, collectorPaymentLogs, deleteCollectorPaymentLog, harvests, currentUser } = useContext(AppDataContext);
  const [isClient, setIsClient] = useState(false);
  
  const canManage = currentUser.role === 'Productor';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(ProductionSchema),
    defaultValues: {
      batchId: '',
      kilosPerBatch: 0,
      farmerId: '',
      ratePerKg: 0.45,
    },
    disabled: !canManage,
  });
  
  const availableBatches = useMemo(() => batches.filter(b => b.status === 'pending'), [batches]);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? '¡Éxito!' : '¡Error!',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
          if (state.newHarvest) addHarvest(state.newHarvest);
          if (state.newPaymentLog) addCollectorPaymentLog(state.newPaymentLog);
          form.reset({
            batchId: '',
            kilosPerBatch: 0,
            farmerId: '',
            ratePerKg: 0.45,
          });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toast, form]);

  const handleDelete = (logId: string) => {
    deleteCollectorPaymentLog(logId);
    toast({
        title: "Registro Eliminado",
        description: "El registro de producción y pago ha sido eliminado exitosamente.",
    });
  }
  
  const sortedLogs = [...collectorPaymentLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const onSubmit = (values: ProductionFormValues) => {
    const formData = new FormData();
    formData.set('batchId', values.batchId);
    formData.set('kilosPerBatch', values.kilosPerBatch.toString());
    formData.set('farmerId', values.farmerId);
    formData.set('ratePerKg', values.ratePerKg.toString());
    formData.set('collectors', JSON.stringify(collectors));
    formAction(formData);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Carga de Producción</CardTitle>
          <CardDescription>Ingrese los detalles de la cosecha y calcule el pago del recolector.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
               <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID del Lote</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!canManage}>
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Seleccione un lote" />
                          </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableBatches.length > 0 ? (
                              availableBatches.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.id}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>No hay lotes pendientes</SelectItem>
                            )}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kilosPerBatch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilos por Lote</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ej., 125.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="ratePerKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarifa por kg ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormField
                control={form.control}
                name="farmerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recolector</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} name={field.name} disabled={!canManage}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un recolector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {collectors.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            {canManage && (
                <CardFooter>
                    <Button type="submit">Guardar Producción y Pago</Button>
                </CardFooter>
            )}
          </form>
        </Form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Producción y Pagos</CardTitle>
          <CardDescription>Un registro de todas las cosechas y los pagos calculados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Recolector</TableHead>
                <TableHead>Kg</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                {canManage && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isClient && (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="h-24 text-center">
                    Cargando historial...
                  </TableCell>
                </TableRow>
              )}
              {isClient && sortedLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="text-center">No hay registros de producción.</TableCell>
                </TableRow>
              )}
              {isClient && sortedLogs.map(log => {
                const harvest = harvests.find(h => h.id === log.harvestId);
                const batchNum = harvest ? harvest.batchNumber : "L???";
                return (
                  <TableRow key={log.id}>
                    <TableCell><Badge variant="outline">{batchNum}</Badge></TableCell>
                    <TableCell className="font-medium">{log.collectorName}</TableCell>
                    <TableCell>{log.kilograms.toLocaleString('es-AR')}</TableCell>
                    <TableCell className="text-right font-bold">${log.payment.toFixed(2)}</TableCell>
                    {canManage && (
                        <TableCell className="text-right">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Eliminar</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de producción y pago.
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
    </div>
  );
}
