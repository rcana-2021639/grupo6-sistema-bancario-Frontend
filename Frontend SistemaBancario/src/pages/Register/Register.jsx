import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

export function Register() {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.name || !formData.surname || !formData.username || !formData.email || !formData.password || !formData.phone) {
      setLocalError('Por favor complete todos los campos requeridos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar teléfono (8 dígitos)
    if (!/^\d{8}$/.test(formData.phone)) {
      setLocalError('El teléfono debe tener exactamente 8 dígitos');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      console.log('Datos de registro:', registerData);
      await register(registerData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error en registro:', err.response?.data);
      setLocalError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-background">
          <div className="bg-gradient bg-gradient-1"></div>
          <div className="bg-gradient bg-gradient-2"></div>
        </div>
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>¡Registro exitoso!</h2>
          <p>Tu cuenta ha sido creada. Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.</p>
          <p className="redirect-message">Serás redirigido al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-background">
        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>
        <div className="bg-gradient bg-gradient-3"></div>
      </div>

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="logo">
              <div className="logo-icon">K</div>
              <span className="logo-text">Kinal Bank</span>
            </div>
            <h1>Crea tu cuenta</h1>
            <p>Completa el formulario para abrir tu cuenta bancaria digital</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {(localError || error) && (
              <div className="alert alert-error">
                {localError || error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onInput={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="surname">Apellido</label>
                <input
                  type="text"
                  id="surname"
                  name="surname"
                  placeholder="Tu apellido"
                  value={formData.surname}
                  onInput={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Tu nombre de usuario"
                value={formData.username}
                onInput={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="tu@email.com"
                value={formData.email}
                onInput={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="8 dígitos (ej: 55551234)"
                value={formData.phone}
                onInput={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onInput={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onInput={handleChange}
                disabled={loading}
              />
            </div>

            <div className="terms">
              <label>
                <input type="checkbox" required />
                <span>
                  Acepto los{' '}
                  <a href="/terms" target="_blank">Términos y Condiciones</a>
                  {' '}y la{' '}
                  <a href="/privacy" target="_blank">Política de Privacidad</a>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
