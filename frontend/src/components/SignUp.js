// src/components/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    // Walidacja formularza
    const validationErrors = {};

    if (!formData.firstName) validationErrors.firstName = 'Imię jest wymagane';
    if (!formData.lastName) validationErrors.lastName = 'Nazwisko jest wymagane';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = 'Podaj poprawny email';
    if (!formData.password) validationErrors.password = 'Hasło jest wymagane';
    if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'Hasła muszą być identyczne';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Można wysłać dane do backendu tutaj
      alert('Formularz wysłany!');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login'); // Zmiana na navigate
  };

  return (
    <div className="signup-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="firstName">Imię</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="form-input"
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Nazwisko</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="form-input"
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>

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

        <div className="form-group">
          <label htmlFor="confirmPassword">Powtórz hasło</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="submit-button">Zarejestruj się</button>
      </form>

      <p>
        Masz już konto? <span onClick={handleLoginRedirect} className="login-link">Zaloguj się</span>
      </p>
    </div>
  );
};

export default SignUp;
