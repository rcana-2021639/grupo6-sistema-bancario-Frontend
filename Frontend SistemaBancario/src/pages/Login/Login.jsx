import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'El email o nombre de usuario es requerido';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrUsername) && emailOrUsername.trim().length < 3) {
        newErrors.emailOrUsername = 'Por favor ingresa un email válido o nombre de usuario';
      }
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(emailOrUsername.trim(), password);
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.message || 'Credenciales incorrectas. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta bancaria</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {serverError && (
            <div className="error-message">
              <span role="img" aria-label="error">⚠️</span>
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="emailOrUsername">Email o Nombre de Usuario</label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className={errors.emailOrUsername ? 'error' : ''}
              placeholder="ej. usuario@ejemplo.com"
              disabled={isLoading}
              aria-invalid={!!errors.emailOrUsername}
              aria-describedby={
                errors.emailOrUsername ? 'emailOrUsername-error' : undefined
              }
            />
            {errors.emailOrUsername && (
              <span id="emailOrUsername-error" className="error-text">
                {errors.emailOrUsername}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'error' : ''}
              placeholder="········"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
            />
            {errors.password && (
              <span id="password-error" className="error-text">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner" aria-hidden="true"></span>
            ) : null}
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="link">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;