
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { LatLngExpression, Map, geoJSON, tileLayer, marker, popup } from 'leaflet';
import { useRef, useEffect } from 'react';

type MapProps = {
    center: LatLngExpression;
    geoJsonData?: any;
};

const MapComponent = ({ center, geoJsonData }: MapProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        // Solo inicializar el mapa si el contenedor existe y no hay un mapa ya instanciado.
        if (mapContainerRef.current && !mapRef.current) {
            const map = new Map(mapContainerRef.current).setView(center, 13);
            mapRef.current = map;

            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            marker(center).addTo(map)
                .bindPopup('Ubicación del establecimiento.');
        }

        // Limpiar la instancia del mapa al desmontar el componente.
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center]); // El effect solo depende del centro, que no debería cambiar frecuentemente.

    useEffect(() => {
        // Añadir o actualizar datos GeoJSON cuando cambien
        if (mapRef.current && geoJsonData) {
            const geoJsonLayer = geoJSON(geoJsonData);
            // Limpiar capas anteriores si es necesario
            mapRef.current.eachLayer((layer) => {
                if (!!layer.toGeoJSON) {
                    mapRef.current!.removeLayer(layer);
                }
            });
            geoJsonLayer.addTo(mapRef.current);
        }
    }, [geoJsonData]);

    return (
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
    );
};

export default MapComponent;
