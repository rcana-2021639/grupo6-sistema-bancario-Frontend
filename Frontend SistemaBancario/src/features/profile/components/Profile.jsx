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

const Profile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authService.getProfile()
      .then((response) => {
        if (active) setProfile(response.data || response.user || response);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || error.message || 'No se pudo cargar el usuario');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fullName = [profile?.name || profile?.Name, profile?.surname || profile?.Surname]
    .filter(Boolean)
    .join(' ') || profile?.username || profile?.Username || 'Usuario';
  const role = profile?.role || user?.role || 'USER_ROLE';
  const statusText = profile?.status === false ? 'Inactivo' : 'Activo';
  const verifiedText = profile?.isEmailVerified === false ? 'Correo pendiente' : 'Correo verificado';

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
        Cargando informacion del usuario...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg bg-[#1e3a5f] p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Usuario</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-2xl font-bold ring-1 ring-white/20">
            {fullName.charAt(0).toUpperCase()}
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
        <InfoItem label="Telefono" value={profile?.phone || profile?.Phone} />
        <InfoItem label="Rol" value={roleLabels[role] || role} />
        <InfoItem label="Estado" value={statusText} />
        <InfoItem label="Creado" value={formatDate(profile?.createdAt || profile?.CreatedAt)} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-[#1e3a5f]">Datos para crear cuenta bancaria</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Para vincular una cuenta bancaria real, el administrador debe usar principalmente el ID de usuario. El nombre y correo ayudan a confirmar que se esta creando para la persona correcta.
        </p>
      </div>
    </section>
  );
};

export default Profile;
