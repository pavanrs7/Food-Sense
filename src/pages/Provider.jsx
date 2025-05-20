import ProviderForm from "../components/forms/ProviderForm";
import LocationMap from "../components/map/LocationMap";
import "./Provider.css";

function Provider() {
  return (
    <div className="provider-container">
      <div className="provider-content">
        <div className="provider-header">
          <h1 className="provider-title">List Surplus Food</h1>
          <p className="provider-subtitle">
            Fill out the form below to list your surplus food. This will help
            connect you with nearby organizations that can put it to good use.
          </p>
        </div>
        <ProviderForm />

        {/* Map Section */}
        <div className="map-container">
          <h2 className="map-title">Nearby Food Receivers</h2>
          <div className="map-wrapper">
            <LocationMap />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Provider;
