import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../../auth/services/authService';
import { useAuthStore } from '../../auth/store/authStore';

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

const InfoItem = ({ label, value, highlight = false }) => (
  <div className={`rounded-lg border p-4 ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-1 break-words text-sm font-semibold ${highlight ? 'text-[#1e3a5f]' : 'text-slate-900'}`}>
      {value || 'No disponible'}
    </p>
  </div>
);

const Modal = ({ title, children, onClose, size = 'max-w-2xl' }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
    <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-xl ${size}`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-[#1e3a5f]">{title}</h2>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]">
          ×
        </button>
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

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();
      setProfile(response.data || response.user || response);
      setUser(response.data || response.user || response);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Solo se permiten archivos de imagen (JPEG, PNG, WebP)');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setUploading(true);
    try {
      await authService.uploadProfilePicture(file);
      toast.success('Foto de perfil actualizada exitosamente');
      setShowPictureModal(false);
      loadProfile(); // Recargar perfil para mostrar nueva imagen
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

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
        Cargando información del usuario...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg bg-[#1e3a5f] p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Usuario</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <img
              src={profile?.profilePicture || '/default-avatar.png'}
              alt="Foto de perfil"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20"
            />
            <button
              onClick={() => setShowPictureModal(true)}
              className="absolute -bottom-1 -right-1 rounded-full bg-[#0066cc] p-1.5 text-white transition hover:bg-[#1e3a5f]"
              title="Cambiar foto de perfil"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{fullName}</h1>
            <p className="mt-1 text-sm text-blue-100">{profile?.email || profile?.Email || 'Correo no disponible'}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">{roleLabels[role] || role}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">{statusText}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">{verifiedText}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoItem label="ID de usuario" value={profile?.id || profile?.Id || user?.id} highlight />
        <InfoItem label="Nombre" value={profile?.name || profile?.Name} />
        <InfoItem label="Apellido" value={profile?.surname || profile?.Surname} />
        <InfoItem label="Usuario" value={profile?.username || profile?.Username || user?.username} />
        <InfoItem label="Correo" value={profile?.email || profile?.Email} highlight />
        <InfoItem label="Teléfono" value={profile?.phone || profile?.Phone} />
        <InfoItem label="Rol" value={roleLabels[role] || role} />
        <InfoItem label="Estado" value={statusText} />
        <InfoItem label="Creado" value={formatDate(profile?.createdAt || profile?.CreatedAt)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#1e3a5f]">Cambiar Contraseña</h2>
          <p className="mt-2 text-sm text-slate-600">
            Actualiza tu contraseña para mantener tu cuenta segura.
          </p>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="mt-4 rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f]"
          >
            Cambiar Contraseña
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-[#1e3a5f]">Configuración de Cuenta</h2>
          <p className="mt-2 text-sm text-slate-600">
            Gestiona las preferencias de tu cuenta.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Funcionalidades adicionales próximamente.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-[#1e3a5f]">Datos para crear cuenta bancaria</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Para vincular una cuenta bancaria real, el administrador debe usar principalmente el ID de usuario. El nombre y correo ayudan a confirmar que se está creando para la persona correcta.
        </p>
      </div>

      {/* Modal de Cambiar Contraseña */}
      {showPasswordModal && (
        <Modal title="Cambiar Contraseña" onClose={() => setShowPasswordModal(false)}>
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Contraseña Actual *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength="8"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
              />
              <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e3a5f]"
              >
                Cambiar Contraseña
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Cambiar Foto */}
      {showPictureModal && (
        <Modal title="Cambiar Foto de Perfil" onClose={() => setShowPictureModal(false)}>
          <div className="p-6">
            <div className="text-center">
              <img
                src={profile?.profilePicture || '/default-avatar.png'}
                alt="Foto actual"
                className="mx-auto h-24 w-24 rounded-full object-cover"
              />
              <p className="mt-4 text-sm text-slate-600">
                Selecciona una nueva imagen para tu foto de perfil.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Formatos permitidos: JPEG, PNG, WebP. Tamaño máximo: 5MB.
              </p>
            </div>
            <div className="mt-6">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePictureChange}
                disabled={uploading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#0066cc] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#1e3a5f]"
              />
              {uploading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0066cc] border-t-transparent"></div>
                  <span className="ml-2 text-sm text-slate-600">Subiendo imagen...</span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Profile;
