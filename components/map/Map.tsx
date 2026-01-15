'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Next.js
const customIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface MapProps {
    coords: [number, number]; // [lat, lng]
    popupText?: string;
    onCoordsChange?: (coords: [number, number]) => void;
}

function ClickHandler({ onCoordsChange }: { onCoordsChange?: (coords: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            if (onCoordsChange) {
                onCoordsChange([e.latlng.lat, e.latlng.lng]);
            }
        },
    });
    return null;
}

function MapUpdater({ coords }: { coords: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(coords, 16);
    }, [coords, map]);
    return null;
}

export default function Map({ coords, popupText, onCoordsChange }: MapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
             setIsMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted) {
        return <div className="h-[400px] w-full bg-stone-100 animate-pulse rounded-xl" />;
    }

    return (
        <MapContainer center={coords} zoom={13} scrollWheelZoom={false} className="h-full w-full rounded-xl z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onCoordsChange={onCoordsChange} />
            <MapUpdater coords={coords} />
            <Marker position={coords} icon={customIcon}>
                {popupText && <Popup>{popupText}</Popup>}
            </Marker>
        </MapContainer>
    );
}
