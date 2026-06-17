import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const ResetPassword = ({ mobileFlow = false }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showMobileSuccess, setShowMobileSuccess] = useState(false);
  const token = searchParams.get('token') || '';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });
  const mobileSuccessModal = showMobileSuccess ? createPortal(
    <div className="lumina-modal-backdrop lumina-mobile-success-backdrop" role="presentation">
      <div className="lumina-modal lumina-mobile-success-modal" role="dialog" aria-modal="true" aria-labelledby="reset-mobile-success">
        <h3 id="reset-mobile-success">Contrasena actualizada</h3>
        <p>Contraseña actualizada ya puedes regresar a la app</p>
      </div>
    </div>,
    document.body
  ) : null;

  const onSubmit = async ({ password, confirmPassword }) => {
    if (!token) {
      toast.error('El enlace no incluye token de recuperacion');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }

    try {
      const response = await authService.resetPassword(token, password);
      toast.success(response.message || 'Contrasena actualizada');
      if (mobileFlow) {
        setShowMobileSuccess(true);
        return;
      }
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la contrasena');
    }
  };

  return (
    <div className="lumina-auth-card">
      <header className="lumina-brand">
        <h1 className="lumina-brand-title">LUMINA BANK</h1>
        <p className="lumina-brand-subtitle">Institutional Private Banking</p>
      </header>

      <section>
        <h2 className="lumina-form-title">RESET ACCESS</h2>
        <p className="lumina-form-copy">Define una nueva clave segura para tu cuenta Lumina.</p>
      </section>

      {!token && (
        <div className="lumina-alert">El enlace de recuperacion no incluye token. Solicita un nuevo correo desde login.</div>
      )}

      <form className="lumina-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="lumina-auth-hint">
          <KeyRound size={18} />
          <span>Usa al menos 8 caracteres y confirma la misma contrasena.</span>
        </div>
        <div className="lumina-field">
          <label htmlFor="reset-password">Nueva contrasena</label>
          <div className="lumina-input-wrap">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              className={`lumina-input ${errors.password ? 'lumina-input-error' : ''}`}
              disabled={isSubmitting || !token}
              {...register('password', {
                required: 'La contrasena es requerida',
                minLength: { value: 8, message: 'La contrasena debe tener al menos 8 caracteres' },
              })}
            />
            <button
              type="button"
              className="lumina-eye"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <span className="lumina-error-text">{errors.password.message}</span>}
        </div>

        <div className="lumina-field">
          <label htmlFor="confirm-password">Confirmar contrasena</label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            className={`lumina-input ${errors.confirmPassword ? 'lumina-input-error' : ''}`}
            disabled={isSubmitting || !token}
            {...register('confirmPassword', {
              required: 'Confirma la contrasena',
            })}
          />
          {errors.confirmPassword && <span className="lumina-error-text">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="lumina-button" disabled={isSubmitting || !token}>
          {isSubmitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
        </button>
      </form>

      <div className="lumina-footer">
        <Link to="/login">Volver al inicio de sesion</Link>
      </div>

      {mobileSuccessModal}
    </div>
  );
};

export default ResetPassword;
