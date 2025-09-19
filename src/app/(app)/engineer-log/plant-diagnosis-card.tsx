'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, BrainCircuit, Upload, CheckCircle, AlertTriangle, Leaf, FlaskConical } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { diagnosePlant, type DiagnosePlantOutput } from '@/ai/flows/diagnose-plant-health';

const DiagnosisRequestSchema = z.object({
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  image: z.any().refine(file => file.length > 0, "Se requiere una imagen."),
});

type DiagnosisRequestValues = z.infer<typeof DiagnosisRequestSchema>;

export function PlantDiagnosisCard() {
  const [isPending, startTransition] = useTransition();
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosePlantOutput | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<DiagnosisRequestValues>({
    resolver: zodResolver(DiagnosisRequestSchema),
    defaultValues: {
      description: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: DiagnosisRequestValues) => {
    if (!previewImage) {
      toast({
        title: "Error de Imagen",
        description: "Por favor, seleccione una imagen para analizar.",
        variant: "destructive",
      });
      return;
    }
    
    setDiagnosisResult(null);
    startTransition(async () => {
      try {
        const result = await diagnosePlant({
          photoDataUri: previewImage,
          description: values.description,
        });

        if (result) {
          setDiagnosisResult(result);
          toast({
            title: "Análisis Completo",
            description: "La IA ha procesado la imagen y la descripción.",
          });
        } else {
          throw new Error("El resultado del diagnóstico está vacío.");
        }
      } catch (error) {
        console.error("Error generating diagnosis:", error);
        toast({
          title: "Error de IA",
          description: "No se pudo generar el diagnóstico. Intente de nuevo.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Diagnóstico de Plantas con IA</CardTitle>
        <CardDescription>Suba una imagen de una planta o fruto y describa el problema para obtener un análisis.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen de la Planta/Fruto</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                            {previewImage ? (
                                <Image src={previewImage} alt="Vista previa de la planta" width={180} height={180} className="object-contain h-full w-full" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haga clic para subir</span> o arrastre aquí</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, JPEG (MAX. 5MB)</p>
                                </div>
                            )}
                        </label>
                    </div>
                  </FormControl>
                  <Input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={(e) => { field.onChange(e.target.files); handleImageChange(e); }} disabled={isPending} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Problema</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Hojas amarillentas con manchas marrones, especialmente en las más viejas. El crecimiento parece detenido." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? <><BrainCircuit className="mr-2 h-4 w-4 animate-spin" /> Analizando...</> : "Analizar con IA"}
            </Button>
            
            {isPending && (
                <div className="w-full space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                </div>
            )}

            {diagnosisResult && (
              <Card className="w-full bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Resultado del Diagnóstico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!diagnosisResult.identification.isPlant ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>No se detectó una planta</AlertTitle>
                            <AlertDescription>
                                La IA no pudo confirmar que la imagen contenga una planta. Por favor, intente con otra foto.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">{diagnosisResult.identification.commonName}</h3>
                                {diagnosisResult.diagnosis.isHealthy ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-2" />Saludable</Badge>
                                ) : (
                                    <Badge variant="destructive"><AlertTriangle className="h-4 w-4 mr-2" />Problema Detectado</Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground italic -mt-2">{diagnosisResult.identification.latinName}</p>

                            <div>
                                <h4 className="font-semibold flex items-center gap-2"><Leaf className="h-4 w-4" /> Diagnóstico</h4>
                                <p className="text-sm mt-1">{diagnosisResult.diagnosis.diagnosis}</p>
                            </div>
                            
                            {diagnosisResult.diagnosis.remedy && (
                                <div>
                                    <h4 className="font-semibold flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Remedio Sugerido</h4>
                                    <p className="text-sm mt-1">{diagnosisResult.diagnosis.remedy}</p>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
              </Card>
            )}

          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
