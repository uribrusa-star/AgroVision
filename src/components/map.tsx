
'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { LatLngExpression, Map } from 'leaflet';
import { useRef, useEffect } from 'react';

type MapProps = {
    center: LatLngExpression;
    geoJsonData?: any;
};

const MapComponent = ({ center, geoJsonData }: MapProps) => {
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);

    return (
        <MapContainer whenCreated={map => mapRef.current = map} center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
                <Popup>
                    Ubicación del establecimiento.
                </Popup>
            </Marker>
            {geoJsonData && <GeoJSON data={geoJsonData} />}
        </MapContainer>
    );
};

export default MapComponent;
