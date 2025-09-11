
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
import { Map } from 'lucide-react';
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
  const { establishmentData, updateEstablishmentData } = useContext(AppDataContext);
  const { toast } = useToast();
  
  const geoJsonForm = useForm<{ geoJsonData: string }>({
    resolver: zodResolver(geoJsonSchema),
    defaultValues: {
      geoJsonData: establishmentData?.geoJsonData || '',
    },
  });

  useEffect(() => {
    geoJsonForm.reset({ geoJsonData: establishmentData?.geoJsonData || '' });
  }, [establishmentData?.geoJsonData, geoJsonForm]);


  const onGeoJsonSubmit = async (values: { geoJsonData: string }) => {
    try {
        await updateEstablishmentData({ geoJsonData: values.geoJsonData });
        if (values.geoJsonData.trim() === '') {
            toast({ title: "GeoJSON Limpiado", description: "Se han eliminado las geometrías del mapa." });
        } else {
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
    return { lat: -31.9518, lng: -60.9341 }; // Default center if no coordinates
  }, [establishmentData]);
  
  const parsedGeoJson = useMemo(() => {
      try {
          return establishmentData?.geoJsonData ? JSON.parse(establishmentData.geoJsonData) : null;
      } catch {
          return null;
      }
  }, [establishmentData?.geoJsonData]);

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
                       <MapComponent center={mapCenter} geoJsonData={parsedGeoJson} />
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
    </>
  );
}
