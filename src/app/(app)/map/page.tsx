
'use client';
import React, { useContext, useMemo } from "react";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Map, CloudRain } from 'lucide-react';
import { AppDataContext } from "@/context/app-data-context";

const MapComponent = dynamic(() => import('@/components/map'), { ssr: false });
const WeatherMapComponent = dynamic(() => import('@/components/weather-map'), { ssr: false });

export default function MapPage() {
  const { establishmentData } = useContext(AppDataContext);

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
        description="Visualice la finca, sus lotes y las condiciones climáticas de la zona."
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Map className="h-6 w-6 text-primary" />
                    Mapa Interactivo de Lotes
                </CardTitle>
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
                    Use el botón para activar o desactivar la capa de precipitación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-md overflow-hidden z-0 bg-muted relative">
                   <WeatherMapComponent center={mapCenter} />
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
