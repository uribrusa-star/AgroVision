
'use client';

import { useActionState, useEffect, useContext, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
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
import type { CollectorPaymentLog, Harvest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { validateProductionData } from '@/ai/flows/validate-production-data';

const ProductionSchema = z.object({
  batchId: z.string().min(1, "El ID del lote es requerido."),
  kilosPerBatch: z.coerce.number().min(1, "Los kilos deben ser un número positivo."),
  farmerId: z.string().min(1, "El recolector es requerido."),
  ratePerKg: z.coerce.number().min(0.01, "La tarifa por kg es requerida."),
});

type ProductionFormValues = z.infer<typeof ProductionSchema>;

export function ProductionForm() {
  const { toast } = useToast();
  const { loading, collectors, batches, addHarvest, addCollectorPaymentLog, collectorPaymentLogs, deleteCollectorPaymentLog, harvests, currentUser } = useContext(AppDataContext);
  const [isPending, startTransition] = useTransition();
  const [validationAlert, setValidationAlert] = useState<{ open: boolean; reason: string; data: ProductionFormValues | null }>({ open: false, reason: '', data: null });
  
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Encargado';

  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(ProductionSchema),
    defaultValues: {
      batchId: '',
      kilosPerBatch: 0,
      farmerId: '',
      ratePerKg: 0.45,
    },
  });
  
  const availableBatches = useMemo(() => {
    // Show all batches. Let users log multiple harvests for the same batch.
    return batches;
  }, [batches]);

  const saveHarvestData = async (values: ProductionFormValues) => {
    const farmer = collectors.find(c => c.id === values.farmerId);
    if (!farmer) {
      toast({ title: 'Error', description: 'Recolector no encontrado.', variant: 'destructive'});
      return;
    }

    try {
      const newHarvestData: Omit<Harvest, 'id'> = {
        date: new Date().toISOString(),
        batchNumber: values.batchId,
        kilograms: values.kilosPerBatch,
        collector: {
          id: values.farmerId,
          name: farmer.name,
        }
      };
      
      const newHarvestId = await addHarvest(newHarvestData);
      if(!newHarvestId) {
        throw new Error("Failed to get new harvest ID");
      }
      
      const calculatedPayment = values.kilosPerBatch * values.ratePerKg;
      const hoursWorked = 4; // For simplicity, we assume fixed hours

      const newPaymentLogData: Omit<CollectorPaymentLog, 'id'> = {
        harvestId: newHarvestId, 
        date: new Date().toISOString(),
        collectorId: values.farmerId,
        collectorName: farmer.name,
        kilograms: values.kilosPerBatch,
        hours: hoursWorked,
        ratePerKg: values.ratePerKg,
        payment: calculatedPayment,
      };

      await addCollectorPaymentLog(newPaymentLogData);

      toast({
        title: '¡Éxito!',
        description: `Lote ${values.batchId} con ${values.kilosPerBatch}kg cargado.`,
      });

      form.reset({
        batchId: '',
        kilosPerBatch: 0,
        farmerId: '',
        ratePerKg: 0.45,
      });

    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado al guardar los datos.',
        variant: 'destructive',
      });
    }
  }
  
  const onSubmit = (values: ProductionFormValues) => {
    startTransition(async () => {
        const farmer = collectors.find(c => c.id === values.farmerId);
        if(!farmer) return;

        const historicalDataForFarmer = harvests.filter(h => h.collector.id === values.farmerId);
        const totalKilos = historicalDataForFarmer.reduce((sum, h) => sum + h.kilograms, 0);
        const averageKilos = historicalDataForFarmer.length > 0 ? totalKilos / historicalDataForFarmer.length : values.kilosPerBatch;
        
        try {
            const validationResult = await validateProductionData({
                kilosPerBatch: values.kilosPerBatch,
                batchId: values.batchId,
                timestamp: new Date().toISOString(),
                farmerId: values.farmerId,
                averageKilosPerBatch: averageKilos,
                historicalData: JSON.stringify(historicalDataForFarmer),
            });
            
            if (validationResult.isValid) {
                await saveHarvestData(values);
            } else {
                setValidationAlert({ open: true, reason: validationResult.reason || 'Anomalía detectada.', data: values });
            }

        } catch (aiError) {
             console.error("AI validation failed, saving data directly.", aiError);
             await saveHarvestData(values);
        }
    });
  }

  const handleConfirmValidation = () => {
    if (validationAlert.data) {
        startTransition(async () => {
            await saveHarvestData(validationAlert.data!);
            setValidationAlert({ open: false, reason: '', data: null });
        });
    }
  };

  const handleDelete = (logId: string) => {
    startTransition(async () => {
      await deleteCollectorPaymentLog(logId);
      toast({
          title: "Registro Eliminado",
          description: "El registro de producción y pago ha sido eliminado exitosamente.",
      });
    });
  }
  
  const sortedLogs = useMemo(() => 
    [...collectorPaymentLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [collectorPaymentLogs]
  );

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
                      <Select onValueChange={field.onChange} value={field.value} disabled={!canManage || isPending}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kilosPerBatch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilos por Lote</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ej., 125.5" {...field} disabled={!canManage || isPending} />
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
                        <FormLabel>Tarifa por kg (ARS)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} disabled={!canManage || isPending}/>
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
                    <Select onValueChange={field.onChange} value={field.value} name={field.name} disabled={!canManage || isPending}>
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
                    <Button type="submit" disabled={isPending || !canManage}>
                        {isPending ? 'Validando y Guardando...' : 'Guardar Producción y Pago'}
                    </Button>
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
          <div className="max-h-[400px] overflow-auto">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Recolector</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    {canManage && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={canManage ? 4 : 3}>
                          <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && sortedLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canManage ? 4 : 3} className="text-center">No hay registros de producción.</TableCell>
                    </TableRow>
                  )}
                  {!loading && sortedLogs.map(log => {
                    const harvest = harvests.find(h => h.id === log.harvestId);
                    const batchNum = harvest ? harvest.batchNumber : "L???";
                    return (
                      <TableRow key={log.id}>
                        <TableCell><Badge variant="outline">{batchNum}</Badge></TableCell>
                        <TableCell className="font-medium">{log.collectorName}</TableCell>
                        <TableCell className="text-right font-bold">${log.payment.toLocaleString('es-AR', {minimumFractionDigits: 2})}</TableCell>
                        {canManage && (
                            <TableCell className="text-right">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPending}>
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
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={validationAlert.open} onOpenChange={(open) => setValidationAlert(prev => ({...prev, open}))}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Advertencia de Validación de IA</AlertDialogTitle>
                <AlertDialogDescription>
                   {validationAlert.reason}
                   <br/><br/>
                   ¿Desea guardar este registro de todos modos?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setValidationAlert({open: false, reason: '', data: null})}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmValidation}>Guardar de todos modos</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}

    