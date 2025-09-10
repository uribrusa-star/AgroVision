'use client';

import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription as FormDescriptionComponent, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AppDataContext } from '@/context/app-data-context';
import type { Batch } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const BatchLogSchema = z.object({
  batchId: z.string().regex(/^L\d{3}$/, "El ID del lote debe tener el formato L000 (ej., L014)."),
});

type BatchLogFormValues = z.infer<typeof BatchLogSchema>;

export function BatchLogForm() {
  const { addBatch, batches } = useContext(AppDataContext);
  const { toast } = useToast();

  const form = useForm<BatchLogFormValues>({
    resolver: zodResolver(BatchLogSchema),
    defaultValues: {
      batchId: '',
    },
  });

  const onSubmit = (data: BatchLogFormValues) => {
    if (batches.some(b => b.id === data.batchId)) {
        form.setError("batchId", { type: "manual", message: "Este ID de lote ya existe." });
        return;
    }
    const newBatch: Batch = {
      id: data.batchId,
      preloadedDate: new Date().toISOString(),
      status: 'pending',
    };
    addBatch(newBatch);
    toast({
      title: "¡Lote Pre-cargado!",
      description: `El lote ${data.batchId} está listo para ser cosechado.`,
    });
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-cargar Lotes</CardTitle>
        <CardDescription>Ingrese los IDs de los lotes que estarán disponibles para la cosecha.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo ID de Lote</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., L017" {...field} />
                  </FormControl>
                  <FormDescriptionComponent>
                    El formato debe ser 'L' seguido de 3 números.
                  </FormDescriptionComponent>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Agregar Lote</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
