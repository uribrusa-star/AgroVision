
'use client';

import { useContext, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { PackagingHistory } from './packaging-history';

const PackagingSchema = z.object({
  packerId: z.string().min(1, "El embalador es requerido."),
  kilogramsPackaged: z.coerce.number().min(1, "Los kilos deben ser un número positivo."),
  hoursWorked: z.coerce.number().min(0.5, "Las horas trabajadas son requeridas."),
  costPerHour: z.coerce.number().min(1, "El costo por hora es requerido."),
});

type PackagingFormValues = z.infer<typeof PackagingSchema>;

export function PackagingForm() {
  const { toast } = useToast();
  const { packers, addPackagingLog, currentUser } = useContext(AppDataContext);
  const [isPending, startTransition] = useTransition();
  
  const canManage = currentUser?.role === 'Productor' || currentUser?.role === 'Encargado';

  const form = useForm<PackagingFormValues>({
    resolver: zodResolver(PackagingSchema),
    defaultValues: {
      packerId: '',
      kilogramsPackaged: 0,
      hoursWorked: 8,
      costPerHour: 5,
    },
  });
  
  const savePackagingData = (values: PackagingFormValues) => {
    const packer = packers.find(p => p.id === values.packerId);
    if (!packer) {
      toast({ title: 'Error', description: 'Embalador no encontrado.', variant: 'destructive'});
      return;
    }
    
    startTransition(() => {
      const payment = values.hoursWorked * values.costPerHour;
      addPackagingLog({
          date: new Date().toISOString(),
          packerId: values.packerId,
          packerName: packer.name,
          kilogramsPackaged: values.kilogramsPackaged,
          hoursWorked: values.hoursWorked,
          costPerHour: values.costPerHour,
          payment: payment,
      });

      toast({
          title: '¡Éxito!',
          description: `Registro de embalaje para ${packer.name} guardado.`,
      });

      form.reset({
          ...form.getValues(),
          packerId: '',
          kilogramsPackaged: 0,
      });
    });
  }
  
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Costo de Embalaje</CardTitle>
          <CardDescription>Ingrese los detalles del trabajo de embalaje y calcule el costo.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(savePackagingData)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="packerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Embalador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} name={field.name} disabled={!canManage || isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un embalador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packers.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="kilogramsPackaged"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilos Embalados</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ej., 200" {...field} disabled={!canManage || isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="hoursWorked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas Trabajadas</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.5" {...field} disabled={!canManage || isPending}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                    control={form.control}
                    name="costPerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo por Hora (ARS)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} disabled={!canManage || isPending}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </CardContent>
            {canManage && (
                <CardFooter>
                    <Button type="submit" disabled={isPending || !canManage}>
                        {isPending ? 'Guardando...' : 'Guardar Registro de Embalaje'}
                    </Button>
                </CardFooter>
            )}
          </form>
        </Form>
      </Card>
      <PackagingHistory />
    </div>
  );
}
