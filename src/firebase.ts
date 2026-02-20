// src/firebase.ts
// ──────────────────────────────────────────────────────────
// 🔥  Paste your Firebase config here.
//
// 1. Go to the Firebase Console → your project → Project Settings → General.
// 2. Under "Your apps", click the Web (</>) icon to register a web app
//    (or select an existing one).
// 3. Copy the `firebaseConfig` object and replace the placeholder below.
// ──────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // ⬇️  REPLACE these values with your own Firebase project config
  apiKey: "AIzaSyBJcV_-MxjfapDoS8RXXZICa99sjk3sWh4",
  authDomain: "songrequest-48781.firebaseapp.com",
  projectId: "songrequest-48781",
  storageBucket: "songrequest-48781.firebasestorage.app",
  messagingSenderId: "316417585169",
  appId: "1:316417585169:web:fe09d058ebb3896b7681b0",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
