import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./SignUp.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
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

    if (!formData.firstName) validationErrors.firstName = 'Imię jest wymagane';
    if (!formData.lastName) validationErrors.lastName = 'Nazwisko jest wymagane';
    if (!formData.nickname) validationErrors.nickname = 'Pseudonim jest wymagany';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = 'Podaj poprawny email';
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
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
          <label htmlFor="nickname">Pseudonim</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="form-input"
          />
          {errors.nickname && <span className="error">{errors.nickname}</span>}
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
