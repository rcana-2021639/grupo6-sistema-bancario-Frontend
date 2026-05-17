/* eslint-disable react-refresh/only-export-components */

export { formatCompactMoney, formatMoney, getMoneyTitle } from '../../../shared/utils/money';

export const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value));
};

export const statusStyles = {
  activa: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactiva: 'bg-slate-100 text-slate-600 ring-slate-200',
  bloqueada: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export const roleLabels = {
  ADMIN_ROLE: 'Administrador',
  USER_ROLE: 'Usuario',
  MANAGER_ROLE: 'Gerente',
  ATM_ROLE: 'Cajero',
};

export const StatCard = ({ label, value, detail }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-3 text-2xl font-bold text-[#1e3a5f] sm:text-3xl">{value}</p>
    {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
  </div>
);
