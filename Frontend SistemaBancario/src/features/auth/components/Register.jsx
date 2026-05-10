import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';

export function Register() {
  const { register, loading, error } = useAuthStore();
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
      setLocalError('Las contrasenas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    if (!/^\d{8}$/.test(formData.phone)) {
      setLocalError('El telefono debe tener exactamente 8 digitos');
      return;
    }

    try {
      const registerData = {
        name: formData.name,
        surname: formData.surname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };
      await register(registerData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  if (success) {
    return (
      <div className="lumina-auth-panel lumina-status">
        <header className="lumina-brand">
          <h1 className="lumina-brand-title">LUMINA BANK</h1>
          <p className="lumina-brand-subtitle">Institutional Private Banking</p>
        </header>

        <div className="lumina-status-icon success">✓</div>
        <h2 className="lumina-form-title">REGISTRO EXITOSO</h2>
        <p className="lumina-message">Tu cuenta ha sido creada. Revisa tu correo electronico para verificar tu cuenta.</p>
        <p className="lumina-form-copy">Seras redirigido al login...</p>
      </div>
    );
  }

  return (
    <div className="lumina-auth-panel">
      <header className="lumina-brand">
        <h1 className="lumina-brand-title">LUMINA BANK</h1>
        <p className="lumina-brand-subtitle">Institutional Private Banking</p>
      </header>

      <section>
        <h2 className="lumina-form-title">PRIVATE REGISTRY</h2>
        <p className="lumina-form-copy">Completa tus credenciales para solicitar acceso institucional.</p>
      </section>

      <form className="lumina-register-form" onSubmit={handleSubmit}>
        {(localError || error) && (
          <div className="lumina-alert">
            {localError || error}
          </div>
        )}

        <div className="lumina-section">
          <h3 className="lumina-section-title">Informacion personal</h3>
          <div className="lumina-register-grid">
            <div className="lumina-field">
              <label htmlFor="name">Nombre</label>
              <input className="lumina-input" type="text" id="name" name="name" placeholder="Tu nombre" value={formData.name} onInput={handleChange} disabled={loading} />
            </div>
            <div className="lumina-field">
              <label htmlFor="surname">Apellido</label>
              <input className="lumina-input" type="text" id="surname" name="surname" placeholder="Tu apellido" value={formData.surname} onInput={handleChange} disabled={loading} />
            </div>
            <div className="lumina-field span-2">
              <label htmlFor="username">Usuario</label>
              <input className="lumina-input" type="text" id="username" name="username" placeholder="Nombre de usuario" value={formData.username} onInput={handleChange} disabled={loading} />
            </div>
          </div>
        </div>

        <div className="lumina-section">
          <h3 className="lumina-section-title">Contacto</h3>
          <div className="lumina-register-grid">
            <div className="lumina-field">
              <label htmlFor="email">Correo electronico</label>
              <input className="lumina-input" type="email" id="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onInput={handleChange} disabled={loading} />
            </div>
            <div className="lumina-field">
              <label htmlFor="phone">Telefono</label>
              <input className="lumina-input" type="tel" id="phone" name="phone" placeholder="8 digitos" value={formData.phone} onInput={handleChange} disabled={loading} />
            </div>
          </div>
        </div>

        <div className="lumina-section">
          <h3 className="lumina-section-title">Seguridad</h3>
          <div className="lumina-register-grid">
            <div className="lumina-field">
              <label htmlFor="password">Contrasena</label>
              <div className="lumina-input-wrap">
                <input className="lumina-input" type={showPassword ? 'text' : 'password'} id="password" name="password" placeholder="Minimo 8 caracteres" value={formData.password} onInput={handleChange} disabled={loading} />
                <button type="button" className="lumina-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}>
                  {showPassword ? 'Oc' : 'Ve'}
                </button>
              </div>
            </div>
            <div className="lumina-field">
              <label htmlFor="confirmPassword">Confirmar</label>
              <input className="lumina-input" type={showPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" placeholder="Repite tu contrasena" value={formData.confirmPassword} onInput={handleChange} disabled={loading} />
            </div>
          </div>
        </div>

        <label className="lumina-check">
          <input type="checkbox" required />
          <span>Acepto los terminos y la politica de privacidad</span>
        </label>

        <button type="submit" className="lumina-button" disabled={loading}>
          {loading ? 'CREATING ACCESS...' : 'CREATE ACCESS'}
        </button>
      </form>

      <div className="lumina-footer">
        <span>Already have an account? </span>
        <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
          Sign in
        </a>
      </div>
    </div>
  );
}

export default Register;
