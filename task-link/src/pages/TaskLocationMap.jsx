import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix leaflet's broken default icon paths when bundled with webpack/CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom purple marker to match the app's primary color
const customIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="#8b5cf6" stroke="#fff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `)}`,
  iconSize:     [24, 36],
  iconAnchor:   [12, 36],
  popupAnchor:  [0, -36],
});

/**
 * TaskLocationMap
 *
 * Props:
 *   latitude  {number|string}  — decimal degrees
 *   longitude {number|string}  — decimal degrees
 *   location  {string}         — display name shown in popup
 *   address   {string}         — optional full address
 *   zoom      {number}         — default 14
 *   height    {string}         — CSS height, default '220px'
 *   blurRadius {number}        — approximate radius circle in metres (default 300)
 *                                Set to 0 to show exact pin instead
 */
const TaskLocationMap = ({
  latitude,
  longitude,
  location,
  address,
  zoom       = 14,
  height     = '220px',
  blurRadius = 300,
}) => {
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(false);

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const hasCoords = !isNaN(lat) && !isNaN(lng);

  // Geocode the location string if lat/lng aren't available
  useEffect(() => {
    if (hasCoords) {
      setCoords([lat, lng]);
      return;
    }
    if (!location) return;

    const query = address ? `${address}, ${location}` : location;
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setGeoError(true);
        }
      })
      .catch(() => setGeoError(true));
  }, [lat, lng, hasCoords, location, address]);

  // Fallback UI when nothing is resolvable
  if (geoError || (!hasCoords && !location)) {
    return (
      <div
        style={{ height }}
        className="rounded-xl bg-muted flex flex-col items-center justify-center border border-border text-muted-foreground gap-2"
      >
        <MapPin className="w-8 h-8 opacity-40" />
        <p className="text-sm font-medium">{location || 'Location not specified'}</p>
        {address && <p className="text-xs opacity-70">{address}</p>}
      </div>
    );
  }

  // Loading state while geocoding
  if (!coords) {
    return (
      <div
        style={{ height }}
        className="rounded-xl bg-muted flex items-center justify-center border border-border animate-pulse"
      >
        <MapPin className="w-6 h-6 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={coords}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {blurRadius > 0 ? (
          // Show approximate area circle — exact address hidden until hired
          <>
            <Circle
              center={coords}
              radius={blurRadius}
              pathOptions={{
                color:       '#8b5cf6',
                fillColor:   '#8b5cf6',
                fillOpacity: 0.15,
                weight:      2,
              }}
            />
            <Marker position={coords} icon={customIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{location}</p>
                  {address && <p className="text-muted-foreground text-xs mt-0.5">{address}</p>}
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Exact address shared after hiring
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        ) : (
          // Exact pin
          <Marker position={coords} icon={customIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{location}</p>
                {address && <p className="text-xs text-muted-foreground mt-0.5">{address}</p>}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default TaskLocationMap;