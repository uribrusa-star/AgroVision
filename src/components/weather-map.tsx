'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as React from 'react';
import Map, { Source, Layer, LayerProps } from 'react-map-gl';
import { Button } from './ui/button';
import { CloudRain } from 'lucide-react';

type WeatherMapProps = {
    center: {
        lat: number;
        lng: number;
    };
    mapboxAccessToken: string;
};

const radarSource: any = {
    id: 'mapbox-weather-radar',
    type: 'raster',
    url: 'mapbox://mapbox.weather-radar-v2'
};

const radarLayer: LayerProps = {
    id: 'weather-radar-layer',
    type: 'raster',
    source: 'mapbox-weather-radar',
    paint: {
        'raster-fade-duration': 0,
        'raster-opacity': 0.6
    }
};


const WeatherMapComponent = ({ center, mapboxAccessToken }: WeatherMapProps) => {
    const [showPrecipitation, setShowPrecipitation] = React.useState(true);

    if (!mapboxAccessToken) {
        return (
            <div className="flex items-center justify-center h-full bg-muted-foreground/10">
                <p className="text-destructive p-4 bg-destructive-foreground rounded-md">
                    El token de acceso de Mapbox no está configurado.
                </p>
            </div>
        );
    }
    
    return (
        <div className="relative w-full h-full">
            <Map
                key={mapboxAccessToken}
                mapboxAccessToken={mapboxAccessToken}
                initialViewState={{
                    longitude: center.lng,
                    latitude: center.lat,
                    zoom: 1
                }}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            >
                {showPrecipitation && (
                    <Source {...radarSource}>
                        <Layer {...radarLayer} />
                    </Source>
                )}
            </Map>
            <div className="absolute top-2 right-2 z-10">
                <Button 
                    variant={showPrecipitation ? "default" : "secondary"} 
                    size="icon"
                    onClick={() => setShowPrecipitation(!showPrecipitation)}
                    title="Mostrar/Ocultar Precipitación"
                >
                    <CloudRain className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default WeatherMapComponent;