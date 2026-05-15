import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Eye, Pencil, Plus, RotateCcw, Search, ShieldCheck, Trash2, UsersRound, X } from 'lucide-react';
import authService from '../../auth/services/authService';
import {
  changeAccountStatus,
  createAccount,
  deleteAccount,
  getAllAccounts,
  updateAccount,
} from '../services/accountService';
import { getTransactions } from '../../transactions/services/transactionService';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';

const PAGE_SIZE = 6;
const ACCOUNT_TYPES = ['ahorro', 'corriente', 'nomina'];
const ADMIN_ROLES = ['ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'];
const ADMIN_ROLE_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'ADMIN_ROLE', label: 'ADMIN_ROLE' },
  { value: 'MANAGER_ROLE', label: 'MANAGER_ROLE' },
  { value: 'ATM_ROLE', label: 'ATM_ROLE' },
];
const STATUS_FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'activa', label: 'Activas' },
  { value: 'inactiva', label: 'Inactivas' },
  { value: 'bloqueada', label: 'Bloqueadas' },
];
const ACCOUNT_STATUSES = [
  { value: 'activa', label: 'Activar', description: 'La cuenta queda disponible para operar.' },
  { value: 'inactiva', label: 'Desactivar', description: 'La cuenta queda cerrada para operaciones.' },
  { value: 'bloqueada', label: 'Bloquear', description: 'La cuenta queda suspendida temporalmente.' },
];

const clientInitialForm = {
  name: '',
  surname: '',
  username: '',
  email: '',
  password: '',
  accountType: 'ahorro',
  dpi: '',
  address: '',
  phone: '',
  jobName: '',
  monthlyIncome: '',
  currencyCode: 'GTQ',
  dailyWithdrawalLimit: '',
  annualInterestRate: '',
};

const adminInitialForm = {
  name: '',
  username: '',
  email: '',
  password: '',
  phone: '',
  roleName: 'MANAGER_ROLE',
};

const statusStyles = {
  activa: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactiva: 'bg-slate-100 text-slate-600 ring-slate-200',
  bloqueada: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const cardAccentStyles = {
  activa: 'border-l-4 border-l-emerald-500',
  inactiva: 'border-l-4 border-l-slate-300',
  bloqueada: 'border-l-4 border-l-amber-500',
};

const userStatusStyles = {
  true: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  false: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const roleLabels = {
  ADMIN_ROLE: 'ADMIN_ROLE',
  MANAGER_ROLE: 'MANAGER_ROLE',
  ATM_ROLE: 'ATM_ROLE',
};

const formatMoney = (value, currency = 'GTQ') => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
);

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value));
};

const Modal = ({ title, children, onClose, size = 'max-w-3xl' }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6 accounts-modal-backdrop">
    <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-xl accounts-modal ${size}`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 accounts-modal-head">
        <h2 className="text-lg font-semibold text-[#1e3a5f]">{title}</h2>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]" aria-label="Cerrar modal">
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', required = false, options }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-slate-700">
      {label} {required && <span className="text-[#0066cc]">*</span>}
    </span>
    {options ? (
      <select name={name} value={value} onChange={onChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100">
        {options.map((option) => <option key={option} value={option}>{roleLabels[option] || option}</option>)}
      </select>
    ) : (
      <input name={name} value={value} onChange={onChange} type={type} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100" />
    )}
  </label>
);

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">Página {page} de {totalPages}</p>
      <div className="flex gap-2">
        <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc] disabled:cursor-not-allowed disabled:opacity-50">
          Anterior
        </button>
        <button type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc] disabled:cursor-not-allowed disabled:opacity-50">
          Siguiente
        </button>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-md border border-slate-200 bg-white p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-900">{value || 'No definido'}</p>
  </div>
);

const buildClientCreatePayload = (form) => ({
  user: {
    name: form.name.trim(),
    surname: form.surname.trim() || 'Cliente',
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    phone: form.phone.trim(),
  },
  account: {
    accountType: form.accountType,
    dpi: form.dpi.trim(),
    address: form.address.trim(),
    phone: form.phone.trim(),
    jobName: form.jobName.trim(),
    monthlyIncome: Number(form.monthlyIncome),
    currencyCode: form.currencyCode.trim().toUpperCase(),
    ...(form.dailyWithdrawalLimit !== '' && { dailyWithdrawalLimit: Number(form.dailyWithdrawalLimit) }),
    ...(form.annualInterestRate !== '' && { annualInterestRate: Number(form.annualInterestRate) }),
  },
});

const buildClientUpdatePayload = (form) => ({
  accountType: form.accountType,
  name: form.name?.trim(),
  address: form.address?.trim(),
  phone: form.phone?.trim(),
  jobName: form.jobName?.trim(),
  monthlyIncome: Number(form.monthlyIncome),
  currencyCode: form.currencyCode?.trim().toUpperCase(),
  ...(form.dailyWithdrawalLimit !== '' && { dailyWithdrawalLimit: Number(form.dailyWithdrawalLimit) }),
  ...(form.annualInterestRate !== '' && { annualInterestRate: Number(form.annualInterestRate) }),
});

const buildAdminPayload = (form, mode) => {
  const payload = {
    name: form.name.trim(),
    username: form.username.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    roleName: String(form.roleName || '').trim().toUpperCase(),
  };

  if (mode === 'create') {
    payload.password = form.password;
  }

  return payload;
};

const validateClientForm = (form, mode) => {
  const required = mode === 'create'
    ? ['name', 'username', 'email', 'password', 'accountType', 'dpi', 'address', 'phone', 'jobName', 'monthlyIncome', 'currencyCode']
    : ['accountType', 'address', 'phone', 'jobName', 'monthlyIncome', 'currencyCode'];
  const missing = required.find((field) => !String(form[field] ?? '').trim());
  if (missing) return 'Completa todos los campos obligatorios.';
  if (mode === 'create' && !/^\S+@\S+\.\S+$/.test(form.email)) return 'Ingresa un correo valido.';
  if (mode === 'create' && String(form.password).length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (mode === 'create' && !/^\d{13}$/.test(form.dpi)) return 'El DPI debe tener 13 dígitos.';
  if (!/^\d{8}$/.test(form.phone)) return 'El celular debe tener 8 dígitos.';
  if (!/^[A-Za-z]{3}$/.test(form.currencyCode)) return 'La moneda debe tener 3 letras, por ejemplo GTQ.';
  return '';
};

const validateAdminForm = (form, mode) => {
  const required = mode === 'create'
    ? ['name', 'username', 'email', 'password', 'phone', 'roleName']
    : ['name', 'username', 'email', 'phone', 'roleName'];
  const missing = required.find((field) => !String(form[field] ?? '').trim());
  if (missing) return 'Completa todos los campos obligatorios.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Ingresa un correo valido.';
  if (!/^\d{8}$/.test(form.phone)) return 'El teléfono debe tener 8 dígitos.';
  if (!ADMIN_ROLES.includes(String(form.roleName || '').trim().toUpperCase())) return 'Selecciona un rol administrativo valido.';
  if (mode === 'create' && String(form.password).length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return '';
};

const ClientAccountForm = ({ mode, initialData, saving, onCancel, onSubmit }) => {
  const [form, setForm] = useState(() => (
    mode === 'create'
      ? clientInitialForm
      : {
        accountType: initialData?.accountType || 'ahorro',
        name: initialData?.name || '',
        address: initialData?.address || '',
        phone: initialData?.phone || '',
        jobName: initialData?.jobName || '',
        monthlyIncome: initialData?.monthlyIncome ?? '',
        currencyCode: initialData?.currencyCode || 'GTQ',
        dailyWithdrawalLimit: initialData?.dailyWithdrawalLimit ?? '',
        annualInterestRate: initialData?.annualInterestRate ?? '',
      }
  ));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const error = validateClientForm(form, mode);
    if (error) {
      toast.error(error);
      return;
    }
    onSubmit(mode === 'create' ? buildClientCreatePayload(form) : buildClientUpdatePayload(form));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de cuenta" name="accountType" value={form.accountType} onChange={handleChange} options={ACCOUNT_TYPES} required />
        <Field label="Moneda" name="currencyCode" value={form.currencyCode} onChange={handleChange} required />
        {mode === 'create' && (
          <>
            <Field label="Nombre" name="name" value={form.name} onChange={handleChange} required />
            <Field label="Apellido" name="surname" value={form.surname} onChange={handleChange} />
            <Field label="Usuario" name="username" value={form.username} onChange={handleChange} required />
            <Field label="Correo" name="email" value={form.email} onChange={handleChange} type="email" required />
            <Field label="Contraseña" name="password" value={form.password} onChange={handleChange} type="password" required />
            <Field label="DPI" name="dpi" value={form.dpi} onChange={handleChange} required />
          </>
        )}
        {mode === 'edit' && <Field label="Nombre del titular" name="name" value={form.name} onChange={handleChange} />}
        <Field label="Dirección" name="address" value={form.address} onChange={handleChange} required />
        <Field label="Celular" name="phone" value={form.phone} onChange={handleChange} required />
        <Field label="Trabajo" name="jobName" value={form.jobName} onChange={handleChange} required />
        <Field label="Ingreso mensual" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} type="number" required />
        <Field label="Límite retiro diario" name="dailyWithdrawalLimit" value={form.dailyWithdrawalLimit} onChange={handleChange} type="number" />
        <Field label="Interés anual (%)" name="annualInterestRate" value={form.annualInterestRate} onChange={handleChange} type="number" />
      </div>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
};

const AdminUserForm = ({ mode, initialData, saving, onCancel, onSubmit }) => {
  const [form, setForm] = useState(() => (
    mode === 'create'
      ? adminInitialForm
      : {
        name: initialData?.name || '',
        username: initialData?.username || '',
        email: initialData?.email || '',
        password: '',
        phone: initialData?.phone || '',
        roleName: initialData?.role || 'MANAGER_ROLE',
      }
  ));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const error = validateAdminForm(form, mode);
    if (error) {
      toast.error(error);
      return;
    }

    onSubmit(buildAdminPayload(form, mode));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="name" value={form.name} onChange={handleChange} required />
        <Field label="Usuario" name="username" value={form.username} onChange={handleChange} required />
        <Field label="Correo" name="email" value={form.email} onChange={handleChange} type="email" required />
        {mode === 'create' && <Field label="Contraseña" name="password" value={form.password} onChange={handleChange} type="password" required />}
        <Field label="Teléfono" name="phone" value={form.phone} onChange={handleChange} required />
        <Field label="Rol administrativo" name="roleName" value={form.roleName} onChange={handleChange} options={ADMIN_ROLES} required />
      </div>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
};

const FormActions = ({ saving, onCancel }) => (
  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
    <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f5f5f5]">
      Cancelar
    </button>
    <button type="submit" disabled={saving} className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-70">
      {saving ? 'Guardando...' : 'Guardar'}
    </button>
  </div>
);

const ClientDetailModal = ({ account, onClose }) => {
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(true);

  useEffect(() => {
    let active = true;
    getTransactions({ limit: 100, status: 'all' })
      .then(({ transactions }) => {
        if (!active) return;
        setMovements((transactions || [])
          .filter((transaction) => (
            transaction.sourceAccountNumber === account.accountNumber
            || transaction.destinationAccountNumber === account.accountNumber
            || transaction.accountNumber === account.accountNumber
          ))
          .slice(0, 5));
      })
      .catch(() => {
        if (active) setMovements([]);
      })
      .finally(() => {
        if (active) setLoadingMovements(false);
      });

    return () => {
      active = false;
    };
  }, [account.accountNumber]);

  return (
  <Modal title="Detalle de cuenta de cliente" onClose={onClose} size="max-w-3xl">
    <div className="space-y-5 bg-[#f5f5f5] p-5">
      <div className="rounded-lg bg-[#1e3a5f] p-5 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-blue-100">Cuenta bancaria</p>
            <h2 className="mt-1 text-2xl font-bold">{account.accountNumber}</h2>
            <p className="mt-2 text-sm capitalize text-blue-100">{account.accountType} · {account.currencyCode}</p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[account.status] || statusStyles.inactiva}`}>{account.status}</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <DetailItem label="Saldo" value={formatMoney(account.balance, account.currencyCode)} />
          <DetailItem label="Ingreso mensual" value={formatMoney(account.monthlyIncome, account.currencyCode)} />
          <DetailItem label="Apertura" value={formatDate(account.openingDate)} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Titular" value={account.name} />
        <DetailItem label="Username" value={account.username} />
        <DetailItem label="DPI" value={account.dpi} />
        <DetailItem label="ID usuario" value={account.userId} />
        <DetailItem label="Dirección" value={account.address} />
        <DetailItem label="Celular" value={account.phone} />
        <DetailItem label="Trabajo" value={account.jobName} />
        <DetailItem label="Límite diario" value={account.dailyWithdrawalLimit ?? 'No definido'} />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-semibold text-[#1e3a5f]">Últimos 5 movimientos</h3>
        {loadingMovements ? (
          <p className="mt-3 text-sm text-slate-500">Cargando movimientos...</p>
        ) : movements.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No hay movimientos recientes.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {movements.map((movement) => (
              <div key={movement._id || movement.id} className="flex flex-col gap-1 rounded-md bg-[#f5f5f5] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{movement.transactionType || 'movimiento'}</p>
                  <p className="text-xs text-slate-500">{movement.description || formatDate(movement.createdAt || movement.transactionDate)}</p>
                </div>
                <strong>{formatMoney(movement.amount, movement.currencyCode || account.currencyCode)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </Modal>
  );
};

const AdminDetailModal = ({ user, onClose }) => (
  <Modal title="Detalle de cuenta administrativa" onClose={onClose} size="max-w-2xl">
    <div className="space-y-4 bg-[#f5f5f5] p-5">
      <div className="rounded-lg bg-[#1e3a5f] p-5 text-white">
        <p className="text-sm text-blue-100">Usuario administrativo</p>
        <h2 className="mt-1 text-2xl font-bold">{user.name} {user.surname}</h2>
        <p className="mt-2 text-sm text-blue-100">{user.email}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="ID usuario" value={user.id} />
        <DetailItem label="Usuario" value={user.username} />
        <DetailItem label="Rol" value={roleLabels[user.role] || user.role} />
        <DetailItem label="Teléfono" value={user.phone} />
        <DetailItem label="Estado" value={user.status ? 'Activo' : 'Inactivo'} />
        <DetailItem label="Correo" value={user.isEmailVerified ? 'Verificado' : 'Pendiente'} />
      </div>
    </div>
  </Modal>
);

const StatusModal = ({ account, busy, onClose, onSelect }) => (
  <Modal title="Cambiar estado" onClose={onClose} size="max-w-lg">
    <div className="space-y-4 p-5">
      <div className="rounded-lg bg-[#f5f5f5] p-4">
        <p className="text-sm text-slate-500">Cuenta</p>
        <p className="mt-1 font-semibold text-[#1e3a5f]">{account.accountNumber}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-slate-500">Estado actual:</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[account.status] || statusStyles.inactiva}`}>{account.status}</span>
        </div>
      </div>
      <div className="grid gap-3">
        {ACCOUNT_STATUSES.map((status) => {
          const isCurrent = account.status === status.value;
          const needsZeroBalance = status.value === 'inactiva' && Number(account.balance || 0) > 0;
          return (
            <button key={status.value} type="button" disabled={busy || isCurrent || needsZeroBalance} onClick={() => onSelect(account, status.value)} className={`rounded-lg border p-4 text-left transition ${isCurrent ? 'border-[#0066cc] bg-blue-50' : 'border-slate-200 bg-white hover:border-[#0066cc] hover:bg-[#f5f5f5]'} disabled:cursor-not-allowed disabled:opacity-70`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{status.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{needsZeroBalance ? 'Para desactivar, la cuenta debe tener saldo 0.' : status.description}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status.value]}`}>{status.value}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </Modal>
);

const ClientCard = ({ account, busy, onView, onEdit, onDelete, onOpenStatus }) => (
  <article className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md accounts-data-card ${cardAccentStyles[account.status] || cardAccentStyles.inactiva}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-[#1e3a5f]">{account.accountNumber}</p>
        <p className="mt-1 text-sm capitalize text-slate-500">{account.accountType} · {account.currencyCode}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[account.status] || statusStyles.inactiva}`}>{account.status}</span>
    </div>
    <div className="mt-5 rounded-md bg-[#f5f5f5] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo disponible</p>
      <p className="mt-1 text-2xl font-bold text-[#1e3a5f]">{formatMoney(account.balance, account.currencyCode)}</p>
    </div>
    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
      <DetailMini label="Titular" value={account.name} />
      <DetailMini label="DPI" value={account.dpi} />
      <DetailMini label="Celular" value={account.phone} />
      <DetailMini label="Apertura" value={formatDate(account.openingDate)} />
    </div>
    <CardActions
      busy={busy}
      onView={() => onView(account)}
      onEdit={() => onEdit(account)}
      onStatus={() => onOpenStatus(account)}
      onDelete={() => onDelete(account)}
      statusLabel="Cambiar estado"
    />
  </article>
);

const AdminUserCard = ({ user, busy, onView, onEdit, onDelete, onToggleStatus }) => (
  <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md accounts-data-card">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-[#1e3a5f]">{user.name} {user.surname}</p>
        <p className="mt-1 text-sm text-slate-500">{user.email}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${userStatusStyles[String(Boolean(user.status))]}`}>{user.status ? 'Activo' : 'Inactivo'}</span>
    </div>
    <div className="mt-5 rounded-md bg-[#f5f5f5] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rol administrativo</p>
      <p className="mt-1 text-2xl font-bold text-[#1e3a5f]">{roleLabels[user.role] || user.role}</p>
    </div>
    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
      <DetailMini label="ID" value={user.id} />
      <DetailMini label="Usuario" value={user.username} />
      <DetailMini label="Teléfono" value={user.phone} />
      <DetailMini label="Correo" value={user.isEmailVerified ? 'Verificado' : 'Pendiente'} />
    </div>
    <CardActions
      busy={busy}
      onView={() => onView(user)}
      onEdit={() => onEdit(user)}
      onStatus={() => onToggleStatus(user)}
      onDelete={() => onDelete(user)}
      statusLabel={user.status ? 'Desactivar' : 'Activar'}
    />
  </article>
);

const DetailMini = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 truncate font-medium text-slate-900">{value || 'No definido'}</p>
  </div>
);

const CardActions = ({ busy, onView, onEdit, onStatus, onDelete, statusLabel }) => (
  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 sm:flex sm:flex-wrap accounts-card-actions">
    <button type="button" onClick={onView} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc]"><Eye size={14} /> Ver</button>
    <button type="button" onClick={onEdit} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc]"><Pencil size={14} /> Editar</button>
    <button type="button" disabled={busy} onClick={onStatus} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc] disabled:opacity-60"><RotateCcw size={14} /> {busy ? 'Actualizando...' : statusLabel}</button>
    <button type="button" onClick={onDelete} className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 danger"><Trash2 size={14} /> Eliminar</button>
  </div>
);

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clientAccounts, setClientAccounts] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [searchDpi, setSearchDpi] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [adminRoleFilter, setAdminRoleFilter] = useState('todos');
  const [rankingOrder, setRankingOrder] = useState('desc');
  const [clientPage, setClientPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [modal, setModal] = useState({ type: '', entity: null });
  const [createdAccess, setCreatedAccess] = useState(null);

  const loadClientAccounts = async () => {
    const data = await getAllAccounts();
    setClientAccounts(Array.isArray(data) ? data : []);
  };

  const loadTransactionRankingData = async () => {
    const response = await getTransactions({ limit: 200, status: 'all' });
    setAllTransactions(Array.isArray(response.transactions) ? response.transactions : []);
  };

  const loadAdminUsers = async () => {
    const results = await Promise.all(ADMIN_ROLES.map(async (role) => ({
      role,
      response: await authService.getUsersByRole(role),
    })));
    const users = results.flatMap(({ role, response }) => (
      (response.data || response || []).map((user) => ({
        ...user,
        role: ADMIN_ROLES.includes(user.role) ? user.role : role,
      }))
    ));
    const uniqueUsers = [...new Map(users.map((user) => [user.id, user])).values()]
      .filter((user) => ADMIN_ROLES.includes(user.role));
    setAdminUsers(uniqueUsers);
  };

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [accountsData, transactionData, ...userResponses] = await Promise.all([
          getAllAccounts(),
          getTransactions({ limit: 200, status: 'all' }).catch(() => ({ transactions: [] })),
          ...ADMIN_ROLES.map(async (role) => ({
            role,
            response: await authService.getUsersByRole(role),
          })),
        ]);

        if (!active) return;

        const users = userResponses.flatMap(({ role, response }) => (
          (response.data || response || []).map((user) => ({
            ...user,
            role: ADMIN_ROLES.includes(user.role) ? user.role : role,
          }))
        ));
        const uniqueUsers = [...new Map(users.map((user) => [user.id, user])).values()]
          .filter((user) => ADMIN_ROLES.includes(user.role));
        setClientAccounts(Array.isArray(accountsData) ? accountsData : []);
        setAllTransactions(Array.isArray(transactionData.transactions) ? transactionData.transactions : []);
        setAdminUsers(uniqueUsers);
      } catch (error) {
        if (active) toast.error(error.response?.data?.message || error.message || 'Error al cargar información');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const filteredClients = useMemo(() => {
    const term = searchDpi.trim();
    return clientAccounts.filter((account) => {
      const matchesDpi = !term || String(account.dpi || '').includes(term);
      const matchesStatus = statusFilter === 'todas' || account.status === statusFilter;
      return matchesDpi && matchesStatus;
    });
  }, [clientAccounts, searchDpi, statusFilter]);

  const clientTotalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const filteredAdmins = useMemo(() => (
    adminUsers.filter((user) => adminRoleFilter === 'todos' || user.role === adminRoleFilter)
  ), [adminUsers, adminRoleFilter]);
  const adminTotalPages = Math.max(1, Math.ceil(filteredAdmins.length / PAGE_SIZE));
  const paginatedClients = filteredClients.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE);
  const paginatedAdmins = filteredAdmins.slice((adminPage - 1) * PAGE_SIZE, adminPage * PAGE_SIZE);

  const clientTotals = useMemo(() => ({
    count: clientAccounts.length,
    active: clientAccounts.filter((account) => account.status === 'activa').length,
    balance: clientAccounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
  }), [clientAccounts]);

  const movementRanking = useMemo(() => {
    const counts = allTransactions.reduce((accumulator, transaction) => {
      [transaction.sourceAccountNumber, transaction.destinationAccountNumber, transaction.accountNumber]
        .filter(Boolean)
        .forEach((accountNumber) => {
          accumulator[accountNumber] = (accumulator[accountNumber] || 0) + 1;
        });
      return accumulator;
    }, {});

    return clientAccounts
      .map((account) => ({
        account,
        count: counts[account.accountNumber] || 0,
      }))
      .sort((left, right) => (
        rankingOrder === 'asc'
          ? left.count - right.count
          : right.count - left.count
      ))
      .slice(0, 6);
  }, [allTransactions, clientAccounts, rankingOrder]);

  const adminTotals = useMemo(() => ({
    count: filteredAdmins.length,
    active: filteredAdmins.filter((user) => user.status).length,
  }), [filteredAdmins]);

  const closeModal = () => setModal({ type: '', entity: null });

  const handleCreateClient = async (payload) => {
    try {
      setSaving(true);
      const userResponse = await authService.createClientUser(payload.user);
      const createdUser = userResponse.data || userResponse.user || userResponse;
      await createAccount({
        ...payload.account,
        userId: createdUser.id || createdUser.Id,
      });
      setCreatedAccess({
        name: createdUser.name || createdUser.Name || payload.user.name,
        username: createdUser.username || createdUser.Username || payload.user.username,
        email: createdUser.email || createdUser.Email || payload.user.email,
        password: payload.user.password,
      });
      toast.success('Cuenta de cliente creada');
      closeModal();
      await loadClientAccounts();
      await loadTransactionRankingData().catch(() => {});
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo crear la cuenta');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateClient = async (payload) => {
    try {
      setSaving(true);
      await updateAccount(modal.entity.accountNumber, payload);
      toast.success('Cuenta actualizada');
      closeModal();
      await loadClientAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la cuenta');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (account) => {
    if (!window.confirm(`Eliminar la cuenta ${account.accountNumber}?`)) return;
    try {
      setBusyId(account.accountNumber);
      await deleteAccount(account.accountNumber);
      toast.success('Cuenta eliminada');
      await loadClientAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar la cuenta');
    } finally {
      setBusyId('');
    }
  };

  const handleAccountStatus = async (account, status) => {
    try {
      setBusyId(account.accountNumber);
      await changeAccountStatus(account.accountNumber, status);
      toast.success('Estado actualizado');
      closeModal();
      await loadClientAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar el estado');
    } finally {
      setBusyId('');
    }
  };

  const handleCreateAdmin = async (payload) => {
    try {
      setSaving(true);
      await authService.createAdministrativeUser(payload);
      toast.success('Cuenta administrativa creada');
      closeModal();
      await loadAdminUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAdmin = async (payload) => {
    if (modal.entity?.role === 'ADMIN_ROLE') {
      toast.error('Los administradores ADMIN_ROLE estan protegidos.');
      return;
    }
    try {
      setSaving(true);
      await authService.updateAdministrativeUser(modal.entity.id, payload);
      toast.success('Cuenta administrativa actualizada');
      closeModal();
      await loadAdminUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdminStatus = async (user) => {
    if (user.role === 'ADMIN_ROLE') {
      toast.error('Los administradores ADMIN_ROLE estan protegidos.');
      return;
    }
    try {
      setBusyId(user.id);
      await authService.changeAdministrativeUserStatus(user.id, !user.status);
      toast.success('Estado actualizado');
      await loadAdminUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo cambiar el estado');
    } finally {
      setBusyId('');
    }
  };

  const handleDeleteAdmin = async (user) => {
    if (user.role === 'ADMIN_ROLE') {
      toast.error('Los administradores ADMIN_ROLE estan protegidos.');
      return;
    }
    if (!window.confirm(`Eliminar la cuenta administrativa ${user.username}?`)) return;
    try {
      setBusyId(user.id);
      await authService.deleteAdministrativeUser(user.id);
      toast.success('Cuenta administrativa eliminada');
      await loadAdminUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo eliminar el usuario');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="accounts-command space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between accounts-hero-panel">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0066cc]">Control de cuentas</p>
          <AnimatedTitle className="mt-1 text-2xl font-bold text-[#1e3a5f] sm:text-3xl">Gestión de cuentas</AnimatedTitle>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Administra cuentas bancarias de clientes y cuentas administrativas del sistema desde una vista compacta de trabajo.</p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: activeTab === 'clients' ? 'createClient' : 'createAdmin', entity: null })}
          className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f]"
        >
          <Plus size={16} /> {activeTab === 'clients' ? 'Crear cliente' : 'Crear administrativo'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 accounts-segmented">
        <button type="button" onClick={() => setActiveTab('clients')} className={`rounded-md px-4 py-2 text-sm font-semibold transition ${activeTab === 'clients' ? 'bg-[#1e3a5f] text-white' : 'text-slate-700 hover:bg-[#f5f5f5]'}`}>
          <UsersRound size={16} /> Cuentas de clientes
        </button>
        <button type="button" onClick={() => setActiveTab('admins')} className={`rounded-md px-4 py-2 text-sm font-semibold transition ${activeTab === 'admins' ? 'bg-[#1e3a5f] text-white' : 'text-slate-700 hover:bg-[#f5f5f5]'}`}>
          <ShieldCheck size={16} /> Cuentas administrativas
        </button>
      </div>

      {activeTab === 'clients' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total clientes" value={clientTotals.count} />
            <StatCard label="Activas" value={clientTotals.active} />
            <StatCard label="Saldo general" value={formatMoney(clientTotals.balance)} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 accounts-work-panel">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1e3a5f]">Cuentas con más movimientos</p>
                <p className="text-sm text-slate-500">Transferencias, compras, créditos y depósitos registrados.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRankingOrder('desc')} className={`rounded-md px-3 py-2 text-sm font-semibold ${rankingOrder === 'desc' ? 'bg-[#1e3a5f] text-white' : 'border border-slate-300 text-slate-700'}`}><ArrowDownWideNarrow size={15} /> Desc</button>
                <button type="button" onClick={() => setRankingOrder('asc')} className={`rounded-md px-3 py-2 text-sm font-semibold ${rankingOrder === 'asc' ? 'bg-[#1e3a5f] text-white' : 'border border-slate-300 text-slate-700'}`}><ArrowUpWideNarrow size={15} /> Asc</button>
              </div>
            </div>
            <div className="grid gap-2 lg:grid-cols-3">
              {movementRanking.map(({ account, count }) => (
                <div key={account.accountNumber} className="rounded-md bg-[#f5f5f5] p-3 accounts-ranking-card">
                  <p className="font-semibold text-slate-900">{account.accountNumber}</p>
                  <p className="text-sm text-slate-500">{account.name}</p>
                  <p className="mt-1 text-sm font-semibold text-[#0066cc]">{count} movimiento(s)</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 accounts-toolbar">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700"><Search size={14} /> Buscar por DPI</span>
                <input
                  value={searchDpi}
                  onChange={(event) => {
                    setSearchDpi(event.target.value);
                    setClientPage(1);
                  }}
                  placeholder="Ingresa DPI de 13 dígitos"
                  className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(filter.value);
                      setClientPage(1);
                    }}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${statusFilter === filter.value ? 'bg-[#1e3a5f] text-white' : 'border border-slate-300 text-slate-700 hover:border-[#0066cc] hover:text-[#0066cc]'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingCard text="Cargando cuentas de clientes..." />
          ) : paginatedClients.length === 0 ? (
            <EmptyCard text="No hay cuentas de clientes para mostrar." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {paginatedClients.map((account) => (
                <ClientCard
                  key={account.accountNumber}
                  account={account}
                  busy={busyId === account.accountNumber}
                  onView={(entity) => setModal({ type: 'detailClient', entity })}
                  onEdit={(entity) => setModal({ type: 'editClient', entity })}
                  onDelete={handleDeleteClient}
                  onOpenStatus={(entity) => setModal({ type: 'statusClient', entity })}
                />
              ))}
            </div>
          )}
          <Pagination page={clientPage} totalPages={clientTotalPages} onPageChange={setClientPage} />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Total administrativas" value={adminTotals.count} />
            <StatCard label="Activas" value={adminTotals.active} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 accounts-toolbar">
            <p className="mb-3 text-sm font-medium text-slate-700"><ShieldCheck size={14} /> Filtrar por rol</p>
            <div className="flex flex-wrap gap-2">
              {ADMIN_ROLE_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setAdminRoleFilter(filter.value);
                    setAdminPage(1);
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${adminRoleFilter === filter.value ? 'bg-[#1e3a5f] text-white' : 'border border-slate-300 text-slate-700 hover:border-[#0066cc] hover:text-[#0066cc]'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingCard text="Cargando cuentas administrativas..." />
          ) : paginatedAdmins.length === 0 ? (
            <EmptyCard text="No hay cuentas administrativas para mostrar." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {paginatedAdmins.map((user) => (
                <AdminUserCard
                  key={user.id}
                  user={user}
                  busy={busyId === user.id}
                  onView={(entity) => setModal({ type: 'detailAdmin', entity })}
                  onEdit={(entity) => setModal({ type: 'editAdmin', entity })}
                  onDelete={handleDeleteAdmin}
                  onToggleStatus={handleToggleAdminStatus}
                />
              ))}
            </div>
          )}
          <Pagination page={adminPage} totalPages={adminTotalPages} onPageChange={setAdminPage} />
        </>
      )}

      {modal.type === 'createClient' && (
        <Modal title="Crear cuenta de cliente" onClose={closeModal}>
          <ClientAccountForm mode="create" saving={saving} onCancel={closeModal} onSubmit={handleCreateClient} />
        </Modal>
      )}
      {modal.type === 'editClient' && (
        <Modal title={`Editar ${modal.entity.accountNumber}`} onClose={closeModal}>
          <ClientAccountForm mode="edit" initialData={modal.entity} saving={saving} onCancel={closeModal} onSubmit={handleUpdateClient} />
        </Modal>
      )}
      {modal.type === 'detailClient' && <ClientDetailModal account={modal.entity} onClose={closeModal} />}
      {modal.type === 'statusClient' && <StatusModal account={modal.entity} busy={busyId === modal.entity.accountNumber} onClose={closeModal} onSelect={handleAccountStatus} />}
      {modal.type === 'createAdmin' && (
        <Modal title="Crear cuenta administrativa" onClose={closeModal}>
          <AdminUserForm mode="create" saving={saving} onCancel={closeModal} onSubmit={handleCreateAdmin} />
        </Modal>
      )}
      {modal.type === 'editAdmin' && (
        <Modal title={`Editar ${modal.entity.username}`} onClose={closeModal}>
          <AdminUserForm mode="edit" initialData={modal.entity} saving={saving} onCancel={closeModal} onSubmit={handleUpdateAdmin} />
        </Modal>
      )}
      {modal.type === 'detailAdmin' && <AdminDetailModal user={modal.entity} onClose={closeModal} />}
      {createdAccess && (
        <Modal title="Acceso del cliente creado" onClose={() => setCreatedAccess(null)} size="max-w-lg">
          <div className="space-y-4 bg-[#f5f5f5] p-5">
            <div className="rounded-lg bg-white p-4">
              <p className="text-sm text-slate-600">Entrega estos datos al cliente para que pueda iniciar sesión. La cuenta ya queda activa.</p>
            </div>
            <DetailItem label="Cliente" value={createdAccess.name} />
            <DetailItem label="Usuario" value={createdAccess.username} />
            <DetailItem label="Correo" value={createdAccess.email} />
            <DetailItem label="Contraseña temporal" value={createdAccess.password} />
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Recomienda al cliente cambiar su contraseña desde Perfil después del primer ingreso.
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-[#1e3a5f]">{value}</p>
  </div>
);

const LoadingCard = ({ text }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">{text}</div>
);

const EmptyCard = ({ text }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
    <p className="font-medium text-slate-800">{text}</p>
  </div>
);

export default Accounts;
