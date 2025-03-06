import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDhlT_gH5rVqn6WOUh0H82U4RkVl_Pa4Os",
  authDomain: "showroom-car-vip.firebaseapp.com",
  projectId: "showroom-car-vip",
  storageBucket: "showroom-car-vip.firebasestorage.app",
  messagingSenderId: "834160230491",
  appId: "1:834160230491:web:f0ffff840c66843253bf7e",
  measurementId: "G-K7E0T1SHEW"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
const auth = getAuth(app);

// Analytics được khởi tạo riêng ở client components khi cần thiết
// Do Next.js có SSR nên tránh import getAnalytics ở module level

export { app, storage, auth }; 