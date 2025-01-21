import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../components/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SignUp.css';

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

  // Funkcja do walidacji silnych haseł
  const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return strongPasswordRegex.test(password);
  };

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

    if (!formData.nickname) validationErrors.nickname = 'Pseudonim jest wymagany';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) validationErrors.email = 'Podaj poprawny email';

    // Sprawdzanie silnego hasła
    if (!formData.password) {
      validationErrors.password = 'Hasło jest wymagane';
    } else if (!isStrongPassword(formData.password)) {
      validationErrors.password =
        'Hasło musi mieć co najmniej 12 znaków, w tym dużą literę, małą literę, cyfrę i znak specjalny.';
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Hasła muszą być identyczne';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError(null);

    try {
      const response = await axios.post('/register', {
        customer_nickname: formData.nickname,
        email_addr: formData.email,
        password: formData.password,
      });

      console.log('Registration successful:', response.data);

      // Powiadomienie o sukcesie rejestracji
      toast.success('Rejestracja zakończona sukcesem! Zaloguj się teraz.');

      // Przekierowanie po rejestracji
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data) {
        setServerError(error.response.data.error || 'Wystąpił błąd podczas rejestracji');
        toast.error(error.response.data.error || 'Wystąpił błąd podczas rejestracji');
      } else {
        console.error('Error during registration:', error);
        setServerError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.');
        toast.error('Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.');
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

      <ToastContainer />
    </div>
  );
};

export default SignUp;
