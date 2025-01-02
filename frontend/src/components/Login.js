import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Import `toast` i `ToastContainer`
import 'react-toastify/dist/ReactToastify.css'; // Import CSS dla `react-toastify`
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

      // Powiadomienie o sukcesie logowania
      toast.success('Zalogowano pomyślnie!');

      // Przekierowanie po zalogowaniu
      navigate('/');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          // Obsługa zbanowanego użytkownika
          toast.error("Twoje konto zostało zbanowane!", {
            position: "top-center",
            autoClose: false, // Toast pozostaje na ekranie
            style: {
              fontSize: "1.5rem",
              textAlign: "center",
              color: "#fff",
              background: "#d9534f",
            },
          });
        } else if (error.response.status === 401) {
          // Błędny email lub hasło
          setServerError("Nieprawidłowy email lub hasło.");
          toast.error("Nieprawidłowy email lub hasło.");
        } else {
          // Inny błąd
          setServerError(error.response.data.error || "Wystąpił błąd serwera.");
          toast.error(error.response.data.error || "Wystąpił błąd serwera.");
        }
      } else {
        console.error('Error during login:', error);
        setServerError("Wystąpił błąd podczas logowania. Spróbuj ponownie później.");
        toast.error("Wystąpił błąd podczas logowania. Spróbuj ponownie później.");
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

      {/* Dodanie ToastContainer w komponencie */}
      <ToastContainer />
    </div>
  );
};

export default Login;
