// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = 'Podaj poprawny email';
    if (!formData.password) validationErrors.password = 'Hasło jest wymagane';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Można wysłać dane do backendu tutaj
      alert('Zalogowano!');
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/sign-up'); // Zmiana na navigate
  };

  return (
    <div className="login-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Hasło</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <button type="submit" className="submit-button">Zaloguj się</button>
      </form>

      <p>
        Nie masz konta? <span onClick={handleSignUpRedirect} className="signup-link">Zarejestruj się</span>
      </p>
    </div>
  );
};

export default Login;
