
'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AppDataContext } from '@/context/app-data-context.tsx';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LogSchema = z.object({
  omittedActivity: z.string().min(1, "Debe seleccionar una actividad."),
  notes: z.string().min(10, "La razón debe tener al menos 10 caracteres."),
});

type LogFormValues = z.infer<typeof LogSchema>;

export function ActivityOmissionLogForm() {
  const { addProducerLog } = React.useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<LogFormValues>({
    resolver: zodResolver(LogSchema),
    defaultValues: { 
        omittedActivity: '',
        notes: '' 
    },
  });

  const onSubmit = (data: LogFormValues) => {
    startTransition(() => {
      addProducerLog({
        date: new Date().toISOString(),
        notes: data.notes,
        type: 'Actividad Omitida',
        omittedActivity: data.omittedActivity,
      });

      toast({
        title: "¡Registro Guardado!",
        description: "La falta de actividad ha sido registrada en la bitácora.",
      });

      form.reset();
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Falta de Actividad</CardTitle>
        <CardDescription>Anote una labor importante que no se realizó y la razón.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="omittedActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actividad Omitida</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione una actividad..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Labores Culturales">Labores Culturales</SelectItem>
                            <SelectItem value="Fertilización">Fertilización</SelectItem>
                            <SelectItem value="Fumigación">Fumigación</SelectItem>
                            <SelectItem value="Riego">Riego</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón / Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej. 'No se pudo regar por corte de energía en la bomba.'"
                      className="resize-y min-h-[100px]"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
              <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Registro'}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
