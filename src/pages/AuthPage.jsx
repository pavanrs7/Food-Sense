"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SignIn, SignUp, useClerk } from "@clerk/clerk-react";
import "./auth.css";

const AuthPage = () => {
  const [view, setView] = useState("welcome");
  const navigate = useNavigate();
  const location = useLocation();
  const { setActive } = useClerk();

  useEffect(() => {
    // Set view based on current path
    if (location.pathname.includes("/verify-email")) {
      setView("verify");
    } else if (location.pathname.includes("/login")) {
      setView("login");
    } else if (location.pathname.includes("/signup-receiver")) {
      setView("signupReceiver");
    } else if (location.pathname.includes("/signup")) {
      setView("signup");
    }
  }, [location.pathname]);

  // Handle successful sign-in
  const handleSignInComplete = async () => {
    await setActive({ session: window.Clerk.session.id });
    navigate("/dashboard");
  };

  // Handle successful sign-up
  const handleSignUpComplete = async (userData) => {
    try {
      // Set user metadata based on signup type
      await userData.update({
        publicMetadata: {
          role: view === "signupReceiver" ? "receiver" : "provider",
        },
      });
      // Force reload of user data so role is available immediately
      if (window.Clerk && window.Clerk.user) {
        await window.Clerk.user.reload();
      }
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  };

  const commonSignUpProps = {
    routing: "path",
    signInUrl: "/auth/login",
    afterSignUpUrl: "/dashboard",
    redirectUrl: "/dashboard",
    signInMode: "modal",
    afterSignUp: handleSignUpComplete,
    emailVerificationRequired: true,
    verifyEmailPath: "/auth/signup/verify-email-address",
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Food Sense</h1>
          <p>Reducing food waste, feeding communities</p>
        </div>

        {view === "welcome" && (
          <div className="auth-welcome">
            <h2>Welcome to Food Sense</h2>
            <p>Please sign in or create an account to continue</p>
            <div className="auth-buttons">
              <button
                className="auth-button primary"
                onClick={() => {
                  setView("login");
                  navigate("/auth/login");
                }}
              >
                Sign In
              </button>
              <button
                className="auth-button"
                onClick={() => {
                  setView("signup");
                  navigate("/auth/signup");
                }}
              >
                Sign Up
              </button>
              <button
                className="auth-button secondary"
                onClick={() => {
                  setView("signupReceiver");
                  navigate("/auth/signup-receiver");
                }}
              >
                Sign Up as Food Receiver
              </button>
            </div>
          </div>
        )}

        {view === "login" && (
          <div className="auth-form-container">
            <button className="back-button" onClick={() => setView("welcome")}>
              ← Back
            </button>
            <SignIn
              routing="path"
              path="/auth/login"
              signUpUrl="/auth/signup"
              afterSignInUrl="/dashboard"
              redirectUrl="/dashboard"
              signUpMode="modal"
              afterSignIn={handleSignInComplete}
            />
          </div>
        )}

        {(view === "signup" || view === "verify") && (
          <div className="auth-form-container">
            {view !== "verify" && (
              <button
                className="back-button"
                onClick={() => setView("welcome")}
              >
                ← Back
              </button>
            )}
            <div className="auth-role-indicator">
              <span className="role-badge provider">Food Provider</span>
            </div>
            <SignUp {...commonSignUpProps} path="/auth/signup" />
          </div>
        )}

        {view === "signupReceiver" && (
          <div className="auth-form-container">
            <button className="back-button" onClick={() => setView("welcome")}>
              ← Back
            </button>
            <div className="auth-role-indicator">
              <span className="role-badge receiver">Food Receiver</span>
            </div>
            <SignUp {...commonSignUpProps} path="/auth/signup-receiver" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
