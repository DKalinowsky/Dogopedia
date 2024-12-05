import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Dogopedia
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/about-us" className="navbar-link">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/myaccount" className="navbar-link">
              My Account
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
