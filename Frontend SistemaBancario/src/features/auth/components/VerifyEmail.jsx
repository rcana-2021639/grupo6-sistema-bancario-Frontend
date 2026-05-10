import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../features/auth/services/authService';

export function VerifyEmail() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificacion no proporcionado');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verificado exitosamente.');

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
    <div className="lumina-auth-panel lumina-status">
      <header className="lumina-brand">
        <h1 className="lumina-brand-title">LUMINA BANK</h1>
        <p className="lumina-brand-subtitle">Institutional Private Banking</p>
      </header>

      <div className={`lumina-status-icon ${status}`}>
        {status === 'loading' && <span className="lumina-spinner" />}
        {status === 'success' && '✓'}
        {status === 'error' && 'x'}
      </div>

      <h2 className="lumina-form-title">
        {status === 'loading' && 'VERIFYING ACCESS'}
        {status === 'success' && 'ACCESS VERIFIED'}
        {status === 'error' && 'VERIFICATION ERROR'}
      </h2>

      <p className="lumina-message">{message}</p>

      {status === 'success' && (
        <p className="lumina-form-copy">Redirigiendo al login en 3 segundos...</p>
      )}

      {status === 'error' && (
        <button
          type="button"
          className="lumina-button"
          onClick={() => navigate('/login')}
        >
          GO TO LOGIN
        </button>
      )}
    </div>
  );
}

export default VerifyEmail;
