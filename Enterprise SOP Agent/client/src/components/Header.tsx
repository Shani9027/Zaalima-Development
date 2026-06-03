import React from "react";
import "../styles/Header.css";

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🧠 OpsMind AI</h1>
          <p className="tagline">Enterprise Operations Intelligence</p>
        </div>
        <nav className="header-nav">
          <a href="#">Documentation</a>
          <a href="#">API</a>
          <a href="#">Settings</a>
        </nav>
      </div>
    </header>
  );
}
