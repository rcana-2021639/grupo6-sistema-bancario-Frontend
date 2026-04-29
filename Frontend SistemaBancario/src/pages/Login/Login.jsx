import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Por favor complete todos los campos');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>
        <div className="bg-gradient bg-gradient-3"></div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">K</div>
              <span className="logo-text">Kinal Bank</span>
            </div>
            <h1>Bienvenido de vuelta</h1>
            <p>Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {(localError || error) && (
              <div className="alert alert-error">
                {localError || error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  id="email"
                  placeholder="tu@email.com"
                  value={email}
                  onInput={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onInput={(e) => setPassword(e.target.value)}
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

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="/forgot-password" className="forgot-password">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿No tienes una cuenta?{' '}
              <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>

        <div className="login-info">
          <h2>Banca digital moderna y segura</h2>
          <p>
            Accede a tus cuentas, realiza transacciones y gestiona tus finanzas 
            de manera rápida y segura desde cualquier lugar.
          </p>
          
          <div className="features">
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <span>Seguridad avanzada</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Transacciones instantáneas</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📱</span>
              <span>Acceso 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
