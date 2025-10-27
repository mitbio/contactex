// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
//
//  THIS IS THE MISSING IMPORT THAT CAUSED YOUR ERROR
//
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; 

// Your Firebase config (this is correct)
const firebaseConfig = {
  apiKey: "AIzaSyDmbLZknKwhTBNtWQpwhXzUTc-AdZ6KjmM",
  authDomain: "contactxextension.firebaseapp.com",
  projectId: "contactxextension",
  storageBucket: "contactxextension.appspot.com",
  messagingSenderId: "797855742573",
  appId: "1:797855742573:web:683f44d3c339597ab15d64",
  measurementId: "G-FKK8GGSGWY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//
//  THIS IS THE ONLY PLACE WE CALL THESE FUNCTIONS
//
export const db = getFirestore(app);
export const auth = getAuth(app); // This line will now work
