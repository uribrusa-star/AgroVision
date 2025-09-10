
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
import { AppDataContext } from '@/context/app-data-context';
import type { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const TransactionSchema = z.object({
  type: z.enum(['Ingreso', 'Gasto']),
  category: z.string().min(1, "La categoría es requerida."),
  description: z.string().min(3, "La descripción es requerida."),
  amount: z.coerce.number().positive("El monto debe ser un número positivo."),
});

type TransactionFormValues = z.infer<typeof TransactionSchema>;

export function TransactionForm() {
  const { addTransaction } = React.useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: 'Gasto',
      category: '',
      description: '',
      amount: 0,
    },
  });

  const transactionType = form.watch('type');

  const expenseCategories = ['Insumos', 'Mano de Obra', 'Mantenimiento', 'Servicios', 'Otro'];
  const incomeCategories = ['Venta Mayorista', 'Venta Minorista', 'Otro'];

  const onSubmit = (data: TransactionFormValues) => {
    startTransition(async () => {
      const newTransaction: Omit<Transaction, 'id'> = {
        date: new Date().toISOString(),
        ...data
      };
      await addTransaction(newTransaction);
      toast({
        title: "¡Transacción Guardada!",
        description: `Se ha registrado un ${data.type.toLowerCase()} de $${data.amount}.`,
      });
      form.reset();
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos e Ingresos del Día</CardTitle>
        <CardDescription>Registre las transacciones financieras diarias.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                            <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Gasto">Gasto</SelectItem>
                                <SelectItem value="Ingreso">Ingreso</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {(transactionType === 'Gasto' ? expenseCategories : incomeCategories).map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Compra de fertilizante NPK" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
              <Button type="submit" disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar Transacción'}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
