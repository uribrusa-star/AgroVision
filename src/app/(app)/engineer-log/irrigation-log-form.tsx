
'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const LogSchema = z.object({
  type: z.enum(['Riego', 'Fertilización']),
  batchId: z.string().optional(),
  product: z.string().optional(),
  notes: z.string().min(5, "Las notas son requeridas."),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function IrrigationLogForm() {
  const { addAgronomistLog, currentUser, batches } = React.useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  if (!currentUser) return null; // Guard clause
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo' || currentUser.role === 'Encargado';

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      type: 'Riego',
      batchId: 'general',
      product: '',
      notes: '',
    },
  });
  
  const applicationType = form.watch('type');

  const onSubmit = (data: LogFormValues) => {
    startTransition(() => {
      addAgronomistLog({
        date: new Date().toISOString(),
        type: data.type,
        batchId: data.batchId === 'general' ? undefined : data.batchId,
        product: data.product,
        notes: data.notes,
      });
      
      toast({
        title: "¡Registro Exitoso!",
        description: `Se ha agregado un nuevo registro de ${data.type}.`,
      });
      
      form.reset({
        type: 'Riego',
        batchId: 'general',
        product: '',
        notes: '',
      });
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riego y Fertirrigación</CardTitle>
        <CardDescription>Registre las aplicaciones de agua y nutrientes, asociándolas a un lote.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Aplicación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!canManage || isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Riego">Riego</SelectItem>
                        <SelectItem value="Fertilización">Fertilización</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote (Opcional)</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={!canManage || isPending}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Aplicación General" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">Aplicación General</SelectItem>
                          {batches.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.id}</SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {applicationType === 'Fertilización' ? 'Fertilizante/Nutriente' : 'Fuente de Agua (Opcional)'}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={applicationType === 'Fertilización' ? 'Ej. Nitrato de Calcio' : 'Ej. Pozo N°2'} {...field} disabled={!canManage || isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (dosis, CE, pH, duración, etc.)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej. 2 horas de riego. CE: 1.5 dS/m, pH: 6.2. Dosis de 5kg/ha."
                      className="resize-none"
                      {...field}
                      disabled={!canManage || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          {canManage && (
            <CardFooter>
                <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Aplicación'}</Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}
