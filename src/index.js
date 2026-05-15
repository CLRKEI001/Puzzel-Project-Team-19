import React from 'react';
import ReactDOM from 'react-dom/client';  // ReactDOM is a companion library that acts as the bridge between React and the actual browser.
// React builds everything in memory first, then ReactDOM takes that result and physically
// stamps it onto the webpage so the user can see it.
import './index.css';  // This loads your global CSS file. Any styles written in index.css apply across
import App from './App';   // This imports your main App component from App.js.
// index.js only needs to know about App, and App handles everything else.
import reportWebVitals from './reportWebVitals';  // This is a built-in performance measurement tool that came with create-react-app.
// It can track things like how fast your page loads. 

// index.js is the very first file that runs when someone opens your website.
// Its only job is to boot up the entire React app.

// React is the core library that makes it possible to write HTML-looking tags inside JavaScript

const root = ReactDOM.createRoot(document.getElementById('root'));

// document.getElementById('root') goes into your public/index.html file and finds
// the one empty <div id="root"></div> sitting there. That div is intentionally empty —
// it is just a blank placeholder. 
// ReactDOM.createRoot() grabs that div and tells React:
// "you own this space, render everything inside here."

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// root.render() is the command that draws the app onto the screen.
// It takes thw <App /> component and paints it into that empty root div.
// <React.StrictMode> is an invisible wrapper that runs extra background checks
// during development and prints warnings to the browser console if you write
// risky or outdated code. It has zero effect on what the user sees and is
// automatically disabled when the app goes live.





// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// reportWebVitals() activates the performance tracking tool imported above.
