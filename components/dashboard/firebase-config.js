// firebase-config.js

// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//
// --------------------------------------------------------------------
// !! PASTE YOUR firebaseConfig OBJECT FROM THE FIREBASE CONSOLE HERE !!
// --------------------------------------------------------------------
//
const firebaseConfig = {
  apiKey: "AIzaSyDmbLZknKwhTBNtWQpwhXzUTc-AdZ6KjmM",
  authDomain: "contactxextension.firebaseapp.com",
  projectId: "contactxextension",
  storageBucket: "contactxextension.firebasestorage.app",
  messagingSenderId: "797855742573",
  appId: "1:797855742573:web:683f44d3c339597ab15d64",
  measurementId: "G-FKK8GGSGWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firestore database instance
// We will import 'db' in our other files
export const db = getFirestore(app);
