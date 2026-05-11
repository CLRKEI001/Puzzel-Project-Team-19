import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";
 
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);
 
  if (loading) {
    return (
      <div className="app-loading">
        <img src="/logo.png" alt="The Puzzle Project" className="loading-logo" />
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
 
  return user ? <Dashboard user={user} /> : <Login />;
}
 
export default App;
