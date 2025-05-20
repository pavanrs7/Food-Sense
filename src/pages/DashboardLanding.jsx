import { Link } from "react-router-dom";
import "./dashboardLanding.css";
import Sidebar from "../components/layout/Sidebar";

// Import icons
import {
  Barcode,
  MessageSquare,
  Heart,
  Utensils,
  ArrowRight,
  Users,
  Leaf,
  ShoppingBag,
} from "lucide-react";

const DashboardLanding = () => {
  return (
    <div className="d-flex page-container">
      <Sidebar />
      <div className="content-area">
        <div className="dashboard-landing">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1>Eat Smart, Reduce Waste, Make a Difference</h1>
              <p>
                One stop destination for everything you need to change your
                relationship with food
              </p>
              <div className="hero-buttons">
                <Link to="/ngo" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/dashboard/scanner" className="btn btn-outline">
                  Try Scanner
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img src="/foodimg.png" alt="Healthy food plate" />
            </div>
          </section>

          {/* Why Food Sense Section */}
          <section className="why-section">
            <h2>Why Food Sense?</h2>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon green">
                  <Barcode size={24} />
                </div>
                <h3>Barcode Scanner</h3>
                <p>
                  Scan product barcodes to get detailed nutritional information
                  and healthier alternatives in real-time.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon blue">
                  <MessageSquare size={24} />
                </div>
                <h3>Panda Bot</h3>
                <p>
                  Get personalized food recommendations and nutrition advice
                  from our AI-powered assistant.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon red">
                  <Heart size={24} />
                </div>
                <h3>NGO Platform</h3>
                <p>
                  Connect food providers with receivers to reduce waste and help
                  those in need.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon orange">
                  <Utensils size={24} />
                </div>
                <h3>Healthy Recipes</h3>
                <p>
                  Discover delicious and nutritious recipes tailored to your
                  preferences and dietary needs.
                </p>
              </div>
            </div>
          </section>

          {/* Feature Showcase Section */}
          <section className="feature-showcase">
            <div className="feature-item">
              <div className="feature-text">
                <h2>Scan Barcodes for Healthier Choices</h2>
                <p>
                  Our barcode scanner instantly provides nutritional information
                  and suggests healthier alternatives for any packaged food
                  product.
                </p>
                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span> Detailed nutritional
                    breakdown
                  </li>
                  <li>
                    <span className="check">✓</span> Health score rating
                  </li>
                  <li>
                    <span className="check">✓</span> Healthier product
                    alternatives
                  </li>
                  <li>
                    <span className="check">✓</span> Allergen alerts
                  </li>
                </ul>
                <Link to="/dashboard/scanner" className="feature-link">
                  Try the Scanner <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="feature-item reverse">
              <div className="feature-text">
                <h2>Chat with Panda Bot</h2>
                <p>
                  Our AI-powered nutrition assistant helps you make better food
                  choices with personalized recommendations.
                </p>
                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span> Meal planning assistance
                  </li>
                  <li>
                    <span className="check">✓</span> Nutritional advice
                  </li>
                  <li>
                    <span className="check">✓</span> Food substitution ideas
                  </li>
                  <li>
                    <span className="check">✓</span> Diet-specific guidance
                  </li>
                </ul>
                <Link to="/panda-bot" className="feature-link">
                  Chat with Panda <ArrowRight size={16} />
                </Link>
              </div>
              <div className="feature-image">
                <img src="/image 10.png" alt="Panda Bot interface" />
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-text">
                <h2>Connect Through Our NGO Platform</h2>
                <p>
                  Reduce food waste and help those in need by connecting food
                  providers with receivers.
                </p>
                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span> Easy food donation process
                  </li>
                  <li>
                    <span className="check">✓</span> Location-based matching
                  </li>
                  <li>
                    <span className="check">✓</span> Real-time notifications
                  </li>
                  <li>
                    <span className="check">✓</span> Impact tracking
                  </li>
                </ul>
                <Link to="/ngo" className="feature-link">
                  Explore NGO Platform <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="feature-item reverse">
              <div className="feature-text">
                <h2>Discover Healthy Recipes</h2>
                <p>
                  Find delicious, nutritious recipes tailored to your
                  preferences and available ingredients.
                </p>
                <ul className="feature-list">
                  <li>
                    <span className="check">✓</span> Personalized recipe
                    suggestions
                  </li>
                  <li>
                    <span className="check">✓</span> Dietary restriction filters
                  </li>
                  <li>
                    <span className="check">✓</span> Ingredient-based search
                  </li>
                  <li>
                    <span className="check">✓</span> Nutritional information
                  </li>
                </ul>
                <Link to="/recipes" className="feature-link">
                  Browse Recipes <ArrowRight size={16} />
                </Link>
              </div>
              <div className="feature-image">
                <img src="recipes.svg" alt="Recipe collection" />
              </div>
            </div>
          </section>

          {/* How to Contribute Section */}
          <section className="contribute-section">
            <h2>How to Contribute to Society?</h2>

            <div className="contribute-content">
              <div className="contribute-image">
                <img src="community.svg" alt="People sharing food" />
              </div>

              <div className="contribute-text">
                <div className="contribute-item">
                  <h3>
                    <Users size={20} /> Join as a Food Provider
                  </h3>
                  <p>
                    Donate your surplus food to those who need it most.
                    Restaurants, grocery stores, and individuals can all
                    contribute.
                  </p>
                </div>

                <div className="contribute-item">
                  <h3>
                    <ShoppingBag size={20} /> Register as a Receiver
                  </h3>
                  <p>
                    NGOs, community kitchens, and shelters can register to
                    receive food donations in their area.
                  </p>
                </div>

                <div className="contribute-item">
                  <h3>
                    <Leaf size={20} /> Reduce Food Waste
                  </h3>
                  <p>
                    Learn how to properly store food, understand expiration
                    dates, and use leftovers creatively to minimize waste.
                  </p>
                </div>

                <Link to="/ngo" className="btn btn-primary">
                  Join the Movement
                </Link>
              </div>
            </div>
          </section>

          {/* About Us Section */}
          <section className="about-section" id="about">
            <h2>About Food Sense</h2>

            <div className="about-content">
              <div className="about-text">
                <p>
                  Food Sense is a platform dedicated to promoting healthier
                  eating habits, reducing food waste, and creating a more
                  sustainable food ecosystem. Our mission is to empower
                  individuals and organizations to make better food choices
                  while helping those in need.
                </p>

                <p>
                  Founded in 2025, Food Sense combines technology and community
                  engagement to address some of the most pressing food-related
                  challenges of our time. Through our innovative tools and
                  platforms, we're building a world where good food is
                  accessible to all and nothing goes to waste.
                </p>

                <div className="about-stats">
                  <div className="stat-item">
                    <div className="stat-number">10+</div>
                    <div className="stat-label">Users</div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-number">5+</div>
                    <div className="stat-label">Food Donations</div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-number">100+</div>
                    <div className="stat-label">Products Scanned</div>
                  </div>
                </div>
              </div>

              <div className="about-image">
                <img
                  src="WhatsApp Image 2025-05-17 at 09.43.26_61148714.jpg"
                  alt="Food Sense team"
                />
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="cta-section">
            <h2>Join the Food Sense Movement!</h2>
            <p>
              Start tracking your meals, making smarter food choices, and
              helping others today.
            </p>
            <Link to="/ngo" className="btn btn-primary btn-large">
              Get Started Now
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardLanding;
