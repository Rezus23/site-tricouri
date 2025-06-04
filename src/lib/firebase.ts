import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ⚠️ NU mai importa getAnalytics aici pentru că dă eroare pe server

const firebaseConfig = {
  apiKey: "AIzaSyBZxoBZ3D9ynA5AWk-C8qetXYMOAWLqnhE",
  authDomain: "passion4jerseys.firebaseapp.com",
  projectId: "passion4jerseys",
  storageBucket: "passion4jerseys.firebasestorage.app",
  messagingSenderId: "841015992355",
  appId: "1:841015992355:web:d3fd1848a38e25b7161196",
  measurementId: "G-6M9JZ2YSVH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // folosești doar Firestore aici

// Dacă vei avea nevoie de Analytics pe client:
// export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
