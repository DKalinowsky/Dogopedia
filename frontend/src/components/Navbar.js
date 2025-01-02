import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  // Sprawdzamy rolę użytkownika
  const userRole = user?.role; // Zakładam, że rola jest przechowywana w user.role

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
          {/* Warunkowe renderowanie opcji 'Manage users' dla admina */}
          {userRole === "admin" && (
            <li>
              <Link to="/manage-users" className="navbar-link">
                Manage Users
              </Link>
            </li>
          )}
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
