'use client';

import React, { useContext, useState } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, InfoWindow } from '@react-google-maps/api';
import { AppDataContext } from '@/context/app-data-context';

type MapProps = {
    center: {
        lat: number;
        lng: number;
    };
    geoJsonData?: any;
};

const MapComponent = ({ center, geoJsonData }: MapProps) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });
    
    const { harvests } = useContext(AppDataContext);
    const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);

    const renderPolygons = () => {
        if (!geoJsonData || !geoJsonData.features) return null;

        return geoJsonData.features
            .filter((feature: any) => feature.geometry && feature.geometry.type === 'Polygon')
            .map((feature: any) => {
                const paths = feature.geometry.coordinates[0].map((coord: [number, number]) => ({
                    lat: coord[1],
                    lng: coord[0],
                }));

                const properties = Object.keys(feature.properties);
                const polygonId = properties.length > 0 ? properties[0] : `polygon-${feature.id}`;
                
                const polygonHarvests = harvests.filter(h => h.batchNumber === polygonId);
                const totalKilos = polygonHarvests.reduce((sum, h) => sum + h.kilograms, 0);

                const centerOfPolygon = paths.reduce(
                    (acc: { lat: number, lng: number }, curr: { lat: number, lng: number }) => {
                        return { lat: acc.lat + curr.lat, lng: acc.lng + curr.lng };
                    }, { lat: 0, lng: 0 }
                );
                centerOfPolygon.lat /= paths.length;
                centerOfPolygon.lng /= paths.length;


                return (
                    <Polygon
                        key={polygonId}
                        paths={paths}
                        options={{
                            fillColor: "#4A90E2",
                            fillOpacity: 0.35,
                            strokeColor: "#4A90E2",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                        }}
                        onClick={() => setActiveInfoWindow(polygonId)}
                    >
                         {activeInfoWindow === polygonId && (
                            <InfoWindow
                                position={centerOfPolygon}
                                onCloseClick={() => setActiveInfoWindow(null)}
                            >
                                <div className="p-1">
                                    <h4 className="font-bold text-base mb-2">Lote: {polygonId}</h4>
                                    <p className="text-sm"><strong>Producción Total:</strong> {totalKilos.toLocaleString('es-ES')} kg</p>
                                    <p className="text-sm"><strong>Nº Cosechas:</strong> {polygonHarvests.length}</p>
                                </div>
                            </InfoWindow>
                        )}
                    </Polygon>
                );
            });
    };
    
    const renderMarkers = () => {
         if (!geoJsonData || !geoJsonData.features) return null;

         return geoJsonData.features
            .filter((feature: any) => feature.geometry && feature.geometry.type === 'Point')
            .map((feature: any, index: number) => {
                const [lng, lat] = feature.geometry.coordinates;
                const title = feature.properties ? Object.keys(feature.properties)[0] : 'Punto de interés';

                 return (
                    <Marker
                        key={`marker-${index}`}
                        position={{ lat, lng }}
                        title={title}
                    />
                 );
            });
    }

    if (loadError) {
        return <div>Error al cargar el mapa. Verifique la clave de API.</div>;
    }

    if (!isLoaded) {
        return <div>Cargando mapa...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={{
                width: '100%',
                height: '100%',
            }}
            center={center}
            zoom={15}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                mapTypeId: 'satellite',
            }}
        >
            {renderPolygons()}
            {renderMarkers()}
        </GoogleMap>
    );
};

export default MapComponent;
