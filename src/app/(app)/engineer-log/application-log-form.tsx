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
import { Upload } from 'lucide-react';


const LogSchema = z.object({
  type: z.enum(['Fertilización', 'Fumigación', 'Control'], {
    required_error: "El tipo de aplicación es requerido.",
  }),
  product: z.string().optional(),
  notes: z.string().min(5, "Las notas deben tener al menos 5 caracteres."),
  image: z.any().optional(),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function ApplicationLogForm() {
  const { addAgronomistLog, currentUser } = React.useContext(AppDataContext);
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const canManage = currentUser.role === 'Productor' || currentUser.role === 'Ingeniero Agronomo';

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      type: undefined,
      product: '',
      notes: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = (data: LogFormValues) => {
    startTransition(async () => {
      const newLog: Omit<AgronomistLog, 'id'> = {
        date: new Date().toISOString(),
        type: data.type,
        product: data.product,
        notes: data.notes,
        imageUrl: imagePreview || undefined,
        imageHint: imagePreview ? 'field application' : undefined,
      };
      await addAgronomistLog(newLog);
      toast({
        title: "¡Registro Exitoso!",
        description: `Se ha agregado una nueva entrada de tipo "${data.type}".`,
      });
      form.reset();
      setImagePreview(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = '';
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Nueva Aplicación</CardTitle>
        <CardDescription>Ingrese los detalles de una nueva aplicación o control realizado en el campo.</CardDescription>
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
                            <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Fertilización">Fertilización</SelectItem>
                            <SelectItem value="Fumigación">Fumigación</SelectItem>
                            <SelectItem value="Control">Control</SelectItem>
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
                        <FormLabel>Producto Utilizado (Opcional)</FormLabel>
                        <FormControl>
                        <Input placeholder="ej., Nitrato de Calcio" {...field} disabled={!canManage || isPending} />
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
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa la aplicación, dosis, observaciones, etc."
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
                  <FormLabel>Imagen (Opcional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        className="w-full"
                        ref={fileInputRef}
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          handleImageChange(e);
                        }}
                        disabled={!canManage || isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {imagePreview && (
                <div className="flex justify-center p-4 border-dashed border-2 border-muted rounded-md">
                    <div className="relative w-full max-w-xs aspect-video">
                        <Image
                        src={imagePreview}
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
                <Button type="submit" disabled={isPending || !canManage}>{isPending ? 'Guardando...' : 'Guardar Registro'}</Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
}
