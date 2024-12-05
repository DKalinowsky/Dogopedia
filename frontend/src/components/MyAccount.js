import React from "react";
import "./MyAccount.css";

const MyAccount = ({ isLoggedIn, favoriteBreeds }) => {
  return (
    <section className="dashboard">
      <div className="dashboard-container">
        {isLoggedIn ? (
          <>
            <h2>Welcome to Your Dashboard!</h2>
            <p>Here are your favorite dog breeds:</p>
            <ul className="favorites-list">
              {favoriteBreeds.length > 0 ? (
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
              You need to <a href="/login" className="login-link">log in</a> to access your your account.
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
