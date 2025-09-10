'use client';

import React, { useState } from 'react';
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

const CollectorSchema = z.object({
  collectorId: z.string().min(1, "El recolector es requerido."),
  kilograms: z.coerce.number().min(0.1, "Los kilogramos deben ser un número positivo."),
  hours: z.coerce.number().min(0.1, "Las horas deben ser un número positivo."),
  ratePerKg: z.coerce.number().min(0.01, "La tarifa por kg es requerida."),
});

type CollectorFormValues = z.infer<typeof CollectorSchema>;

export function CollectorForm() {
  const [payment, setPayment] = useState<number | null>(null);
  const { collectors } = React.useContext(AppDataContext);

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
    setPayment(calculatedPayment);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Trabajo del Recolector</CardTitle>
        <CardDescription>Registre los kilogramos cosechados y las horas trabajadas por un recolector para calcular su pago.</CardDescription>
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
            {payment !== null && (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertTitle>Pago Calculado</AlertTitle>
                <AlertDescription>
                  El pago total para esta entrada es <strong>${payment.toFixed(2)}</strong>.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit">Calcular Pago</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
