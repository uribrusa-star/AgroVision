
'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as React from 'react';
import Map, { Source, Layer, MapLayerMouseEvent } from 'react-map-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type WeatherMapProps = {
    center: {
        lat: number;
        lng: number;
    };
};

const WeatherMapComponent = ({ center }: WeatherMapProps) => {

    const imageCoordinates = [
        [center.lng - 1, center.lat + 1],
        [center.lng + 1, center.lat + 1],
        [center.lng + 1, center.lat - 1],
        [center.lng - 1, center.lat - 1]
    ];

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center h-full bg-muted-foreground/10">
                <p className="text-destructive-foreground p-4 bg-destructive rounded-md">
                    El token de acceso de Mapbox no está configurado.
                </p>
            </div>
        );
    }
    
    return (
        <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
                longitude: center.lng,
                latitude: center.lat,
                zoom: 8
            }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        >
            <Source
                id="radar-source"
                type="image"
                url="https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif"
                coordinates={imageCoordinates}
            >
                <Layer
                    id="radar-layer"
                    type="raster"
                    paint={{ 'raster-fade-duration': 0 }}
                />
            </Source>
        </Map>
    );
};

export default WeatherMapComponent;
