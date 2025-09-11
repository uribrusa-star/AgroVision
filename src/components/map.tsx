
'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon } from '@react-google-maps/api';

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

    const containerStyle = {
        width: '100%',
        height: '100%',
    };

    const renderPolygons = () => {
        if (!geoJsonData || !geoJsonData.features) return null;

        return geoJsonData.features
            .filter((feature: any) => feature.geometry && feature.geometry.type === 'Polygon')
            .map((feature: any, index: number) => {
                const paths = feature.geometry.coordinates[0].map((coord: [number, number]) => ({
                    lat: coord[1],
                    lng: coord[0],
                }));

                return (
                    <Polygon
                        key={`polygon-${index}`}
                        paths={paths}
                        options={{
                            fillColor: "#4A90E2",
                            fillOpacity: 0.35,
                            strokeColor: "#4A90E2",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                        }}
                    />
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
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                mapTypeId: 'terrain',
            }}
        >
            <Marker position={center} title="Ubicación del establecimiento" />
            {renderPolygons()}
            {renderMarkers()}
        </GoogleMap>
    );
};

export default MapComponent;
