import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getDashboardPathByRole } from '../../../shared/utils/roles';
import '../../../styles/lumina-login.css';

export const LoginForm = () => {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success('Inicio de sesion exitoso');
      navigate(getDashboardPathByRole(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error al iniciar sesion');
    }
  };

  return (
    <div className="lumina-login-card">
      <header className="lumina-login-brand">
        <h1 className="lumina-login-brand-title">LUMINA BANK</h1>
        <p className="lumina-login-brand-subtitle">Institutional Private Banking</p>
      </header>

      <section>
        <h2 className="lumina-login-form-title">EXCLUSIVE ACCESS</h2>
        <p className="lumina-login-form-copy">Por favor, verifica tus credenciales institucionales.</p>
      </section>

      <form className="lumina-login-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="lumina-login-field">
          <label htmlFor="email">Direccion de correo electronico</label>
          <div className="lumina-login-input-wrap">
            <input
              type="email"
              id="email"
              placeholder="correo@ejemplo.com"
              disabled={loading}
              className={`lumina-login-input ${errors.email ? 'lumina-login-input-error' : ''}`}
              {...register('email', {
                required: 'El correo es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Correo no valido' }
              })}
            />
          </div>
          {errors.email && (
            <span className="lumina-login-error-text">{errors.email.message}</span>
          )}
        </div>

        <div className="lumina-login-field">
          <label htmlFor="password">Contrasena</label>
          <div className="lumina-login-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Ingresa tu clave privada"
              disabled={loading}
              className={`lumina-login-input ${errors.password ? 'lumina-login-input-error' : ''}`}
              {...register('password', { required: 'La contraseña es requerida' })}
            />
            <button
              type="button"
              className="lumina-login-eye"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? 'Oc' : 'Ve'}
            </button>
          </div>
          {errors.password && (
            <span className="lumina-login-error-text">{errors.password.message}</span>
          )}
        </div>

        <div className="lumina-login-options">
          <label className="lumina-login-check">
            <input
              type="checkbox"
              {...register('rememberMe')}
            />
            <span>Remember for 30 days</span>
          </label>
          <Link to="/forgot-password" className="lumina-login-link">
            Forgot password
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="lumina-login-button"
        >
          {loading ? 'AUTHORIZING...' : 'AUTHORIZE ACCESS'}
        </button>
      </form>

      <div className="lumina-login-footer">
        <span>Solicita tu acceso con un administrador del banco.</span>
      </div>
    </div>
  );
};
