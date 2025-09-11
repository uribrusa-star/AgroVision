
'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Data } from '@react-google-maps/api';

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
            }}
        >
            <Marker position={center} title="Ubicación del establecimiento" />
            {geoJsonData && <Data data={geoJsonData} />}
        </GoogleMap>
    );
};

export default MapComponent;
