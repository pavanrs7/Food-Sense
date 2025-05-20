import { Link } from "react-router-dom";
import "./NGO.css";

function NGO() {
  return (
    <div className="ngo-container">
      <div className="ngo-content">
        <div className="ngo-header">
          <h1 className="ngo-title">Food Donation Network</h1>
          <p className="ngo-subtitle">
            Connect with organizations to donate or receive surplus food
          </p>
        </div>

        <div className="ngo-cards">
          <div className="ngo-card">
            <div className="ngo-card-icon">
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <div className="ngo-card-body">
              <h2 className="ngo-card-title">I Want to Donate Food</h2>
              <p className="ngo-card-text">
                List your surplus food to help reduce waste and feed those in
                need
              </p>
              <Link to="/dashboard/provider" className="ngo-card-button">
                Become a Provider
              </Link>
            </div>
          </div>

          <div className="ngo-card">
            <div className="ngo-card-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="ngo-card-body">
              <h2 className="ngo-card-title">I Need Food Donations</h2>
              <p className="ngo-card-text">
                Register your organization to receive notifications about
                available food
              </p>
              <Link to="/dashboard/receiver" className="ngo-card-button">
                Become a Receiver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NGO;
