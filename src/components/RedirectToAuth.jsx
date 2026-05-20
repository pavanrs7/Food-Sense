"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectToAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="redirect-container">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Redirecting...</span>
      </div>
      <p>Redirecting to login...</p>
    </div>
  );
};

export default RedirectToAuth;
