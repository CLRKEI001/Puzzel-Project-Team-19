import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// NOTE: getFirestore / db has been removed from this file. The database
// has moved to Supabase — see src/supabaseClient.js. Firebase is now used
// ONLY for Authentication (Login.js, Sidebar.js, App.js).

const firebaseConfig = {
  apiKey: "AIzaSyCXC57VPWS0IokhkJax56PuLNXfQVWvW8Y",
  authDomain: "puzzle-project-3b369.firebaseapp.com",
  projectId: "puzzle-project-3b369",
  storageBucket: "puzzle-project-3b369.firebasestorage.app",
  messagingSenderId: "216159714579",
  appId: "1:216159714579:web:fbce493e2e1c2c1960eee6",
  measurementId: "G-6FG7GS9WYS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
