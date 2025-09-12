
'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDataContext } from '@/context/app-data-context.tsx';
import type { AgronomistLog } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const LogSchema = z.object({
  practiceType: z.string().min(1, "El tipo de labor es requerido."),
  batchId: z.string().optional(),
  notes: z.string().min(5, "Las notas son requeridas."),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function CulturalPracticesLogForm() {
  const { addAgronomistLog, currentUser, batches } = React.useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo' || currentUser.role === 'Encargado';

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      practiceType: '',
      batchId: 'general',
      notes: '',
    },
  });

  const onSubmit = (data: LogFormValues) => {
    startTransition(() => {
      addAgronomistLog({
        date: new Date().toISOString(),
        type: 'Labor Cultural',
        batchId: data.batchId === 'general' ? undefined : data.batchId,
        product: data.practiceType,
        notes: data.notes,
      });
    });
    
    toast({
      title: "¡Registro Exitoso!",
      description: `Se ha agregado una nueva labor cultural: ${data.practiceType}.`,
    });

    form.reset({
      practiceType: '',
      batchId: 'general',
      notes: '',
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Labores Culturales</CardTitle>
        <CardDescription>Registre labores y asócielas a un lote específico.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
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
                            <SelectItem value="Otra">Otra (especificar en notas)</SelectItem>
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
                                <SelectValue placeholder="Labor General" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="general">Labor General</SelectItem>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Detalladas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa la labor realizada, el sector, personal involucrado, etc."
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
                <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Labor'}</Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}

    