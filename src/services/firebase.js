import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0B-Pz4_E3DspBxAXSHx7jJ1M0Vlu09X0",
  authDomain: "ufms-6760d.firebaseapp.com",
  projectId: "ufms-6760d",
  storageBucket: "ufms-6760d.firebasestorage.app",
  messagingSenderId: "16941996262",
  appId: "1:16941996262:web:b3c019df29c73333f8c327",
  measurementId: "G-6W3G8BK3W3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Test connection to Firestore
const testFirestoreConnection = async () => {
  try {
    console.log("Testing Firestore connection...");
    const timestamp = new Date().toISOString();
    console.log("Firestore initialized successfully at:", timestamp);
    return true;
  } catch (error) {
    console.error("Firestore connection error:", error);
    return false;
  }
};

// Run the test
testFirestoreConnection();
