import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getDashboardPathByRole } from '../../../shared/utils/roles';

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
    <div className="lumina-auth-card">
      <header className="lumina-brand">
        <h1 className="lumina-brand-title">LUMINA BANK</h1>
        <p className="lumina-brand-subtitle">Institutional Private Banking</p>
      </header>

      <section>
        <h2 className="lumina-form-title">EXCLUSIVE ACCESS</h2>
        <p className="lumina-form-copy">Por favor, verifica tus credenciales institucionales.</p>
      </section>

      <form className="lumina-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="lumina-field">
          <label htmlFor="email">Direccion de correo electronico</label>
          <div className="lumina-input-wrap">
            <input
              type="email"
              id="email"
              placeholder="correo@ejemplo.com"
              disabled={loading}
              className={`lumina-input ${errors.email ? 'lumina-input-error' : ''}`}
              {...register('email', {
                required: 'El correo es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Correo no valido' }
              })}
            />
          </div>
          {errors.email && (
            <span className="lumina-error-text">{errors.email.message}</span>
          )}
        </div>

        <div className="lumina-field">
          <label htmlFor="password">Contrasena</label>
          <div className="lumina-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Ingresa tu clave privada"
              disabled={loading}
              className={`lumina-input ${errors.password ? 'lumina-input-error' : ''}`}
              {...register('password', { required: 'La contrasena es requerida' })}
            />
            <button
              type="button"
              className="lumina-eye"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {showPassword ? 'Oc' : 'Ve'}
            </button>
          </div>
          {errors.password && (
            <span className="lumina-error-text">{errors.password.message}</span>
          )}
        </div>

        <div className="lumina-options">
          <label className="lumina-check">
            <input
              type="checkbox"
              {...register('rememberMe')}
            />
            <span>Remember for 30 days</span>
          </label>
          <a href="/forgot-password" className="lumina-link">
            Forgot password
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="lumina-button"
        >
          {loading ? 'AUTHORIZING...' : 'AUTHORIZE ACCESS'}
        </button>
      </form>

      <div className="lumina-divider">Lumina</div>

      <button type="button" className="lumina-google">
        Access with Institutional Google Account
      </button>

      <div className="lumina-footer">
        <span>Solicita tu acceso con un administrador del banco.</span>
      </div>
    </div>
  );
};
