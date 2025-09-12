
'use client';
import React, { useContext, useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, BrainCircuit, CloudRain, Map as MapIcon, Sparkles } from 'lucide-react';

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { AppDataContext } from "@/context/app-data-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateWeatherAlerts } from "@/ai/flows/generate-weather-alerts";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const MapComponent = dynamic(() => import('@/components/map'), { ssr: false });

const WindyMapEmbed = ({ lat, lng }: { lat: number, lng: number }) => {
  const windyUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&lat=${lat}&lon=${lng}&zoom=8&overlay=radar&product=radar&menu=&message=true&calendar=now&pressure=&type=map&location=coordinates&detail=true&metricWind=default&metricTemp=default&radarRange=-1`;

  return (
    <iframe
      width="100%"
      height="100%"
      src={windyUrl}
      frameBorder="0"
      title="Windy Map"
    ></iframe>
  );
};

const AlertSchema = z.object({
    risk: z.string(),
    recommendation: z.string(),
    urgency: z.enum(['Alta', 'Media', 'Baja']),
});

type Alert = z.infer<typeof AlertSchema>;

const WeatherAlertsSchema = z.object({
  forecast: z.string().min(10, "La descripción del pronóstico es muy corta."),
});

const AIAlertsPanel = () => {
    const { phenologyLogs } = useContext(AppDataContext);
    const [isPending, startTransition] = useTransition();
    const [alerts, setAlerts] = useState<Alert[] | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof WeatherAlertsSchema>>({
        resolver: zodResolver(WeatherAlertsSchema),
        defaultValues: {
            forecast: "Se esperan lluvias y tormentas aisladas para el fin de semana.",
        },
    });

    const onSubmit = (values: z.infer<typeof WeatherAlertsSchema>) => {
        setAlerts(null);
        startTransition(async () => {
             try {
                const result = await generateWeatherAlerts({
                    weatherForecast: values.forecast,
                    phenologyLogs: JSON.stringify(phenologyLogs.slice(0, 10)),
                });
                if (result.alerts && result.alerts.length > 0) {
                    setAlerts(result.alerts);
                } else {
                    toast({ title: "Análisis Completo", description: "La IA no identificó riesgos mayores con el pronóstico provisto." });
                }
             } catch (error) {
                 console.error("Error generating alerts:", error);
                 toast({
                    title: "Error de IA",
                    description: "No se pudieron generar las alertas. Intente de nuevo.",
                    variant: "destructive",
                 });
             }
        });
    }

    const getUrgencyBadgeVariant = (urgency: Alert['urgency']) => {
        switch (urgency) {
            case 'Alta': return 'destructive';
            case 'Media': return 'secondary';
            case 'Baja': return 'outline';
            default: return 'default';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Alertas Climáticas con IA
                </CardTitle>
                <CardDescription>
                    Ingrese un pronóstico del tiempo para generar recomendaciones agronómicas.
                </CardDescription>
            </CardHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="forecast"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Descripción del Pronóstico</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ej. Ola de calor, riesgo de heladas..." disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <BrainCircuit className="mr-2 h-4 w-4 animate-spin" />
                                    Analizando...
                                </>
                            ) : "Generar Alertas"}
                        </Button>

                         {isPending && (
                            <div className="w-full space-y-4">
                               <Skeleton className="h-10 w-full" />
                               <Skeleton className="h-10 w-full" />
                            </div>
                        )}

                        {alerts && (
                            <div className="w-full space-y-4">
                                <h3 className="font-semibold">Resultados del Análisis:</h3>
                                {alerts.map((alert, index) => (
                                    <Alert key={index} variant={alert.urgency === 'Alta' ? 'destructive' : 'default'}>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle className="flex justify-between items-center">
                                            {alert.risk}
                                            <Badge variant={getUrgencyBadgeVariant(alert.urgency)}>{alert.urgency}</Badge>
                                        </AlertTitle>
                                        <AlertDescription>
                                            {alert.recommendation}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}


export default function MapPage() {
  const { establishmentData } = useContext(AppDataContext);
  
  const parsedGeoJson = useMemo(() => {
      try {
          return establishmentData?.geoJsonData ? JSON.parse(establishmentData.geoJsonData) : null;
      } catch {
          return null;
      }
  }, [establishmentData?.geoJsonData]);

  const mapCenter = useMemo(() => {
    if (parsedGeoJson && parsedGeoJson.features && parsedGeoJson.features.length > 0) {
      const firstFeature = parsedGeoJson.features[0];
      if (firstFeature.geometry) {
        if (firstFeature.geometry.type === 'Point') {
          const [lng, lat] = firstFeature.geometry.coordinates;
          return { lat, lng };
        }
        if (firstFeature.geometry.type === 'Polygon') {
          const coords = firstFeature.geometry.coordinates[0];
          if (!coords || coords.length === 0) return { lat: -26.83, lng: -65.22 }; // Fallback
          
          let lat = 0, lng = 0;
          coords.forEach(([coordLng, coordLat]: [number, number]) => {
            lat += coordLat;
            lng += coordLng;
          });
          return { lat: lat / coords.length, lng: lng / coords.length };
        }
      }
    }
    // Fallback to location coordinates or default
    if (establishmentData?.location.coordinates) {
      const [lat, lng] = establishmentData.location.coordinates.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return { lat: -26.83, lng: -65.22 }; // Default center
  }, [parsedGeoJson, establishmentData]);


  return (
    <>
      <PageHeader
        title="Mapa del Establecimiento"
        description="Visualice la finca, sus lotes y genere alertas climáticas con IA."
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-6 w-6 text-primary" />
                    Mapa Interactivo de Lotes
                </CardTitle>
                 <CardDescription>
                    Haga clic en un lote para ver un resumen de sus datos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-md overflow-hidden z-0 bg-muted">
                   <MapComponent center={mapCenter} geoJsonData={parsedGeoJson} />
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CloudRain className="h-6 w-6 text-primary" />
                    Mapa del Clima (Radar)
                </CardTitle>
                <CardDescription>
                    Mapa de radar meteorológico proporcionado por Windy.com.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-md overflow-hidden z-0 bg-muted relative">
                   <WindyMapEmbed lat={mapCenter.lat} lng={mapCenter.lng} />
                </div>
            </CardContent>
        </Card>
        <div className="xl:col-span-2">
            <AIAlertsPanel />
        </div>
      </div>
    </>
  );
}
