import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    email_addr: '',
    password: '',
    confirmPassword: '',
    customer_nickname: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!formData.customer_nickname) validationErrors.customer_nickname = 'Pseudonim jest wymagany';
    if (!formData.email_addr || !/\S+@\S+\.\S+/.test(formData.email_addr)) validationErrors.email_addr = 'Podaj poprawny email';
    if (!formData.password) validationErrors.password = 'Hasło jest wymagane';
    if (formData.password !== formData.confirmPassword) validationErrors.confirmPassword = 'Hasła muszą być identyczne';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError(null);

    try {
      const response = await axios.post('http://localhost:5000/register', {
        email_addr: formData.email_addr,
        password: formData.password,
        customer_nickname: formData.customer_nickname,
      });

      console.log('Registration successful:', response.data);

      // Przekierowanie po rejestracji
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(error.response.data.message || 'Wystąpił błąd podczas rejestracji');
      } else {
        console.error('Error during registration:', error);
        setServerError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.');
      }
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="signup-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="customer_nickname">Pseudonim</label>
          <input
            type="text"
            id="customer_nickname"
            name="customer_nickname"
            value={formData.customer_nickname}
            onChange={handleChange}
            className="form-input"
          />
          {errors.customer_nickname && <span className="error">{errors.customer_nickname}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email_addr">Email</label>
          <input
            type="email"
            id="email_addr"
            name="email_addr"
            value={formData.email_addr}
            onChange={handleChange}
            className="form-input"
          />
          {errors.email_addr && <span className="error">{errors.email_addr}</span>}
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

        {serverError && <span className="server-error">{serverError}</span>}

        <button type="submit" className="submit-button">Zarejestruj się</button>
      </form>

      <p>
        Masz już konto? <span onClick={handleLoginRedirect} className="login-link">Zaloguj się</span>
      </p>
    </div>
  );
};

export default SignUp;
