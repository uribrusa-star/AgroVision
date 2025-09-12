
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
import { AppDataContext } from '@/context/app-data-context.tsx';
import type { PhenologyLog } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


const LogSchema = z.object({
  developmentState: z.enum(['Floración', 'Fructificación', 'Maduración'], {
    required_error: "El estado de desarrollo es requerido.",
  }),
  batchId: z.string().optional(),
  flowerCount: z.coerce.number().optional(),
  fruitCount: z.coerce.number().optional(),
  notes: z.string().min(5, "Las notas deben tener al menos 5 caracteres."),
  image: z.string().url("Debe ser una URL de imagen válida.").optional().or(z.literal('')),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function PhenologyLogForm() {
  const { addPhenologyLog, currentUser, batches } = React.useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo' || currentUser.role === 'Encargado';

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      developmentState: undefined,
      batchId: 'general',
      flowerCount: 0,
      fruitCount: 0,
      notes: '',
      image: '',
    },
  });
  
  const imageUrl = form.watch('image');

  const onSubmit = (data: LogFormValues) => {
    startTransition(() => {
      addPhenologyLog({
        date: new Date().toISOString(),
        developmentState: data.developmentState,
        batchId: data.batchId === 'general' ? undefined : data.batchId,
        flowerCount: data.flowerCount,
        fruitCount: data.fruitCount,
        notes: data.notes,
        imageUrl: data.image || "",
        ...(data.image && { imageHint: 'crop phenology' }),
      });

      toast({
        title: "¡Registro Exitoso!",
        description: `Se ha agregado un nuevo registro de fenología.`,
      });

      form.reset({
        developmentState: undefined,
        batchId: 'general',
        flowerCount: 0,
        fruitCount: 0,
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
        <CardTitle>Registrar Estado Fenológico</CardTitle>
        <CardDescription>Ingrese observaciones sobre el estado del cultivo en un lote específico.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="developmentState"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado de Desarrollo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!canManage || isPending}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un estado" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Floración">Floración</SelectItem>
                                <SelectItem value="Fructificación">Fructificación</SelectItem>
                                <SelectItem value="Maduración">Maduración</SelectItem>
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
            <div className="grid md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="flowerCount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nº Flores (aprox.)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="ej., 5" {...field} disabled={!canManage || isPending} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fruitCount"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nº Frutos (aprox.)</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="ej., 3" {...field} disabled={!canManage || isPending} />
                        </FormControl>
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
                  <FormLabel>Notas de Observación</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el vigor, color de hojas, síntomas, etc."
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
                <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Registro'}</Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}
