import React, { useState } from "react";
import "./Navbar.css";
import { Link, NavLink } from "react-router-dom";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav>
      <Link to="/" className="title">
       FlightAnalysis 
      </Link>
      <div>
        <iframe style={{pointerEvents: "none"}} src="https://giphy.com/embed/BSx6mzbW1ew7K" width="80" height="50" frameBorder="0" class="giphy-embed"></iframe>
      </div>
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
        <li>
          <NavLink to="/page2">Summary</NavLink>
        </li>
        <li>
          <NavLink to="/">Map</NavLink>
        </li>

      </ul>
    </nav>
  );
};