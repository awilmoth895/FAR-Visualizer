
import React from "react";
import "./header.css";

export default function Header() {
  return (
    <div id="header-container">
        <div id="header-title-container">
            <div id="header-icon">
                <img src="../assets/city.svg" alt="" />
            </div>
            <h1 id="header-title">Zoning Visualizer</h1>
        </div>
        <div id="header-links">
            <a id="github-link" href="https://github.com/awilmoth895/FAR-Visualizer/tree/master" target="_blank" rel="noopener noreferrer">
              <img id="github-icon" src="../assets/github-mark-white.svg" alt="" />
              Source Code
            </a>
        </div>
    </div>
  );
}
