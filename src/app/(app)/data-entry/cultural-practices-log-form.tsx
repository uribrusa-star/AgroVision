
'use client';

import React, { useTransition, useContext, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const LogSchema = z.object({
  practiceType: z.string().min(1, "El tipo de labor es requerido."),
  personId: z.string().min(1, "Debe seleccionar a una persona."),
  hoursWorked: z.coerce.number().min(0.5, "Las horas deben ser un número positivo."),
  costPerHour: z.coerce.number().min(1, "El costo por hora es requerido."),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function CulturalPracticesLogForm() {
  const { addCulturalPracticeLog, currentUser, collectors, packers } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  if (!currentUser) return null; // Guard clause
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Encargado';

  const combinedPersonnel = useMemo(() => {
    const allPersonnel = [
      ...collectors.map(c => ({ id: c.id, name: c.name, type: 'Recolector' as const })),
      ...packers.map(p => ({ id: p.id, name: p.name, type: 'Embalador' as const }))
    ];
    return allPersonnel.sort((a, b) => a.name.localeCompare(b.name));
  }, [collectors, packers]);

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      practiceType: '',
      personId: '',
      hoursWorked: 8,
      costPerHour: 5,
    },
  });

  const onSubmit = (data: LogFormValues) => {
    startTransition(() => {
      const person = combinedPersonnel.find(p => p.id === data.personId);
      if (!person) {
        toast({ title: "Error", description: "No se encontró a la persona seleccionada.", variant: "destructive" });
        return;
      }
      
      const payment = data.hoursWorked * data.costPerHour;

      addCulturalPracticeLog({
        date: new Date().toISOString(),
        practiceType: data.practiceType,
        personnelId: person.id,
        personnelName: person.name,
        personnelType: person.type,
        hoursWorked: data.hoursWorked,
        costPerHour: data.costPerHour,
        payment: payment,
        notes: `Pago por labor de ${data.practiceType}`,
      });

      toast({
        title: "¡Registro Exitoso!",
        description: `Se ha guardado el pago por la labor cultural a ${person.name}.`,
      });

      form.reset({
        practiceType: '',
        personId: '',
        hoursWorked: 8,
        costPerHour: 5,
      });
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Pago de Labores Culturales</CardTitle>
        <CardDescription>Registre la labor, el personal y el costo asociado a la tarea.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
             <FormField
                control={form.control}
                name="practiceType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de Labor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!canManage || isPending}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione una labor" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Deshoje">Deshoje / Limpieza</SelectItem>
                            <SelectItem value="Reposición de plantas">Reposición de plantas</SelectItem>
                            <SelectItem value="Mantenimiento de mulching">Mantenimiento de mulching</SelectItem>
                            <SelectItem value="Mantenimiento de túnel">Mantenimiento de túnel</SelectItem>
                            <SelectItem value="Polinización">Polinización</SelectItem>
                            <SelectItem value="Otra">Otra</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="personId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!canManage || isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una persona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {combinedPersonnel.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Pago'}</Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}

    