import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom"; // Import `Link`
import axios from "axios"; // Import `axios`
import "./MyAccount.css";

const MyAccount = ({ favoriteBreeds }) => {
  const { user, logout } = useAuth(); // Pobranie funkcji `logout` z kontekstu AuthProvider
  const isLoggedIn = !!user;
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    customer_nickname: "",
    email_addr: "",
    current_password: "",
    new_password: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("http://localhost:5000/user/info", {
            params: { user_id: user.user_id },
          });
          setUserData(response.data);
          setFormData((prevState) => ({
            ...prevState,
            customer_nickname: response.data.customer_nickname,
            email_addr: response.data.email_addr,
          }));
        } catch (error) {
          console.error("Unauthorized. Please log in again.");
        }
      };

      fetchUserData();
    }
  }, [isLoggedIn, user]);

  // Funkcja do obsługi zmiany wartości pól formularza
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Funkcja do edycji danych użytkownika
  const handleUpdateUser = async () => {
    try {
      const response = await axios.put("http://localhost:5000/user", {
        customer_nickname: formData.customer_nickname,
        email_addr: formData.email_addr,
      });
      setSuccessMessage(response.data.message);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error updating user data.");
      setSuccessMessage(null);
    }
  };

  // Funkcja do zmiany hasła
  const handleUpdatePassword = async () => {
    try {
      const response = await axios.put("http://localhost:5000/user/update-password", {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      setSuccessMessage(response.data.message);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error updating password.");
      setSuccessMessage(null);
    }
  };

  // Funkcja do usuwania konta
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      try {
        const response = await axios.delete("http://localhost:5000/user");
        alert(response.data.message);
        logout(); // Wyloguj użytkownika po usunięciu konta
      } catch (err) {
        setErrorMessage(err.response?.data?.error || "Error deleting account.");
      }
    }
  };

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
            <h3>Your role: {userData ? userData.role : "Loading..."}</h3>

            <h3>Update Your Information</h3>
            <div className="form-group">
              <label htmlFor="customer_nickname">Nickname:</label>
              <input
                type="text"
                id="customer_nickname"
                name="customer_nickname"
                value={formData.customer_nickname}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email_addr">Email:</label>
              <input
                type="email"
                id="email_addr"
                name="email_addr"
                value={formData.email_addr}
                onChange={handleChange}
              />
            </div>
            <button onClick={handleUpdateUser} className="update-button">
              Update Info
            </button>

            <h3>Change Your Password</h3>
            <div className="form-group">
              <label htmlFor="current_password">Current Password:</label>
              <input
                type="password"
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new_password">New Password:</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
              />
            </div>
            <button onClick={handleUpdatePassword} className="update-button">
              Update Password
            </button>

            <h3>Delete Your Account</h3>
            <button onClick={handleDeleteAccount} className="delete-button">
              Delete Account
            </button>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
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
