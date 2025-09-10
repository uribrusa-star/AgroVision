'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign } from 'lucide-react';
import { AppDataContext } from '@/context/app-data-context';
import type { CollectorPaymentLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const CollectorSchema = z.object({
  collectorId: z.string().min(1, "El recolector es requerido."),
  kilograms: z.coerce.number().min(0.1, "Los kilogramos deben ser un número positivo."),
  hours: z.coerce.number().min(0.1, "Las horas deben ser un número positivo."),
  ratePerKg: z.coerce.number().min(0.01, "La tarifa por kg es requerida."),
});

type CollectorFormValues = z.infer<typeof CollectorSchema>;

export function CollectorForm() {
  const { collectors, addCollectorPaymentLog, collectorPaymentLogs } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<CollectorFormValues>({
    resolver: zodResolver(CollectorSchema),
    defaultValues: {
      collectorId: '',
      kilograms: 0,
      hours: 0,
      ratePerKg: 0.45,
    },
  });

  const onSubmit = (data: CollectorFormValues) => {
    const calculatedPayment = data.kilograms * data.ratePerKg;
    const collector = collectors.find(c => c.id === data.collectorId);
    if (!collector) return;

    const newLog: CollectorPaymentLog = {
      id: `PAY${Date.now()}`,
      date: new Date().toISOString(),
      collectorId: data.collectorId,
      collectorName: collector.name,
      kilograms: data.kilograms,
      hours: data.hours,
      ratePerKg: data.ratePerKg,
      payment: calculatedPayment,
    }

    addCollectorPaymentLog(newLog);

    toast({
      title: "¡Registro Guardado!",
      description: `Se ha guardado un pago de $${calculatedPayment.toFixed(2)} para ${collector.name}.`
    });

    form.reset({
        collectorId: '',
        kilograms: 0,
        hours: 0,
        ratePerKg: 0.45,
    });
  };

  const sortedLogs = [...collectorPaymentLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Trabajo del Recolector</CardTitle>
            <CardDescription>Registre los kilogramos cosechados y las horas trabajadas por un recolector para calcular y guardar su pago.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="collectorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recolector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="kilograms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kilogramos Cosechados</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="ej., 85" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas Trabajadas</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="ej., 8" {...field} />
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
                 <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertTitle>Cálculo de Pago</AlertTitle>
                    <AlertDescription>
                        El pago se calculará y guardará automáticamente al enviar el formulario.
                    </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <Button type="submit">Guardar Registro de Pago</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Un registro de todos los pagos calculados para los recolectores.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Recolector</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Pago</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!isClient && (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                              Cargando historial...
                            </TableCell>
                          </TableRow>
                        )}
                        {isClient && sortedLogs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">No hay registros de pago.</TableCell>
                          </TableRow>
                        )}
                        {isClient && sortedLogs.map(log => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.collectorName}</TableCell>
                                <TableCell>{new Date(log.date).toLocaleDateString('es-ES')}</TableCell>
                                <TableCell className="text-right font-bold">${log.payment.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
