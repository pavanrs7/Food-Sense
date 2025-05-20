"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import "./auth.css";

const SignOutPage = () => {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        if (isSignedIn) {
          await signOut();
        }
        // Add a small delay to ensure the sign-out process is complete
        setTimeout(() => {
          navigate("/auth");
        }, 1000);
      } catch (error) {
        console.error("Error signing out:", error);
        // If sign out fails, still try to navigate to auth page
        navigate("/auth");
      }
    };

    performSignOut();
  }, [signOut, navigate, isSignedIn]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Food Sense</h1>
          <p>Reducing food waste, feeding communities</p>
        </div>
        <div className="sign-out-content">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <h2>Signing you out...</h2>
          <p>Please wait while we securely sign you out.</p>
        </div>
      </div>
    </div>
  );
};

export default SignOutPage;
