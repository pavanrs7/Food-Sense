import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { geocodeAddress } from "../../services/geocoding";
import LocationMap from "../map/LocationMap";
import "./ProviderForm.css"; // Reusing the same styles

function ReceiverForm() {
  const [formData, setFormData] = useState({
    organizationName: "",
    type: "",
    capacity: "",
    description: "",
    contact: "",
  });

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Get user's location when component mounts
  useEffect(() => {
    if (!useManualLocation && navigator.geolocation) {
      setLocationStatus("Detecting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus("Location detected successfully");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus(`Error detecting location: ${error.message}`);
          // Automatically switch to manual entry if geolocation is denied
          if (error.code === error.PERMISSION_DENIED) {
            setUseManualLocation(true);
          }
        }
      );
    }
  }, [useManualLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManualAddressChange = (e) => {
    const { name, value } = e.target;
    setManualAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationToggle = () => {
    setUseManualLocation((prev) => !prev);
    // Reset location if switching to automatic
    if (useManualLocation && navigator.geolocation) {
      setLocation(null);
      setLocationStatus("Detecting your location...");
    }
  };

  const handleGeocodeAddress = async () => {
    const { address, city, state, postalCode } = manualAddress;

    if (!address || !city || !state) {
      setError("Please fill in all address fields");
      return;
    }

    setGeocodingLoading(true);
    setLocationStatus("Converting address to coordinates...");

    try {
      const geocodedLocation = await geocodeAddress(manualAddress);
      setLocation({
        latitude: geocodedLocation.latitude,
        longitude: geocodedLocation.longitude,
        address: geocodedLocation.address,
      });
      setLocationStatus("Address converted to coordinates successfully");
    } catch (err) {
      console.error("Geocoding error:", err);
      setLocationStatus("Failed to convert address to coordinates");
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      setError(
        "Location is required. Please allow location access or enter your address manually."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Submitting to Firestore:", {
        ...formData,
        location,
        timestamp: new Date().toISOString(),
      });

      // Add document to Firestore
      const docRef = await addDoc(collection(db, "receivers"), {
        ...formData,
        location,
        timestamp: new Date().toISOString(),
      });

      console.log("Document written with ID: ", docRef.id);

      // Reset form
      setFormData({
        organizationName: "",
        type: "",
        capacity: "",
        description: "",
        contact: "",
      });

      if (useManualLocation) {
        setManualAddress({
          address: "",
          city: "",
          state: "",
          postalCode: "",
        });
      }

      // Show success message
      setSuccess(true);

      // Scroll to top to ensure success message is visible
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error("Error adding document:", err);
      setError(`Failed to submit form: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {success && (
        <div className="form-success">
          <div className="success-icon">✓</div>
          <h3>Organization registered successfully!</h3>
          <p>
            Thank you for registering. Your organization is now visible on the
            map.
          </p>
        </div>
      )}

      {error && <div className="form-error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="organizationName" className="form-label">
            Organization Name
          </label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            className="form-input"
            value={formData.organizationName}
            onChange={handleChange}
            required
            placeholder="Name of your organization"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Organization Type
          </label>
          <select
            id="type"
            name="type"
            className="form-select"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Organization Type</option>
            <option value="NGO">NGO</option>
            <option value="Old Age Home">Old Age Home</option>
            <option value="Orphanage">Orphanage</option>
            <option value="Shelter">Shelter</option>
            <option value="Community Kitchen">Community Kitchen</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="capacity" className="form-label">
            Capacity (number of people)
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            className="form-input"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            placeholder="How many people can you serve?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us about your organization and who you serve"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="contact" className="form-label">
            Contact Information
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            className="form-input"
            value={formData.contact}
            onChange={handleChange}
            required
            placeholder="Phone number or email"
          />
        </div>

        {/* Location Section */}
        <div className="form-group">
          <div className="location-toggle">
            <label className="form-label">Your Location</label>
            <div className="toggle-container">
              <button
                type="button"
                className={`toggle-btn ${!useManualLocation ? "active" : ""}`}
                onClick={() => setUseManualLocation(false)}
              >
                Automatic
              </button>
              <button
                type="button"
                className={`toggle-btn ${useManualLocation ? "active" : ""}`}
                onClick={() => setUseManualLocation(true)}
              >
                Manual Entry
              </button>
            </div>
          </div>

          {!useManualLocation ? (
            <div
              className={`location-status ${location ? "success" : "error"}`}
            >
              {locationStatus}
            </div>
          ) : (
            <div className="manual-location">
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-input"
                  value={manualAddress.address}
                  onChange={handleManualAddressChange}
                  placeholder="123 Main St"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="form-input"
                    value={manualAddress.city}
                    onChange={handleManualAddressChange}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state" className="form-label">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className="form-input"
                    value={manualAddress.state}
                    onChange={handleManualAddressChange}
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postalCode" className="form-label">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    className="form-input"
                    value={manualAddress.postalCode}
                    onChange={handleManualAddressChange}
                    placeholder="Postal Code"
                  />
                </div>
              </div>

              <button
                type="button"
                className="geocode-btn"
                onClick={handleGeocodeAddress}
                disabled={geocodingLoading}
              >
                {geocodingLoading ? "Processing..." : "Verify Address"}
              </button>

              {location && location.address && (
                <div className="location-status success">
                  Address verified successfully
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="form-submit"
          disabled={loading || !location}
        >
          {loading ? "Registering..." : "Register Organization"}
        </button>
      </form>

      {/* Map showing the current location */}
      {location && (
        <div className="form-map-section">
          <h3 className="form-map-title">Your Location on Map</h3>
          <div className="form-map-container">
            <LocationMap
              initialLocation={location}
              showDistanceCalculator={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiverForm;
