import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDscYUonnvEW7fsST60Cjw7gG5Rdu07S3o",
  authDomain: "calorietracking-d41e8.firebaseapp.com",
  projectId: "calorietracking-d41e8",
  storageBucket: "calorietracking-d41e8.firebasestorage.app",
  messagingSenderId: "190065413740",
  appId: "1:190065413740:web:50ec4f564732d034755249",
  measurementId: "G-T96KKESFBM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
