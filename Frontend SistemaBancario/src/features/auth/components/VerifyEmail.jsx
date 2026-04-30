import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../features/auth/services/authService';
import FloatingLines from '../../../shared/components/FloatingLines/FloatingLines';
import './VerifyEmail.css';

// Constantes FUERA del componente para evitar re-renders del WebGL
const BG_WAVES = ["top", "middle", "bottom"];
const BG_GRADIENT = ["#a427e4", "#6f6f6f", "#6a6a6a"];

export function VerifyEmail() {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL query parameters
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no proporcionado');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || '¡Email verificado exitosamente!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Error al verificar el email');
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="verify-email-page">
      <div className="verify-email-background">
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

      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="verify-icon">
            {status === 'loading' && <span className="spinner-large"></span>}
            {status === 'success' && <span className="success-icon">✓</span>}
            {status === 'error' && <span className="error-icon">✗</span>}
          </div>

          <h1>
            {status === 'loading' && 'Verificando tu email...'}
            {status === 'success' && '¡Email verificado!'}
            {status === 'error' && 'Error en la verificación'}
          </h1>

          <p className="message">{message}</p>

          {status === 'success' && (
            <p className="redirect-message">Redirigiendo al login en 3 segundos...</p>
          )}

          {status === 'error' && (
            <button 
              className="verify-button"
              onClick={() => navigate('/login')}
            >
              Ir al Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
