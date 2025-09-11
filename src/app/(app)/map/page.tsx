
'use client';
import React, { useContext, useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Leaf, Map, Notebook, Weight } from 'lucide-react';
import { AppDataContext } from "@/context/app-data-context";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const MapComponent = dynamic(() => import('@/components/map'), { ssr: false });

const geoJsonSchema = z.object({
    geoJsonData: z.string().refine((data) => {
        try {
            if (data.trim() === '') return true; // Allow empty string
            const parsed = JSON.parse(data);
            return parsed && parsed.type === 'FeatureCollection' && Array.isArray(parsed.features);
        } catch (e) {
            return false;
        }
    }, { message: "GeoJSON inválido o no es un FeatureCollection." }),
});

export default function MapPage() {
  const { establishmentData, updateEstablishmentData, harvests, agronomistLogs, phenologyLogs } = useContext(AppDataContext);
  const { toast } = useToast();
  
  const [internalGeoJson, setInternalGeoJson] = useState<any>(null);

  const geoJsonForm = useForm<{ geoJsonData: string }>({
    resolver: zodResolver(geoJsonSchema),
    defaultValues: {
      geoJsonData: establishmentData?.geoJsonData || '',
    },
  });

  useEffect(() => {
    const savedGeoJson = establishmentData?.geoJsonData;
    if (savedGeoJson) {
        try {
            const parsed = JSON.parse(savedGeoJson);
            setInternalGeoJson(parsed);
            geoJsonForm.reset({ geoJsonData: savedGeoJson });
        } catch {
            setInternalGeoJson(null);
            geoJsonForm.reset({ geoJsonData: '' });
        }
    }
  }, [establishmentData?.geoJsonData, geoJsonForm]);


  const onGeoJsonSubmit = async (values: { geoJsonData: string }) => {
    try {
        await updateEstablishmentData({ geoJsonData: values.geoJsonData });
        if (values.geoJsonData.trim() === '') {
            setInternalGeoJson(null);
            toast({ title: "GeoJSON Limpiado", description: "Se han eliminado las geometrías del mapa." });
        } else {
            setInternalGeoJson(JSON.parse(values.geoJsonData));
            toast({ title: "GeoJSON Guardado", description: "Los datos se han guardado y cargado en el mapa." });
        }
    } catch (error) {
        toast({ title: "Error", description: "No se pudieron guardar los datos GeoJSON.", variant: "destructive" });
    }
  };

  const mapCenter = useMemo(() => {
    if (establishmentData?.location.coordinates) {
      const [lat, lng] = establishmentData.location.coordinates.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return { lat: -26.83, lng: -65.22 }; // Default center if no coordinates
  }, [establishmentData]);
  
  const lotData = useMemo(() => {
    if (!internalGeoJson || !internalGeoJson.features) return [];

    const polygonFeatures = internalGeoJson.features.filter(
      (feature: any) => feature.geometry?.type === 'Polygon'
    );

    return polygonFeatures.map((feature: any) => {
      const lotId = Object.keys(feature.properties)[0];
      if (!lotId) return null;

      const lotHarvests = harvests.filter(h => h.batchNumber === lotId);
      const lotAgronomistLogs = agronomistLogs.filter(l => l.batchId === lotId);
      const lotPhenologyLogs = phenologyLogs.filter(p => p.batchId === lotId);
      
      const totalKilos = lotHarvests.reduce((sum, h) => sum + h.kilograms, 0);

      return {
        id: lotId,
        totalKilos,
        harvestCount: lotHarvests.length,
        agronomistLogCount: lotAgronomistLogs.length,
        phenologyLogCount: lotPhenologyLogs.length
      };
    }).filter(Boolean); // Filter out nulls if a polygon has no properties
  }, [internalGeoJson, harvests, agronomistLogs, phenologyLogs]);


  return (
    <>
      <PageHeader
        title="Mapa del Establecimiento"
        description="Visualice la finca y cargue datos geográficos en formato GeoJSON."
      />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Map className="h-6 w-6 text-primary" />
                        Mapa Interactivo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full rounded-md overflow-hidden z-0 bg-muted">
                       <MapComponent center={mapCenter} geoJsonData={internalGeoJson} />
                    </div>
                </CardContent>
            </Card>
        </div>
        <Card className="xl:col-span-1">
             <CardHeader>
                <CardTitle>Cargar GeoJSON</CardTitle>
                <CardDescription>Pegue el contenido de un archivo GeoJSON para visualizarlo. Los datos se guardarán automáticamente.</CardDescription>
            </CardHeader>
            <Form {...geoJsonForm}>
                <form onSubmit={geoJsonForm.handleSubmit(onGeoJsonSubmit)}>
                    <CardContent>
                        <FormField
                            control={geoJsonForm.control}
                            name="geoJsonData"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Datos GeoJSON</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{ "type": "FeatureCollection", "features": [ ... ] }'
                                            className="min-h-[280px] resize-none font-mono text-xs"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Guardar y Cargar en Mapa</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      </div>

      {lotData.length > 0 && (
          <div className="mt-8">
              <h2 className="text-2xl font-headline text-foreground mb-4">Resumen de Lotes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {lotData.map(lot => (
                      <Card key={lot.id}>
                          <CardHeader>
                              <CardTitle>Lote: {lot.id}</CardTitle>
                              <CardDescription>Resumen de datos para este lote.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                               <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-full">
                                    <Weight className="h-5 w-5" />
                                  </div>
                                  <div>
                                      <p className="font-bold text-lg">{lot.totalKilos.toLocaleString('es-ES')} kg</p>
                                      <p className="text-sm text-muted-foreground">{lot.harvestCount} cosechas</p>
                                  </div>
                              </div>
                               <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-full">
                                    <Leaf className="h-5 w-5" />
                                  </div>
                                  <div>
                                      <p className="font-bold text-lg">{lot.agronomistLogCount}</p>
                                      <p className="text-sm text-muted-foreground">Actividades Agronómicas</p>
                                  </div>
                              </div>
                               <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-full">
                                      <Notebook className="h-5 w-5" />
                                  </div>
                                  <div>
                                      <p className="font-bold text-lg">{lot.phenologyLogCount}</p>
                                      <p className="text-sm text-muted-foreground">Registros Fenológicos</p>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  ))}
              </div>
          </div>
      )}
    </>
  );
}
