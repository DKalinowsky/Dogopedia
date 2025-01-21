import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";
import axios from '../components/axiosConfig';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyAccount.css";

const MyAccount = ({ favoriteBreeds }) => {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    customer_nickname: "",
    email_addr: "",
    current_password: "",
    new_password: "",
    confirm_new_password: "", // Dodano pole do potwierdzenia nowego hasła
  });

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get("/user/info", {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdateUser = async () => {
    try {
      const response = await axios.put("/user", {
        customer_nickname: formData.customer_nickname,
        email_addr: formData.email_addr,
      });
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || "Error updating user data.");
    }
  };

  const handleUpdatePassword = async () => {
    // Walidacja nowego hasła i potwierdzenia
    if (formData.new_password !== formData.confirm_new_password) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await axios.put("/user/update-password", {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });
      toast.success(response.data.message);
      // Wyczyść pola hasła po udanej zmianie
      setFormData((prevState) => ({
        ...prevState,
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Error updating password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      try {
        const response = await axios.delete("/user");
        toast.success(response.data.message);
        logout();
      } catch (err) {
        toast.error(err.response?.data?.error || "Error deleting account.");
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
            <div className="form-group">
              <label htmlFor="confirm_new_password">Confirm New Password:</label>
              <input
                type="password"
                id="confirm_new_password"
                name="confirm_new_password"
                value={formData.confirm_new_password}
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
      <ToastContainer />
    </section>
  );
};

export default MyAccount;
