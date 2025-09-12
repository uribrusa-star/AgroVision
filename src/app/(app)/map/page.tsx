
'use client';
import React, { useContext, useMemo } from "react";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Map as MapIcon, CloudRain } from 'lucide-react';
import { AppDataContext } from "@/context/app-data-context";

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
          // Calculate centroid of the first polygon
          const coords = firstFeature.geometry.coordinates[0];
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
        description="Visualice la finca, sus lotes y las condiciones climáticas de la zona."
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-6 w-6 text-primary" />
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
                    Mapa de radar meteorológico proporcionado por Windy.com.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full rounded-md overflow-hidden z-0 bg-muted relative">
                   <WindyMapEmbed lat={mapCenter.lat} lng={mapCenter.lng} />
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
