import { initializeApp } from "firebase/app";   // initializeApp is the core Firebase function that starts up your Firebase connection.
import { getFirestore } from "firebase/firestore";  // getFirestore gives you access to Firestore — this is the database

// It is a NoSQL cloud database, meaning data is stored in collections and documents
// rather than tables and rows like a traditional database.

import { getAuth } from "firebase/auth";
// getAuth gives you access to Firebase Authentication — this is the system that handles
// login and logout. It tracks which user is currently signed in and protects the app
// so strangers cant just open the dashboard without credentials.

// firebase.js is the file that connects the React app to the Firebase project in the cloud.
//  this file establishes that connection once, and then every other file in the app can import and use it.



// firebaseConfig is the apps unique identity card — these keys tell Firebase exactly
// which project in the cloud to connect to. 
// apiKey — a public identifier used to make API calls to Firebase 
// authDomain — the web address Firebase uses to handle login popups and redirects
// projectId — the unique name of the Firebase project
// storageBucket — the address of your Firebase Storage 
// messagingSenderId — an ID used to add push notifications to the app
// appId — the unique ID of this specific web app within your Firebase project
// measurementId — links to Google Analytics so Firebase can track usage statistics

const firebaseConfig = {
  apiKey: "AIzaSyCXC57VPWS0IokhkJax56PuLNXfQVWvW8Y",
  authDomain: "puzzle-project-3b369.firebaseapp.com",
  projectId: "puzzle-project-3b369",
  storageBucket: "puzzle-project-3b369.firebasestorage.app",
  messagingSenderId: "216159714579",
  appId: "1:216159714579:web:fbce493e2e1c2c1960eee6",
  measurementId: "G-6FG7GS9WYS"
};
 

// initializeApp takes your config object above and establishes the live connection
// to the Firebase project in the cloud. It returns a Firebase app instance which
// is needed to set up Firestore and Auth below. This line only runs once when the
// app first loads, and Firebase manages the connection from there automatically.

const app = initializeApp(firebaseConfig);

// getFirestore(app) creates the database connection using the Firebase app above.
// The export keyword means any other file in the project can import db and use it
// to read and write data. For example,  db is your gateway to all data.
export const db = getFirestore(app);

// getAuth(app) creates the authentication connection using the same Firebase app.
// auth is what lets you check who is logged in, log someone in, or log them out.


export const auth = getAuth(app);

// export default app makes the raw Firebase app instance available to other files too,

export default app;