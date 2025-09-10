'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collectors } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSign } from 'lucide-react';

const CollectorSchema = z.object({
  collectorId: z.string().min(1, "Collector is required."),
  kilograms: z.coerce.number().min(0.1, "Kilograms must be a positive number."),
  hours: z.coerce.number().min(0.1, "Hours must be a positive number."),
  ratePerKg: z.coerce.number().min(0.01, "Rate per kg is required."),
});

type CollectorFormValues = z.infer<typeof CollectorSchema>;

export function CollectorForm() {
  const [payment, setPayment] = useState<number | null>(null);

  const form = useForm<CollectorFormValues>({
    resolver: zodResolver(CollectorSchema),
    defaultValues: {
      collectorId: '',
      kilograms: 0,
      hours: 0,
      ratePerKg: 0.45,
    },
  });

  const onSubmit = (data: CollectorFormValues) => {
    const calculatedPayment = data.kilograms * data.ratePerKg;
    setPayment(calculatedPayment);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Collector Work</CardTitle>
        <CardDescription>Log kilograms harvested and hours worked by a collector to calculate their payment.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="collectorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collector</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collector" />
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
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="kilograms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilograms Harvested</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 85" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Worked</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ratePerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per kg ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {payment !== null && (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertTitle>Calculated Payment</AlertTitle>
                <AlertDescription>
                  The total payment for this entry is <strong>${payment.toFixed(2)}</strong>.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit">Calculate Payment</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
