'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js/Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// A component to automatically fit bounds to all markers
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface VendorMapProps {
  vendors: {
    [category: string]: Array<{
      name: string;
      lat: number;
      lon: number;
      distance_km: number;
      osm_id: number;
      maps_url: string;
    }>
  };
}

export default function VendorMap({ vendors }: VendorMapProps) {
  // Extract all valid vendors that have coordinates
  const markers: Array<{lat: number, lon: number, name: string, cat: string, id: number, url: string}> = [];
  
  Object.keys(vendors).forEach(cat => {
    vendors[cat].forEach(v => {
      if (v.lat && v.lon) {
        markers.push({
          lat: v.lat,
          lon: v.lon,
          name: v.name,
          cat: cat,
          id: v.osm_id,
          url: v.maps_url
        });
      }
    });
  });

  // Default to India Center if nothing found
  const center: [number, number] = markers.length > 0 
    ? [markers[0].lat, markers[0].lon] 
    : [20.5937, 78.9629];

  if (markers.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F6F6F6', borderRadius: '12px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No vendor locations found for this city.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E8E4DC' }}>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={12} />
        {markers.map(m => (
          <Marker position={[m.lat, m.lon]} icon={icon} key={`${m.cat}-${m.id}`}>
            <Popup>
              <div style={{ fontFamily: 'var(--font-body)' }}>
                <strong style={{ color: 'var(--maroon)' }}>{m.name}</strong><br/>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{m.cat}</span><br/>
                <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--gold-dark)', textDecoration: 'underline' }}>
                  Open in Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
