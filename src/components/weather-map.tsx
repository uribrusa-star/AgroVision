'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as React from 'react';
import Map, { Source, Layer, LayerProps } from 'react-map-gl';
import { Button } from './ui/button';
import { CloudRain } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type WeatherMapProps = {
    center: {
        lat: number;
        lng: number;
    };
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


const WeatherMapComponent = ({ center }: WeatherMapProps) => {
    const [showPrecipitation, setShowPrecipitation] = React.useState(true);

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
        <div className="relative w-full h-full">
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
