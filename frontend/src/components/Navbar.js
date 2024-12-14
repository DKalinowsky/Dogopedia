import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

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
          <li>
            {isLoggedIn ? (
              <button onClick={logout} className="navbar-button">
                Logout
              </button>
            ) : (
              <Link to="/login" className="navbar-link">
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
