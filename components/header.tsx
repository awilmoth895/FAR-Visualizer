
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
    </div>
  );
}
