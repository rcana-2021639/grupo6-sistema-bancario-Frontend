import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3005/api/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('✅ Email verificado exitosamente. ¡Ya puedes iniciar sesión!');
        setToken('');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Error al verificar el email');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-header">
          <h1>Verificar Email</h1>
          <p>Ingresa el código que recibiste en tu correo electrónico</p>
        </div>

        <form onSubmit={handleSubmit} className="verify-form" noValidate>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="token">Código de Verificación</label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ingresa el código"
              disabled={isLoading}
              required
              autoFocus
            />
            <p className="hint">Revisa tu bandeja de entrada (y spam)</p>
          </div>

          <button
            type="submit"
            className="verify-button"
            disabled={isLoading || !token.trim()}
          >
            {isLoading ? 'Verificando...' : 'Verificar Email'}
          </button>
        </form>

        <div className="verify-footer">
          <p>
            ¿No recibiste el código?{' '}
            <button 
              className="link" 
              onClick={async () => {
                const email = prompt('Ingresa tu email para reenviar el código:');
                if (email) {
                  try {
                    const res = await fetch('http://localhost:3005/api/v1/auth/resend-verification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    const data = await res.json();
                    alert(data.message || 'Código reenviado');
                  } catch (e) {
                    alert('Error al reenviar');
                  }
                }
              }}
            >
              Reenviar código
            </button>
          </p>
          <p>
            ¿Ya verificaste? <Link to="/login" className="link">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;