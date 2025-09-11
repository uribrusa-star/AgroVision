
'use client';

import React, { useContext, useState, useTransition, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sparkles, BrainCircuit } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AppDataContext } from '@/context/app-data-context';
import { predictYield } from '@/ai/flows/predict-yield';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const PredictionRequestSchema = z.object({
  batchId: z.string().min(1, "Debe seleccionar un lote."),
  weatherForecast: z.string().min(5, "El pronóstico es requerido."),
});

type PredictionRequestValues = z.infer<typeof PredictionRequestSchema>;

type PredictionResult = {
  prediction: string;
  confidence: 'Alta' | 'Media' | 'Baja';
}

export function YieldPredictionPanel() {
  const { batches, harvests, agronomistLogs, phenologyLogs, loading: dataLoading } = useContext(AppDataContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  const harvestedBatches = useMemo(() => {
    const harvestedBatchIds = new Set(harvests.map(h => h.batchNumber));
    return batches.filter(b => harvestedBatchIds.has(b.id));
  }, [batches, harvests]);

  const form = useForm<PredictionRequestValues>({
    resolver: zodResolver(PredictionRequestSchema),
    defaultValues: {
      batchId: '',
      weatherForecast: 'Soleado con temperaturas en ligero aumento. Sin lluvias previstas.',
    },
  });

  const onSubmit = (values: PredictionRequestValues) => {
    setPredictionResult(null);
    startTransition(async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentHarvests = harvests.filter(h => h.batchNumber === values.batchId && new Date(h.date) > thirtyDaysAgo);
        const recentAgronomistLogs = agronomistLogs.filter(log => new Date(log.date) > thirtyDaysAgo);
        const recentPhenologyLogs = phenologyLogs.filter(log => new Date(log.date) > thirtyDaysAgo);
        const recentEnvironmentalLogs = agronomistLogs.filter(log => log.type === 'Condiciones Ambientales' && new Date(log.date) > thirtyDaysAgo);

        if (recentHarvests.length === 0) {
            toast({
                title: "Datos Insuficientes",
                description: "No hay cosechas recientes para este lote. La predicción podría no ser precisa.",
                variant: 'destructive'
            });
            return;
        }

        const result = await predictYield({
          batchId: values.batchId,
          recentHarvests: JSON.stringify(recentHarvests),
          agronomistLogs: JSON.stringify(recentAgronomistLogs),
          phenologyLogs: JSON.stringify(recentPhenologyLogs),
          environmentalLogs: JSON.stringify(recentEnvironmentalLogs),
          weatherForecast: values.weatherForecast,
        });

        setPredictionResult(result);

      } catch (error) {
        console.error("Error generating prediction:", error);
        toast({
          title: 'Error de IA',
          description: 'No se pudo generar la predicción. Por favor, intente de nuevo.',
          variant: 'destructive',
        });
      }
    });
  };

  const getConfidenceBadgeVariant = (confidence: PredictionResult['confidence']) => {
    switch (confidence) {
        case 'Alta': return 'default';
        case 'Media': return 'secondary';
        case 'Baja': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generar Nueva Predicción</CardTitle>
        <CardDescription>Seleccione un lote y proporcione el pronóstico del tiempo para obtener una proyección de rendimiento.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleccionar Lote</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPending || dataLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un lote cosechado..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {harvestedBatches.length > 0 ? (
                        harvestedBatches.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.id}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No hay lotes con cosechas registradas</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weatherForecast"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronóstico del Tiempo (Próximos 7 días)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Soleado, temperaturas en aumento" disabled={isPending || dataLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-6">
            <Button type="submit" disabled={isPending || dataLoading}>
              {isPending ? (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4 animate-spin" />
                  Analizando Datos...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar Predicción
                </>
              )}
            </Button>
            
            {isPending && (
                <div className="w-full space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            )}

            {predictionResult && (
              <Card className="w-full bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Proyección de IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg font-semibold text-foreground">
                    {predictionResult.prediction}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Nivel de Confianza:</span>
                    <Badge variant={getConfidenceBadgeVariant(predictionResult.confidence)}>
                      {predictionResult.confidence}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
