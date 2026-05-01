import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import FloatingLines from '../../../shared/components/FloatingLines/FloatingLines';
import './Register.css';

// Constantes FUERA del componente para evitar re-renders del WebGL
const BG_WAVES = ["top", "middle", "bottom"];
const BG_GRADIENT = ["#a427e4", "#6f6f6f", "#6a6a6a"];

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
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/^\d{8}$/.test(formData.phone)) {
      setLocalError('El teléfono debe tener exactamente 8 dígitos');
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
      console.log('Datos de registro:', registerData);
      await register(registerData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error en registro:', err.response?.data);
      setLocalError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-background">
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
        <div className="register-container">
          <div className="glass-card success-state">
            <div className="success-check">✓</div>
            <h2>¡Registro exitoso!</h2>
            <p>Tu cuenta ha sido creada. Revisa tu correo electrónico para verificar tu cuenta.</p>
            <p className="redirect-msg">Serás redirigido al login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-background">
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

      <div className="register-container">
        <div className="glass-card">

          <h1 className="card-title">REGISTRO</h1>

          <form className="glass-form" onSubmit={handleSubmit}>
            {(localError || error) && (
              <div className="glass-alert">
                {localError || error}
              </div>
            )}

            {/* ---- Información Personal (top, full width) ---- */}
            <div className="section-personal">
              <h3 className="section-label">Información Personal</h3>
              <div className="fields-row-3">
                <div className="glass-field">
                  <label htmlFor="name">Nombre</label>
                  <input type="text" id="name" name="name" placeholder="Tu nombre" value={formData.name} onInput={handleChange} disabled={loading} />
                </div>
                <div className="glass-field">
                  <label htmlFor="surname">Apellido</label>
                  <input type="text" id="surname" name="surname" placeholder="Tu apellido" value={formData.surname} onInput={handleChange} disabled={loading} />
                </div>
                <div className="glass-field">
                  <label htmlFor="username">Usuario</label>
                  <input type="text" id="username" name="username" placeholder="Nombre de usuario" value={formData.username} onInput={handleChange} disabled={loading} />
                </div>
              </div>
            </div>

            {/* ---- Contacto + Seguridad (side by side) ---- */}
            <div className="section-columns">
              {/* Left: Contacto */}
              <div className="section-col">
                <h3 className="section-label">Contacto</h3>
                <div className="glass-field">
                  <label htmlFor="email">Correo electrónico</label>
                  <input type="email" id="email" name="email" placeholder="correo@ejemplo.com" value={formData.email} onInput={handleChange} disabled={loading} />
                </div>
                <div className="glass-field">
                  <label htmlFor="phone">Teléfono</label>
                  <input type="tel" id="phone" name="phone" placeholder="8 dígitos" value={formData.phone} onInput={handleChange} disabled={loading} />
                </div>
              </div>

              {/* Right: Seguridad */}
              <div className="section-col">
                <h3 className="section-label">Seguridad</h3>
                <div className="glass-field">
                  <label htmlFor="password">Contraseña</label>
                  <div className="glass-input-row">
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" placeholder="Mínimo 8 caracteres" value={formData.password} onInput={handleChange} disabled={loading} />
                    <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? '◉' : '◎'}
                    </button>
                  </div>
                </div>
                <div className="glass-field">
                  <label htmlFor="confirmPassword">Confirmar</label>
                  <input type={showPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" placeholder="Repite tu contraseña" value={formData.confirmPassword} onInput={handleChange} disabled={loading} />
                </div>
              </div>
            </div>

            {/* ---- Términos + Botón ---- */}
            <label className="glass-terms">
              <input type="checkbox" required />
              <span>
                Acepto los <a href="/terms" target="_blank">Términos</a> y la <a href="/privacy" target="_blank">Política de Privacidad</a>
              </span>
            </label>

            <button type="submit" className="glass-btn" disabled={loading}>
              {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
            </button>
          </form>

          <div className="glass-footer">
            <span>¿Ya tienes una cuenta? </span>
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Inicia sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
