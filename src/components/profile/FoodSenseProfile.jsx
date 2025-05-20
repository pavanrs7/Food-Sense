"use client";

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import "./foodSenseProfile.css";

const FoodSenseProfile = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role || "provider";

  const [formData, setFormData] = useState({
    name: user?.firstName || "User",
    mobile: user?.phoneNumbers?.[0]?.phoneNumber || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    location: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update user metadata with Clerk
      await user.update({
        firstName: formData.name,
        // You can't update email directly with Clerk, it requires verification
        // For phone, you would use user.phoneNumbers.create() and verification
      });

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const donationItems = [
    {
      image: "https://placehold.co/100x100/4CAF50/FFFFFF/png?text=🍲",
      title: "Meals",
      category: "Prepared Food",
      date: "7 June 2021",
    },
    {
      image: "https://placehold.co/100x100/4CAF50/FFFFFF/png?text=🍪",
      title: "Biscuits",
      category: "Grocery",
      date: "12 June 2021",
    },
    {
      image: "https://placehold.co/100x100/4CAF50/FFFFFF/png?text=🍚",
      title: "Rice and Oil",
      category: "Grocery",
      date: "12 June 2021",
    },
    {
      image: "https://placehold.co/100x100/4CAF50/FFFFFF/png?text=🍌",
      title: "Banana",
      category: "Fruits",
      date: "15 June 2021",
    },
    {
      image: "https://placehold.co/100x100/4CAF50/FFFFFF/png?text=🍛",
      title: "Fried rice and curry",
      category: "Prepared Food",
      date: "20 June 2021",
    },
  ];

  return (
    <div className="profile-container">
      {showSuccess && (
        <div className="success-alert">
          <i className="fas fa-check-circle"></i> User information saved
          successfully!
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-form-section">
          <div className="profile-card">
            <div className="profile-logo">
              <img
                src={
                  user?.imageUrl ||
                  "https://placehold.co/100x100/4CAF50/FFFFFF/png?text=FS"
                }
                alt="User Avatar"
              />
              <div>
                <h2>Food Sense</h2>
                <span className="user-role-badge">
                  {userRole === "provider" ? "Food Provider" : "Food Receiver"}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile no.</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                />
                <small className="form-text text-muted">
                  Email cannot be changed directly. Contact support for
                  assistance.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit" className="save-btn">
                Save
              </button>
            </form>
          </div>
        </div>

        <div className="donations-section">
          <div className="donations-card">
            <div className="congrats-message">
              <i className="fas fa-award"></i>
              &nbsp; Congrats, {user?.firstName || "User"}! You quenched the
              hunger of 20 people this year!
            </div>

            <h3 className="donations-title">
              <i className="fas fa-gift"></i>
              &nbsp;{" "}
              {userRole === "provider"
                ? "My Donations"
                : "Received Donations"}{" "}
              (05)
            </h3>

            <div className="donation-list">
              {donationItems.map((item, index) => (
                <div key={index} className="donation-item">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                  />
                  <div className="donation-details">
                    <h4>{item.title}</h4>
                    <p>
                      <span className="category-badge">{item.category}</span>
                      <span className="date-text">{item.date}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodSenseProfile;
