import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:
  authDomain:
  projectId: 
  storageBucket: 
  messagingSenderId: 
  appId: 
  measurementId: 
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
