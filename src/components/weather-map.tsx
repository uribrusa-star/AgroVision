
'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as React from 'react';
import Map, { Source, Layer, LayerProps } from 'react-map-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

type WeatherMapProps = {
    center: {
        lat: number;
        lng: number;
    };
};

// --- CAPA DE DIAGNÓSTICO: Relieve de Mapbox ---
const terrainSource: any = {
    id: 'mapbox-terrain',
    type: 'raster-dem',
    url: 'mapbox://mapbox.terrain-rgb',
    tileSize: 512,
    maxzoom: 14
};

const hillshadeLayer: LayerProps = {
    id: 'hillshade',
    source: 'mapbox-terrain',
    type: 'hillshade',
    paint: {
        'hillshade-illumination-direction': 335,
        'hillshade-shadow-color': '#000',
    }
};

// --- CAPA ORIGINAL (comentada para diagnóstico) ---
// const precipitationSource: any = {
//     id: 'owm-precipitation',
//     type: 'raster',
//     tiles: [`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`],
//     tileSize: 256,
// };

// const precipitationLayer: LayerProps = {
//     id: 'precipitation_layer',
//     type: 'raster',
//     source: 'owm-precipitation',
//     paint: { 'raster-opacity': 0.7 },
// };


const WeatherMapComponent = ({ center }: WeatherMapProps) => {

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center h-full bg-muted-foreground/10">
                <p className="text-destructive-foreground p-4 bg-destructive rounded-md">
                    El token de acceso de Mapbox no está configurado.
                </p>
            </div>
        );
    }
    
    const mapKey = `weather-map-${MAPBOX_TOKEN}`;

    return (
        <Map
            key={mapKey}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
                longitude: center.lng,
                latitude: center.lat,
                zoom: 8
            }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        >
            {/* Capa de diagnóstico */}
            <Source {...terrainSource}>
                <Layer {...hillshadeLayer} />
            </Source>

            {/* Capa original de clima (desactivada) */}
            {/* 
            <Source {...precipitationSource}>
                <Layer {...precipitationLayer} />
            </Source> 
            */}
        </Map>
    );
};

export default WeatherMapComponent;
