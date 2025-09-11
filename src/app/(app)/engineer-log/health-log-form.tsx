
'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppDataContext } from '@/context/app-data-context';
import type { AgronomistLog } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const LogSchema = z.object({
  observationType: z.enum(['Plaga', 'Enfermedad'], {
    required_error: "El tipo de observación es requerido.",
  }),
  batchId: z.string().optional(),
  product: z.string().min(1, "El producto o agente observado es requerido."),
  severity: z.string().min(3, "La incidencia o severidad es requerida."),
  notes: z.string().min(5, "Las notas deben tener al menos 5 caracteres."),
  image: z.string().url("Debe ser una URL de imagen válida.").optional().or(z.literal('')),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function HealthLogForm() {
  const { addAgronomistLog, currentUser, batches } = React.useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo' || currentUser.role === 'Encargado';

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      observationType: undefined,
      batchId: 'general',
      product: '',
      severity: '',
      notes: '',
      image: '',
    },
  });

  const imageUrl = form.watch('image');

  const onSubmit = (data: LogFormValues) => {
    startTransition(async () => {
      const newLog: Omit<AgronomistLog, 'id'> = {
        date: new Date().toISOString(),
        type: 'Sanidad',
        batchId: data.batchId === 'general' ? undefined : data.batchId,
        product: `${data.observationType}: ${data.product}`,
        notes: `Incidencia: ${data.severity}. Observaciones: ${data.notes}`,
        imageUrl: data.image || "",
        ...(data.image && { imageHint: 'crop disease pest' }),
      };
      await addAgronomistLog(newLog);
      toast({
        title: "¡Registro de Sanidad Exitoso!",
        description: `Se ha agregado una nueva observación de ${data.observationType}.`,
      });
      form.reset({
        observationType: undefined,
        batchId: 'general',
        product: '',
        severity: '',
        notes: '',
        image: '',
      });
    });
  };
  
  const getDisplayImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
      const parts = url.split('/');
      const hash = parts.pop();
      return `https://i.imgur.com/${hash}.jpg`;
    }
    return url;
  }
  
  const displayImageUrl = getDisplayImageUrl(imageUrl);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Sanidad y Monitoreo</CardTitle>
        <CardDescription>Observe plagas y enfermedades, y asócielas a un lote específico.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="observationType"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipo de Observación</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!canManage || isPending}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Plaga">Plaga</SelectItem>
                            <SelectItem value="Enfermedad">Enfermedad</SelectItem>
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
                        <FormLabel>Agente Observado</FormLabel>
                        <FormControl>
                        <Input placeholder="Ej. Ácaros, Botritis" {...field} disabled={!canManage || isPending} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Incidencia / Severidad</FormLabel>
                    <FormControl>
                    <Input placeholder="Ej. 10% de plantas afectadas" {...field} disabled={!canManage || isPending} />
                    </FormControl>
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
                            <SelectValue placeholder="Observación General" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">Observación General</SelectItem>
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
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa la ubicación, condiciones, etc."
                      className="resize-none"
                      {...field}
                      disabled={!canManage || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Imagen (Opcional)</FormLabel>
                  <FormControl>
                     <Input 
                        placeholder="https://ejemplo.com/imagen.jpg" 
                        {...field} 
                        disabled={!canManage || isPending}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {displayImageUrl && (
                <div className="flex justify-center p-4 border-dashed border-2 border-muted rounded-md">
                    <div className="relative w-full max-w-xs aspect-video">
                        <Image
                        src={displayImageUrl}
                        alt="Vista previa de la imagen"
                        fill
                        className="object-contain rounded-md"
                        />
                    </div>
                </div>
            )}
          </CardContent>
          {canManage && (
            <CardFooter>
                <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Observación'}</Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}
