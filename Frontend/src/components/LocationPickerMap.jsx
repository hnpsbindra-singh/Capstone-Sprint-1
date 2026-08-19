import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const LocationPickerMap = ({ initialLat = 19.0760, initialLng = 72.8777, onLocationSelect }) => {
  const [position, setPosition] = useState([initialLat, initialLng]);

  const handleSelect = (lat, lng) => {
    setPosition([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        📍 Click anywhere on the map to pinpoint exact location coordinates:
      </p>
      <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <MapContainer
          center={position}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleSelect} />
          <Marker position={position} />
        </MapContainer>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <span>Selected Lat: <strong>{Number(position[0]).toFixed(4)}</strong></span>
        <span>Selected Lng: <strong>{Number(position[1]).toFixed(4)}</strong></span>
      </div>
    </div>
  );
};

export default LocationPickerMap;
