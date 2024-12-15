import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom"; // Import `Link` do przekierowania na stronę logowania
import axios from "axios"; // Import `axios`
import "./MyAccount.css";

const MyAccount = ({ favoriteBreeds }) => {
  const { user, logout } = useAuth(); // Pobranie funkcji `logout` z kontekstu AuthProvider
  const isLoggedIn = !!user;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("http://localhost:5000/user/info", {
            params: { user_id: user.user_id },
          });
          setUserData(response.data);
        } catch (error) {
          console.error("Unauthorized. Please log in again.");
        }
      };

      fetchUserData();
    }
  }, [isLoggedIn, user]);

  return (
    <section className="dashboard">
      <div className="dashboard-container">
        {isLoggedIn ? (
          <>
            <div className="header-actions">
              <h2>Welcome, {userData ? userData.customer_nickname : "Loading..."}!</h2>
              <button onClick={logout} className="navbar-button">
                Logout
              </button>
            </div>
            <p>Your role: {userData ? userData.role : "Loading..."}</p>
            <p>Your email address: {userData ? userData.email_addr : "Loading..."}</p>
            <p>Here are your favorite dog breeds:</p>
            <ul className="favorites-list">
              {favoriteBreeds && favoriteBreeds.length > 0 ? (
                favoriteBreeds.map((breed, index) => (
                  <li key={index} className="favorite-item">
                    <h3>{breed.name}</h3>
                    <img
                      src={breed.imageUrl}
                      alt={breed.name}
                      className="favorite-image"
                    />
                  </li>
                ))
              ) : (
                <p>You don't have any favorite breeds yet. Start exploring!</p>
              )}
            </ul>
          </>
        ) : (
          <>
            <h2>Access Restricted</h2>
            <p>
              You need to{" "}
              <Link to="/login" className="navbar-link">
                log in
              </Link>{" "}
              to access your account.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
