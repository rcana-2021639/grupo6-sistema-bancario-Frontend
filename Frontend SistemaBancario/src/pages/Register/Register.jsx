import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 25) {
      newErrors.name = 'El nombre no puede tener más de 25 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      newErrors.name = 'El nombre solo puede contener letras';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'El apellido es requerido';
    } else if (formData.surname.length > 25) {
      newErrors.surname = 'El apellido no puede tener más de 25 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.surname)) {
      newErrors.surname = 'El apellido solo puede contener letras';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length > 50) {
      newErrors.username = 'El nombre de usuario no puede tener más de 50 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no tiene un formato válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.phone) {
      newErrors.phone = 'El número de teléfono es requerido';
    } else if (!/^\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'El número de teléfono debe tener exactamente 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (error) {
      setServerError(error.message || 'Error al registrar la cuenta. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate para acceder al sistema bancario</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {serverError && (
            <div className="error-message">
              <span role="img" aria-label="error">⚠️</span>
              {serverError}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Juan"
                disabled={isLoading}
                aria-invalid={!!errors.name}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="surname">Apellido</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className={errors.surname ? 'error' : ''}
                placeholder="Pérez"
                disabled={isLoading}
                aria-invalid={!!errors.surname}
              />
              {errors.surname && <span className="error-text">{errors.surname}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="juanperez"
              disabled={isLoading}
              aria-invalid={!!errors.username}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="juan@ejemplo.com"
              disabled={isLoading}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="········"
              disabled={isLoading}
              aria-invalid={!!errors.password}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Número de Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="12345678"
              disabled={isLoading}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner" aria-hidden="true"></span>
            ) : null}
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;