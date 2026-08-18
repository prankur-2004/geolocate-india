import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({ onSelectLocation, isSubmitted }) {
  useMapEvents({
    click(e) {
      if (!isSubmitted) {
        onSelectLocation([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

function MapViewController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8, animate: true });
    } else {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

export default function GuessMap({ guessCoords, setGuessCoords, isSubmitted, actualCoords, gameMode }) {
  const defaultCenter = gameMode === "india" ? [22.5937, 78.9629] : [20.0, 0.0];
  const defaultZoom = gameMode === "india" ? 4 : 2;

  let bounds = null;
  if (isSubmitted && guessCoords && actualCoords) {
    bounds = [guessCoords, actualCoords];
  }

  return (
    <div
      style={{
        height: "100%",
        minHeight: "440px",
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        position: "relative",
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%", backgroundColor: "#0b0f19" }}
        maxBounds={[[-90, -180], [90, 180]]}
        minZoom={2}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapViewController center={defaultCenter} zoom={defaultZoom} bounds={bounds} />
        <MapClickHandler onSelectLocation={setGuessCoords} isSubmitted={isSubmitted} />

        {guessCoords && <Marker position={guessCoords} />}

        {isSubmitted && actualCoords && (
          <>
            <Marker position={actualCoords} />
            <Polyline positions={[guessCoords, actualCoords]} color="#ef4444" weight={3} dashArray="6, 8" />
          </>
        )}
      </MapContainer>
    </div>
  );
}