"use client";

import { Link, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Home,
  User,
  Barcode,
  Heart,
  Utensils,
  BookOpen,
  MessageSquare,
  ArrowRight,
  HandHeart,
  Building,
  LogOut,
} from "lucide-react";
import "./sidebar.css";

function Sidebar() {
  const location = useLocation();
  const { user, isSignedIn } = useUser();

  // Get user role from metadata
  const userRole = user?.publicMetadata?.role || "provider";

  // Check if user is a provider or receiver
  const isProvider = userRole === "provider";
  const isReceiver = userRole === "receiver";

  return (
    <div className="sidebar">
      <Link to="/dashboard" className="sidebar-logo">
        Food Sense
      </Link>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`sidebar-nav-item ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
        >
          <Home />
          <span>Home</span>
        </Link>

        <Link
          to="/dashboard/scanner"
          className={`sidebar-nav-item ${
            location.pathname.includes("/scanner") ? "active" : ""
          }`}
        >
          <Barcode />
          <span>Bar Code Scanner</span>
        </Link>

        <Link
          to="/dashboard/panda-bot"
          className={`sidebar-nav-item ${
            location.pathname.includes("/panda-bot") ? "active" : ""
          }`}
        >
          <MessageSquare />
          <span>Panda Bot</span>
        </Link>

        {/* NGO section with submenu */}
        <div className="sidebar-nav-group">
          <Link
            to="/dashboard/ngo"
            className={`sidebar-nav-item ${
              location.pathname.includes("/ngo") ||
              location.pathname.includes("/provider") ||
              location.pathname.includes("/receiver")
                ? "active"
                : ""
            }`}
          >
            <Heart />
            <span>NGO</span>
          </Link>

          <div className="sidebar-submenu">
            {/* Show provider link only to providers or if no specific role */}
            {(isProvider || !isReceiver) && (
              <Link
                to="/dashboard/provider"
                className={`sidebar-submenu-item ${
                  location.pathname.includes("/provider") ? "active" : ""
                }`}
              >
                <ArrowRight size={16} />
                <HandHeart size={16} />
                <span>Food Providers</span>
              </Link>
            )}

            {/* Show receiver link only to receivers or if no specific role */}
            {(isReceiver || !isProvider) && (
              <Link
                to="/dashboard/receiver"
                className={`sidebar-submenu-item ${
                  location.pathname.includes("/receiver") ? "active" : ""
                }`}
              >
                <ArrowRight size={16} />
                <Building size={16} />
                <span>Food Receivers</span>
              </Link>
            )}
          </div>
        </div>

        <Link
          to="/dashboard/recipes"
          className={`sidebar-nav-item ${
            location.pathname.includes("/recipes") ? "active" : ""
          }`}
        >
          <BookOpen />
          <span>Recipes</span>
        </Link>

        <Link
          to="/dashboard/profile"
          className={`sidebar-nav-item ${
            location.pathname.includes("/profile") ? "active" : ""
          }`}
        >
          <User />
          <span>Profile</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        {isSignedIn && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user.firstName || user.emailAddresses[0].emailAddress}
            </div>
            <div className="sidebar-user-role">
              {userRole === "provider" ? "Food Provider" : "Food Receiver"}
            </div>
            <Link to="/sign-out" className="sidebar-logout">
              <LogOut size={16} />
              <span>Sign Out</span>
            </Link>
          </div>
        )}
        <div className="sidebar-copyright">
          &copy; 2025 Food Sense. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
