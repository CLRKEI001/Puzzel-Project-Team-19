import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
 
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
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;