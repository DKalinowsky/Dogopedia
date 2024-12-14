import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import axios from "axios"; // Import `axios`
import "./MyAccount.css";

const MyAccount = ({ favoriteBreeds }) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("http://localhost:5000/user", {
            params: { user_id: user.user_id },
          });
          setUserData(response.data);
        } catch (error) {
          // Removed unused error state
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
            <h2>Welcome, {userData ? userData.customer_nickname : "Loading..."}!</h2>
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
            <p>You need to <a href="/login" className="login-link">log in</a> to access your account.</p>
          </>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
