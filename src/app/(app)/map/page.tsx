
'use client';
import React, { useContext, useState, useMemo } from "react";
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
            if (data.trim() === '') return true;
            JSON.parse(data);
            return true;
        } catch (e) {
            return false;
        }
    }, { message: "GeoJSON inválido." }),
});

export default function MapPage() {
  const { establishmentData } = useContext(AppDataContext);
  const { toast } = useToast();
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  const geoJsonForm = useForm<{ geoJsonData: string }>({
    resolver: zodResolver(geoJsonSchema),
    defaultValues: {
      geoJsonData: '',
    },
  });

  const onGeoJsonSubmit = (values: { geoJsonData: string }) => {
    if (values.geoJsonData.trim() === '') {
        setGeoJsonData(null);
        toast({ title: "GeoJSON Limpiado", description: "Se han eliminado las geometrías del mapa." });
        return;
    }
    try {
        const parsedData = JSON.parse(values.geoJsonData);
        setGeoJsonData(parsedData);
        toast({ title: "GeoJSON Cargado", description: "Los datos se han cargado en el mapa." });
    } catch (error) {
        toast({ title: "Error de GeoJSON", description: "El formato de los datos no es válido.", variant: "destructive" });
    }
  };

  const mapCenter = useMemo(() => {
    if (establishmentData?.location.coordinates) {
      const [lat, lng] = establishmentData.location.coordinates.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return { lat: -26.83, lng: -65.22 }; // Default center
  }, [establishmentData]);


  return (
    <>
      <PageHeader
        title="Mapa del Establecimiento"
        description="Visualice la finca y cargue datos geográficos en formato GeoJSON."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Map className="h-6 w-6 text-primary" />
                    Mapa Interactivo
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-md overflow-hidden z-0 bg-muted">
                   <MapComponent center={mapCenter} geoJsonData={geoJsonData} />
                </div>
            </CardContent>
        </Card>
        <Card className="md:col-span-1">
             <CardHeader>
                <CardTitle>Cargar GeoJSON</CardTitle>
                <CardDescription>Pegue el contenido de un archivo GeoJSON para visualizarlo en el mapa.</CardDescription>
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
                        <Button type="submit">Cargar en Mapa</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      </div>
    </>
  );
}
