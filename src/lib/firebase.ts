// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "invoiceflow-vaftb",
  "appId": "1:156035686916:web:655f2c07893affc3f60b51",
  "storageBucket": "invoiceflow-vaftb.firebasestorage.app",
  "apiKey": "AIzaSyD1BFH3I2eknCmE26iqzBIC2K-__6U94Fo",
  "authDomain": "invoiceflow-vaftb.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "156035686916"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
