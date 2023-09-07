// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgxXwv-o38c_SKv_P2s3qSqEROXKMceK4",
  authDomain: "cs12-summative.firebaseapp.com",
  projectId: "cs12-summative",
  storageBucket: "cs12-summative.appspot.com",
  messagingSenderId: "283532596293",
  appId: "1:283532596293:web:dc8b521236a345f15e7f2c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const firestore = getFirestore();

export { auth, firestore}