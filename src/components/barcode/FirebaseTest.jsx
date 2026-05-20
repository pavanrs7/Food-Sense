"use client";

import { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const FirebaseTest = () => {
  const [status, setStatus] = useState("Checking Firebase connection...");
  const [collections, setCollections] = useState([]);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const checkFirebase = async () => {
      try {
        // Try to get documents from a test collection
        await getDocs(collection(db, "test_connection"));
        setStatus("Firebase connected successfully");
      } catch (err) {
        setStatus(`Firebase connection error: ${err.message}`);
        console.error("Firebase connection error:", err);
      }
    };

    checkFirebase();
  }, []);

  const testAddDocument = async () => {
    try {
      setTestResult("Adding test document...");
      const docRef = await addDoc(collection(db, "test_collection"), {
        message: "Test document",
        timestamp: serverTimestamp(),
      });
      setTestResult(`Document added successfully with ID: ${docRef.id}`);

      // Refresh collections list
      listCollections();
    } catch (err) {
      setTestResult(`Error adding document: ${err.message}`);
      console.error("Error adding document:", err);
    }
  };

  const listCollections = async () => {
    try {
      // This is a workaround since Firestore doesn't directly support listing collections
      // We'll check a few known collections
      const knownCollections = [
        "test_collection",
        "productScans",
        "providers",
        "test_scans",
      ];
      const existingCollections = [];

      for (const collName of knownCollections) {
        try {
          const snapshot = await getDocs(collection(db, collName));
          if (!snapshot.empty) {
            existingCollections.push({
              name: collName,
              documentCount: snapshot.size,
            });
          }
        } catch (err) {
          console.log(`Collection ${collName} not found or error:`, err);
        }
      }

      setCollections(existingCollections);
    } catch (err) {
      console.error("Error listing collections:", err);
    }
  };

  useEffect(() => {
    // List collections on component mount
    listCollections();
  }, []);

  return (
    <div className="firebase-test p-4 bg-light rounded mb-4">
      <h3>Firebase Connection Test</h3>
      <div
        className={`alert ${
          status.includes("error") ? "alert-danger" : "alert-success"
        }`}
      >
        {status}
      </div>

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={testAddDocument}>
          Add Test Document
        </button>
        <button className="btn btn-secondary" onClick={listCollections}>
          Refresh Collections
        </button>
      </div>

      {testResult && (
        <div
          className={`alert ${
            testResult.includes("Error") ? "alert-danger" : "alert-info"
          }`}
        >
          {testResult}
        </div>
      )}

      <div className="mt-3">
        <h4>Available Collections</h4>
        {collections.length === 0 ? (
          <p>No collections found</p>
        ) : (
          <ul className="list-group">
            {collections.map((coll, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {coll.name}
                <span className="badge bg-primary rounded-pill">
                  {coll.documentCount} documents
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 small text-muted">
        <p>
          <strong>Note:</strong> If you're seeing connection errors, please
          check your Firebase configuration in
          <code>firebase/config.js</code>. Make sure your project ID, API key,
          and other settings are correct.
        </p>
      </div>
    </div>
  );
};

export default FirebaseTest;
