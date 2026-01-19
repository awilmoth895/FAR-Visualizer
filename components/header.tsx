
import { useState, useEffect } from 'react';
import "./header.css";
import { useConfigContext } from '~/context/ConfigContext';

export default function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
 
  const { menuOpen, setMenuOpen } = useConfigContext();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  function hamburgerMenu() {

    if (!isMobile) {
      return null;
    }
    
    return (
      <div className="hamburger-menu">
        <a className="hamburger-icon" onClick={() => setMenuOpen(!menuOpen)}>&#9776;</a>
      </div>
    );
  }


  return (
    <div id="header-container">
        <div id="header-title-container">
          {hamburgerMenu()}
          <div id="header-icon">
              <img src="../assets/city.svg" alt="" />
          </div>
          <h1 id="header-title">Zoning Visualizer</h1>
        </div>
        <div id="header-links">
            <a id="github-link" href="https://github.com/awilmoth895/FAR-Visualizer/" target="_blank" rel="noopener noreferrer">
              <img id="github-icon" src="../assets/github-mark-white.svg" alt="" />
              Source Code
            </a>
        </div>
    </div>
  );
}
