// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebaseConfig";

// Debug log to check configuration
console.log("Firebase config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? "PROVIDED" : "MISSING",
  appId: firebaseConfig.appId ? "PROVIDED" : "MISSING",
  storageBucket: firebaseConfig.storageBucket || "MISSING" // Specifically check storageBucket
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Storage with explicit bucket URL
let storage;
try {
  const storageBucket = firebaseConfig.storageBucket;
  if (!storageBucket) {
    console.error("Storage bucket is missing in configuration");
    storage = getStorage(app); // Try default anyway
  } else {
    const bucketUrl = `gs://${storageBucket}`;
    console.log("Initializing storage with bucket:", bucketUrl);
    storage = getStorage(app, bucketUrl);
  }
  console.log("Storage initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase storage:", error);
  throw error; // Rethrow to make the error visible
}

export { storage }; 