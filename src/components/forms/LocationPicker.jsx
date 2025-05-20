import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      },
    });

    return position === null ? null : <Marker position={position}></Marker>;
  }

  return (
    <div className="location-picker">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "300px", width: "100%" }}
        className="rounded-xl shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <LocationMarker />
      </MapContainer>
      <p className="text-sm text-gray-500 mt-2">
        Click on the map to select your location
      </p>
    </div>
  );
}

export default LocationPicker;
