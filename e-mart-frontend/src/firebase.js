// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyD0MGrc3NQYP_fN6_JOjYPDEwNjNITFtJo',
  authDomain: 'customcomparts.firebaseapp.com',
  projectId: 'customcomparts',
  storageBucket: 'customcomparts.firebasestorage.app',
  messagingSenderId: '554360922730',
  appId: '1:554360922730:web:3f26c92375e9050f0ce013',
  measurementId: 'G-DWMVBSQS2J',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
