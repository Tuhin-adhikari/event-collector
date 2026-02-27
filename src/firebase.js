// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCJTdftJ31tm9rUtx3tZTKU1MSHKov0g5g",
    authDomain: "event-collector-64179.firebaseapp.com",
    projectId: "event-collector-64179",
    storageBucket: "event-collector-64179.firebasestorage.app",
    messagingSenderId: "817316893395",
    appId: "1:817316893395:web:c784468f26b7758516fa26",
    measurementId: "G-WDC8XY3LSV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);