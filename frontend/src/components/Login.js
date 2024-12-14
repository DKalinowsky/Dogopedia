import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";
import { useAuth } from './AuthProvider';

const Login = () => {
  const [formData, setFormData] = useState({
    email_addr: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

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

    if (!formData.email_addr || !/\S+@\S+\.\S+/.test(formData.email_addr)) {
      validationErrors.email_addr = 'Podaj poprawny email';
    }
    if (!formData.password) {
      validationErrors.password = 'Hasło jest wymagane';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError(null);

    try {
      const response = await axios.post('http://localhost:5000/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login successful:', response.data);

      const { token } = response.data;
      login(token);

      // Przekierowanie po zalogowaniu
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(error.response.data.message || 'Nieprawidłowe dane logowania');
      } else {
        console.error('Error during login:', error);
        setServerError('Wystąpił błąd podczas logowania. Spróbuj ponownie później.');
      }
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/sign-up');
  };

  return (
    <div className="login-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit} className="login-form">
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

        {serverError && <span className="server-error">{serverError}</span>}

        <button type="submit" className="submit-button">Zaloguj się</button>
      </form>

      <p>
        Nie masz konta? <span onClick={handleSignUpRedirect} className="signup-link">Zarejestruj się</span>
      </p>
    </div>
  );
};

export default Login;
