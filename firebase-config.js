// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtnYUjGEG6NV5UDkn37vGVNBQjMbaDncI",
  authDomain: "cybersecurity-awareness-58885.firebaseapp.com",
  projectId: "cybersecurity-awareness-58885",
  storageBucket: "cybersecurity-awareness-58885.firebasestorage.app",
  messagingSenderId: "15905358236",
  appId: "1:15905358236:web:48c58e9b488e125e25c859",
  measurementId: "G-S23T91JML3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);





