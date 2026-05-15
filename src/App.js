// App.js is the brain of your entire application 
//Its one and only job is to decide what to show the user:
// if they are logged in it shows the Dashboard, if they are not logged in it shows the
// Login screen. It does this by listening to Firebase Authentication in real time and
// reacting instantly whenever the login state changes. 
//  App is always the starting point.

// React is imported because this file uses JSX 
// useState is a React hook that lets us store and update values inside a component 
// when a variable changes, it automatically causes the screen to redraw.
// useEffect is a React hook that lets us run a piece of code at a specific moment 

import React, { useState, useEffect } from "react";

import { auth } from "./firebase"; // auth is your Firebase Authentication connection imported from firebase.js.

import { onAuthStateChanged } from "firebase/auth";
// onAuthStateChanged is a Firebase function that acts as a  listener .
// it watches the Firebase Auth connection and fires a callback function automatically
// every single time the login state changes, whether someone logs in or logs out.
// This means on the  app never has to manually check if someone is logged in —
// Firebase just tells it instantly whenever the situation changes.

import Login from "./components/Login";   // Login is the component that renders your login screen — the form with email
// and password fields. It is shown when no user is logged in.

import Dashboard from "./components/Dashboard";
// It is shown when a user is successfully logged in.

import "./App.css";
// App.css contains styles that apply specifically to the App component —

// App is a function component
// in React, a JavaScript function
// that returns JSX  describing what should appear on screen.
// Every component in in the  project follows this same pattern
//  a function that returns UI.

function App() {
  const [user, setUser] = useState(null);

  // user is a state variable that stores the currently logged in Firebase user object.
  // When someone is logged in, user contains their details (email, uid etc).
  // When nobody is logged in, user is null.

  // setUser is the function you call to update the user value
  //  you never change user directly, you always go through setUser, and React then redraws the screen.

  // useState(null) means the starting value of user is null — nobody logged in yet.
  const [loading, setLoading] = useState(true);

  // loading is a state variable that tracks whether the app is still waiting to hear
  // back from Firebase about the current login state. 
  
  // useState(true) means loading starts as true — we assume we are loading until Firebase responds.
 
  // useEffect runs the code inside it after the component first appears on screen.
  
  useEffect(() => {

    // onAuthStateChanged sets up a permanent real-time listener on your Firebase auth connection.
    // Whenever the login state changes 
    const unsub = onAuthStateChanged(auth, (u) => {


      setUser(u);// setUser updates the user state variable with whatever Firebase just reported.
      // If u is a user object the app will show Dashboard. If u is null it shows Login.
      
      setLoading(false);  // setLoading(false) tells the app that Firebase has responded and we now know the login state 
    });
    return () => unsub();  // This return is a cleanup function — React calls it automatically when the App
    // component is removed from the screen. unsub() unsubscribes from the Firebase
    // turning off the listener when it is no longer needed.
  }, []);

  // The empty array [] here is the dependency array — it tells useEffect when to re-run.
  // An empty array means it only runs once when the component first loads, never again after.
  

  // While loading is still true — meaning Firebase hasnt responded yet 
  // the app returns this loading screen instead of the real content. This prevents a jarring flash where
  // the Login screen briefly appears before Firebase confirms someone is already logged in.
 
  if (loading) {
    return (
      <div className="app-loading">   /*  Puzzle Project logo is displayed in the centre of the loading screen *
        <img src="/logo.png" alt="The Puzzle Project" className="loading-logo" />  /* An empty div that is animated in CSS to spin and act as a loading spinner */
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
 
  
  // A ternary is a shorthand if/else 
  //  if user exists show Dashboard and pass the user object into it,
  // otherwise show Login.
  // This single line is what makes the app a protected system as nobody sees the Dashboard
  // without Firebase confirming they are a logged in user first.
  return user ? <Dashboard user={user} /> : <Login />;
}
 
// export default App makes this component available to be imported by other files.

export default App;
