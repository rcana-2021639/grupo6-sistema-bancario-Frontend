import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FloatingLines from '../../components/FloatingLines/FloatingLines';
import './Login.css';

// Constantes FUERA del componente para evitar re-renders del WebGL
const BG_WAVES = ["top", "middle", "bottom"];
const BG_GRADIENT = ["#a427e4", "#6f6f6f", "#6a6a6a"];

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
        <FloatingLines
          enabledWaves={BG_WAVES}
          lineCount={8}
          lineDistance={8}
          bendRadius={8}
          bendStrength={-2}
          interactive
          parallax={true}
          animationSpeed={1}
          linesGradient={BG_GRADIENT}
        />
      </div>

      <div className="login-container">
        <div className="glass-card">

          <h1 className="card-title">LOGIN BANK</h1>

          <form className="glass-form" onSubmit={handleSubmit}>
            {(localError || error) && (
              <div className="glass-alert">
                {localError || error}
              </div>
            )}

            <div className="glass-field">
              <label htmlFor="email">Email </label>
              <div className="glass-input-row">
                <input
                  type="email"
                  id="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onInput={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="glass-field">
              <label htmlFor="password">Password</label>
              <div className="glass-input-row">
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
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '◉' : '◎'}
                </button>
              </div>
            </div>

            <div className="glass-options">
              <label className="glass-check">
                <input type="checkbox" />
                <span>Recordarme siempre</span>
              </label>
              <a href="/forgot-password" className="glass-link">Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="glass-btn" disabled={loading}>
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>

          <div className="glass-footer">
            <span>¿No tienes una cuenta? </span>
            <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
              Registrarse aqui
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
