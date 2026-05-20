import ReceiverForm from "../components/forms/ReceiverForm";
import LocationMap from "../components/map/LocationMap";
import "./Receiver.css";

function Receiver() {
  return (
    <div className="receiver-container">
      <div className="receiver-content">
        <div className="receiver-header">
          <h1 className="receiver-title">Register as Food Receiver</h1>
          <p className="receiver-subtitle">
            Register your organization to receive notifications about available
            surplus food in your area.
          </p>
        </div>
        <ReceiverForm />

        {/* Map Section */}
        <div className="map-container">
          <h2 className="map-title">Nearby Food Providers</h2>
          <div className="map-wrapper">
            <LocationMap />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Receiver;
