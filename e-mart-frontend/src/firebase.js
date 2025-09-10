// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "my-first-firebase-3d484.firebaseapp.com",
  projectId: "my-first-firebase-3d484",
  storageBucket: "my-first-firebase-3d484.firebasestorage.app",
  messagingSenderId: "437314445575",
  appId: "1:437314445575:web:0312863a042e0333b2a5a2",
  measurementId: "G-TFW2GCBZD8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

let analytics;
const initializeAnalytics = async () => {
  if (await isSupported()) {
    analytics = getAnalytics(app);
  }
};

initializeAnalytics();

export { analytics };