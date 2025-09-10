'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { handleProductionUpload } from './actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { collectors } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProductionSchema = z.object({
  batchId: z.string().min(1, "El ID del lote es requerido."),
  kilosPerBatch: z.coerce.number().min(1, "Los kilos deben ser un número positivo."),
  farmerId: z.string().min(1, "El agricultor es requerido."),
});

type ProductionFormValues = z.infer<typeof ProductionSchema>;

const initialState = {
  message: '',
  success: false,
};

export function ProductionForm() {
  const [state, formAction] = useActionState(handleProductionUpload, initialState);
  const { toast } = useToast();

  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(ProductionSchema),
    defaultValues: {
      batchId: '',
      kilosPerBatch: 0,
      farmerId: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? '¡Éxito!' : '¡Error!',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        form.reset();
      }
    }
  }, [state, toast, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Producción</CardTitle>
        <CardDescription>Ingrese los detalles de un nuevo lote de producción. Los datos serán validados por nuestro asistente de IA.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Lote</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., L014" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kilosPerBatch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilos por Lote</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="ej., 125.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="farmerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agricultor / Recolector</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un agricultor" />
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
          </CardContent>
          <CardFooter>
            <Button type="submit">Enviar Lote</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
