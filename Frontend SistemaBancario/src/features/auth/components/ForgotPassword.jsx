import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }) => {
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.message || 'Solicitud enviada');
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar la solicitud');
    }
  };

  return (
    <div className="lumina-auth-card">
      <header className="lumina-brand">
        <h1 className="lumina-brand-title">LUMINA BANK</h1>
        <p className="lumina-brand-subtitle">Institutional Private Banking</p>
      </header>

      <section>
        <h2 className="lumina-form-title">RECOVER ACCESS</h2>
        <p className="lumina-form-copy">Ingresa tu correo institucional para recibir un enlace de recuperacion.</p>
      </section>

      <form className="lumina-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="lumina-field">
          <label htmlFor="forgot-email">Correo electronico</label>
          <input
            id="forgot-email"
            type="email"
            className={`lumina-input ${errors.email ? 'lumina-input-error' : ''}`}
            placeholder="correo@ejemplo.com"
            disabled={isSubmitting}
            {...register('email', {
              required: 'El correo es requerido',
              pattern: { value: /^\S+@\S+$/i, message: 'Correo no valido' },
            })}
          />
          {errors.email && <span className="lumina-error-text">{errors.email.message}</span>}
        </div>

        <button type="submit" className="lumina-button" disabled={isSubmitting}>
          {isSubmitting ? 'SENDING...' : 'SEND RECOVERY LINK'}
        </button>
      </form>

      <div className="lumina-footer">
        <Link to="/login">Volver al inicio de sesion</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
