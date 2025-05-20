import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { calculateDistance, formatDistance } from "../../services/distance";
import "leaflet/dist/leaflet.css";
import "./LocationMap.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for providers and receivers
const providerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const receiverIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to update map center based on user location
function LocationMarker({ setUserLocation }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });

    map.on("locationfound", (e) => {
      setUserLocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    });

    map.on("locationerror", (e) => {
      console.error("Error getting location:", e);
      // Default to India center if location not found
      setUserLocation({
        latitude: 20.5937,
        longitude: 78.9629,
      });
    });
  }, [map, setUserLocation]);

  return null;
}

function LocationMap({
  initialLocation = null,
  showDistanceCalculator = true,
}) {
  const [providers, setProviders] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [userLocation, setUserLocation] = useState(initialLocation);
  const [center] = useState(
    initialLocation
      ? [initialLocation.latitude, initialLocation.longitude]
      : [20.5937, 78.9629]
  ); // India center coordinates

  // Distance calculation states
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [distanceResult, setDistanceResult] = useState(null);

  useEffect(() => {
    // Subscribe to providers collection
    const unsubscribeProviders = onSnapshot(
      collection(db, "providers"),
      (snapshot) => {
        const providersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: "provider",
          ...doc.data(),
        }));
        setProviders(providersData);
      },
      (error) => {
        console.error("Error fetching providers:", error);
      }
    );

    // Subscribe to receivers collection
    const unsubscribeReceivers = onSnapshot(
      collection(db, "receivers"),
      (snapshot) => {
        const receiversData = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: "receiver",
          ...doc.data(),
        }));
        setReceivers(receiversData);
      },
      (error) => {
        console.error("Error fetching receivers:", error);
      }
    );

    return () => {
      unsubscribeProviders();
      unsubscribeReceivers();
    };
  }, []);

  // Update user location if initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setUserLocation(initialLocation);
    }
  }, [initialLocation]);

  const startDistanceCalculation = useCallback((point) => {
    setCalculatingDistance(true);
    setSelectedPoint(point);
    setDistanceResult(null);
  }, []);

  const calculateDistanceBetweenPoints = useCallback(
    (secondPoint) => {
      if (!selectedPoint) return;

      const distance = calculateDistance(
        selectedPoint.location,
        secondPoint.location
      );

      setDistanceResult({
        distance,
        formattedDistance: formatDistance(distance),
        from: selectedPoint,
        to: secondPoint,
      });

      setCalculatingDistance(false);
      setSelectedPoint(null);
    },
    [selectedPoint]
  );

  const cancelDistanceCalculation = useCallback(() => {
    setCalculatingDistance(false);
    setSelectedPoint(null);
    setDistanceResult(null);
  }, []);

  // Combine providers and receivers for rendering
  const allPoints = [...providers, ...receivers];

  return (
    <div className="map-container">
      {calculatingDistance && (
        <div className="distance-calculation-banner">
          <p>Select a second point to calculate distance</p>
          <button
            className="cancel-distance-btn"
            onClick={cancelDistanceCalculation}
          >
            Cancel
          </button>
        </div>
      )}

      {distanceResult && (
        <div className="distance-result-banner">
          <p>
            <strong>Distance:</strong> {distanceResult.formattedDistance}{" "}
            between
            {distanceResult.from.type === "provider"
              ? ` ${distanceResult.from.name}`
              : ` ${distanceResult.from.organizationName}`}{" "}
            and
            {distanceResult.to.type === "provider"
              ? ` ${distanceResult.to.name}`
              : ` ${distanceResult.to.organizationName}`}
          </p>
          <button
            className="close-distance-btn"
            onClick={() => setDistanceResult(null)}
          >
            Close
          </button>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Update map center based on user location if not provided initially */}
        {!initialLocation && (
          <LocationMarker setUserLocation={setUserLocation} />
        )}

        {/* Render all points (providers and receivers) */}
        {allPoints.map((point) => (
          <Marker
            key={point.id}
            position={[point.location.latitude, point.location.longitude]}
            icon={
              selectedPoint && selectedPoint.id === point.id
                ? selectedIcon
                : point.type === "provider"
                ? providerIcon
                : receiverIcon
            }
          >
            <Popup>
              <div className="map-popup">
                <h3 className="map-popup-title">
                  {point.type === "provider"
                    ? point.name
                    : point.organizationName}
                </h3>

                {point.type === "provider" ? (
                  <>
                    <p className="map-popup-info">
                      <strong>Food Type:</strong> {point.foodType}
                    </p>
                    <p className="map-popup-info">
                      <strong>Quantity:</strong> {point.foodQuantity} servings
                    </p>
                    <p className="map-popup-info">
                      <strong>Expires:</strong>{" "}
                      {new Date(point.expiryTime).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="map-popup-info">
                      <strong>Type:</strong> {point.type}
                    </p>
                    <p className="map-popup-info">
                      <strong>Capacity:</strong> {point.capacity} people
                    </p>
                  </>
                )}

                <p className="map-popup-info">
                  <strong>Contact:</strong> {point.contact}
                </p>

                {userLocation && (
                  <p className="map-popup-distance">
                    <strong>Distance from you:</strong>{" "}
                    {formatDistance(
                      calculateDistance(userLocation, point.location)
                    )}
                  </p>
                )}

                {showDistanceCalculator && (
                  <div className="map-popup-actions">
                    {calculatingDistance ? (
                      selectedPoint && selectedPoint.id !== point.id ? (
                        <button
                          className="calculate-distance-btn"
                          onClick={() => calculateDistanceBetweenPoints(point)}
                        >
                          Select as destination
                        </button>
                      ) : (
                        <p className="map-popup-info">
                          This point is already selected
                        </p>
                      )
                    ) : (
                      <button
                        className="calculate-distance-btn"
                        onClick={() => startDistanceCalculation(point)}
                      >
                        Calculate distance to another point
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Map legend */}
        <div className="map-legend">
          <div className="map-legend-item">
            <div className="map-legend-color map-legend-provider"></div>
            <span className="map-legend-text">Food Providers</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-color map-legend-receiver"></div>
            <span className="map-legend-text">Food Receivers</span>
          </div>
          {selectedPoint && (
            <div className="map-legend-item">
              <div className="map-legend-color map-legend-selected"></div>
              <span className="map-legend-text">Selected Point</span>
            </div>
          )}
        </div>
      </MapContainer>
    </div>
  );
}

export default LocationMap;
