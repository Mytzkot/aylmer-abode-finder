import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { PROPERTIES } from "@/data/properties";

// Red Google-style drop pin as an inline SVG divIcon (no asset hosting, no
// missing-marker bug from Leaflet's default icon paths).
const redPin = L.divIcon({
  className: "zorba-pin",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 1c-7.7 0-14 6.1-14 13.7 0 9.9 12.3 24.6 13.1 25.6.5.6 1.3.6 1.8 0C17.7 39.3 30 24.6 30 14.7 30 7.1 23.7 1 16 1z"
      fill="#E53935" stroke="#7A1A18" stroke-width="1.5"/>
    <circle cx="16" cy="14" r="5" fill="#FFFFFF"/>
  </svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
});

function FitToMarkers() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(PROPERTIES.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map]);
  return null;
}

export default function LocationsMap() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-full h-[320px] bg-surface-dark/40" aria-hidden="true" />;
  }

  const center: [number, number] = [45.402, -75.82];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: 320, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers />
      {PROPERTIES.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={redPin}>
          <Popup>
            <div className="text-sm">
              <div className="font-bold mb-0.5">{p.address}</div>
              <div className="text-xs text-gray-600 mb-1.5">{p.city}</div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs"
              >
                Get directions →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
