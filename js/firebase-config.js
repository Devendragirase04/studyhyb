// firebase-config.js — Firebase setup for STUDYHUB
// INSTRUCTIONS: Replace the config below with YOUR Firebase project config
// Get it from: https://console.firebase.google.com → Your Project → Settings → General → Your apps

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ⚠️ REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDUtIfIvMxv1AgiiyNinw2vQxdCQyz3b_w",
  authDomain: "studyhub-app-7f99f.firebaseapp.com",
  projectId: "studyhub-app-7f99f",
  storageBucket: "studyhub-app-7f99f.firebasestorage.app",
  messagingSenderId: "622534039034",
  appId: "1:622534039034:web:b302c8e8eaa68015aa4043",
  measurementId: "G-JC9G1F1T03"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
