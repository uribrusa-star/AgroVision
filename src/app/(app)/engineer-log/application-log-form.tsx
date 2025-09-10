'use client';

import React from 'react';
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
  type: z.enum(['Fertilización', 'Fumigación', 'Control'], {
    required_error: "El tipo de aplicación es requerido.",
  }),
  product: z.string().optional(),
  notes: z.string().min(5, "Las notas deben tener al menos 5 caracteres."),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function ApplicationLogForm() {
  const { addAgronomistLog } = React.useContext(AppDataContext);
  const { toast } = useToast();

  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: {
      type: undefined,
      product: '',
      notes: '',
    },
  });

  const onSubmit = (data: LogFormValues) => {
    const newLog: AgronomistLog = {
      id: `LOG${Date.now()}`,
      date: new Date().toISOString(),
      ...data,
    };
    addAgronomistLog(newLog);
    toast({
      title: "¡Registro Exitoso!",
      description: `Se ha agregado una nueva entrada de tipo "${data.type}".`,
    });
    form.reset();
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input placeholder="ej., Nitrato de Calcio" {...field} />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Guardar Registro</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
