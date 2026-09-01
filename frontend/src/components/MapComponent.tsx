'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent({ mechanics }: { mechanics: any[] }) {
  return (
    <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mechanics.filter(m => m.lat && m.lng).map((mechanic) => (
        <Marker key={mechanic.id} position={[mechanic.lat, mechanic.lng]}>
          <Popup>
            <div className="font-semibold">{mechanic.name}</div>
            <div className="text-sm">{mechanic.status}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
