import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Fingerprint, KeyRound, MailCheck, ShieldCheck, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../auth/services/authService';
import { useAuthStore } from '../../auth/store/authStore';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';

const roleLabels = {
  ADMIN_ROLE: 'Administrador',
  USER_ROLE: 'Usuario',
  MANAGER_ROLE: 'Gerente',
  ATM_ROLE: 'Cajero',
};

const formatDate = (value) => {
  if (!value) return 'No disponible';
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value));
};

const getProfilePictureSrc = (value) => {
  const src = String(value || '').trim();
  if (!src || src.includes('DEFAULT_PROFILE_IMAGE')) return '/default-avatar.svg';
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return '/default-avatar.svg';
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <motion.div whileHover={{ y: -4 }} className="lumina-card">
    <div className="profile-info-icon"><Icon size={19} /></div>
    <span className="lumina-mini-label">{label}</span>
    <strong className="profile-info-value">{value || 'No disponible'}</strong>
  </motion.div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="modal-backdrop">
    <div className="lumina-modal profile-modal">
      <div className="modal-header">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} className="lumina-button secondary">Cerrar</button>
      </div>
      {children}
    </div>
  </div>
);

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      setProfile(response.data || response.user || response);
      setUser(response.data || response.user || response);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    Promise.resolve().then(loadProfile);
  }, [loadProfile]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Solo se permiten archivos de imagen (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setUploading(true);
    try {
      await authService.uploadProfilePicture(file);
      toast.success('Foto de perfil actualizada exitosamente');
      setShowPictureModal(false);
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const fullName = [profile?.name || profile?.Name, profile?.surname || profile?.Surname]
    .filter(Boolean)
    .join(' ') || profile?.username || profile?.Username || 'Usuario';
  const role = profile?.role || user?.role || 'USER_ROLE';
  const statusText = profile?.status === false ? 'Inactivo' : 'Activo';
  const verifiedText = profile?.isEmailVerified === false ? 'Correo pendiente' : 'Correo verificado';
  const profilePictureSrc = getProfilePictureSrc(profile?.profilePicture);

  if (loading) {
    return <div className="lumina-empty">Cargando tu identidad Lumina...</div>;
  }

  return (
    <motion.section className="lumina-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="profile-hero lumina-page-hero">
        <div className="profile-orbit">
          <img src={profilePictureSrc} alt="Foto de perfil" />
          <button type="button" onClick={() => setShowPictureModal(true)} className="profile-camera">
            <Camera size={18} />
          </button>
        </div>
        <div>
          <p className="lumina-kicker">Perfil</p>
          <AnimatedTitle className="lumina-title">{fullName}</AnimatedTitle>
          <p className="lumina-copy">{profile?.email || profile?.Email || 'Correo no disponible'}</p>
          <div className="profile-badges">
            <span className="lumina-badge"><ShieldCheck size={14} /> {roleLabels[role] || role}</span>
            <span className="lumina-badge">{statusText}</span>
            <span className="lumina-badge"><MailCheck size={14} /> {verifiedText}</span>
          </div>
        </div>
      </div>

      <div className="lumina-grid-3">
        <InfoItem icon={Fingerprint} label="ID de usuario" value={profile?.id || profile?.Id || user?.id} />
        <InfoItem icon={UserRound} label="Usuario" value={profile?.username || profile?.Username || user?.username} />
        <InfoItem icon={MailCheck} label="Correo" value={profile?.email || profile?.Email} />
        <InfoItem icon={UserRound} label="Nombre" value={profile?.name || profile?.Name} />
        <InfoItem icon={UserRound} label="Apellido" value={profile?.surname || profile?.Surname} />
        <InfoItem icon={ShieldCheck} label="Creado" value={formatDate(profile?.createdAt || profile?.CreatedAt)} />
      </div>

      <div className="profile-action-grid">
        <div className="lumina-panel">
          <KeyRound size={24} />
          <h2>Cambiar contraseña</h2>
          <p>Actualiza tus credenciales privadas con una nueva clave segura.</p>
          <button type="button" onClick={() => setShowPasswordModal(true)} className="lumina-button">
            Cambiar contraseña
          </button>
        </div>
        <div className="lumina-panel">
          <ShieldCheck size={24} />
          <h2>Datos para cuenta bancaria</h2>
          <p>El administrador debe usar tu ID de usuario para vincular una cuenta real a tu perfil.</p>
        </div>
      </div>

      {showPasswordModal && (
        <Modal title="Cambiar contraseña" onClose={() => setShowPasswordModal(false)}>
          <form onSubmit={handlePasswordSubmit} className="lux-form">
            <label>Contraseña actual<input className="lux-input" type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required /></label>
            <label>Nueva contraseña<input className="lux-input" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength="8" /></label>
            <label>Confirmar nueva contraseña<input className="lux-input" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required /></label>
            <div className="lux-actions">
              <button type="button" onClick={() => setShowPasswordModal(false)} className="lumina-button secondary">Cancelar</button>
              <button type="submit" className="lumina-button">Guardar clave</button>
            </div>
          </form>
        </Modal>
      )}

      {showPictureModal && (
        <Modal title="Cambiar foto de perfil" onClose={() => setShowPictureModal(false)}>
          <div className="lux-form">
            <div className="profile-upload-preview">
              <img src={profilePictureSrc} alt="Foto actual" />
              <p>Selecciona una nueva imagen para tu identidad Lumina. JPEG, PNG o WebP. Maximo 5MB.</p>
            </div>
            <input className="lux-input" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePictureChange} disabled={uploading} />
            {uploading && <p className="lumina-copy">Subiendo imagen...</p>}
          </div>
        </Modal>
      )}
    </motion.section>
  );
};

export default Profile;
