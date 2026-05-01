import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  changeAccountStatus,
  createAccount,
  deleteAccount,
  getAllAccounts,
  updateAccount,
} from '../services/accountService';

const ACCOUNT_TYPES = ['ahorro', 'corriente', 'nomina'];
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

const createInitialForm = {
  accountType: 'ahorro',
  userId: '',
  dpi: '',
  address: '',
  phone: '',
  jobName: '',
  monthlyIncome: '',
  currencyCode: 'GTQ',
  dailyWithdrawalLimit: '',
  annualInterestRate: '',
};

const editableFields = [
  'accountType',
  'name',
  'address',
  'phone',
  'jobName',
  'monthlyIncome',
  'currencyCode',
  'dailyWithdrawalLimit',
  'annualInterestRate',
];

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

const buildCreatePayload = (form) => ({
  accountType: form.accountType,
  userId: form.userId.trim(),
  dpi: form.dpi.trim(),
  address: form.address.trim(),
  phone: form.phone.trim(),
  jobName: form.jobName.trim(),
  monthlyIncome: Number(form.monthlyIncome),
  currencyCode: form.currencyCode.trim().toUpperCase(),
  ...(form.dailyWithdrawalLimit !== '' && { dailyWithdrawalLimit: Number(form.dailyWithdrawalLimit) }),
  ...(form.annualInterestRate !== '' && { annualInterestRate: Number(form.annualInterestRate) }),
});

const buildUpdatePayload = (form) => (
  editableFields.reduce((payload, field) => {
    if (form[field] === undefined || form[field] === '') return payload;
    if (['monthlyIncome', 'dailyWithdrawalLimit', 'annualInterestRate'].includes(field)) {
      payload[field] = Number(form[field]);
      return payload;
    }
    payload[field] = field === 'currencyCode' ? form[field].trim().toUpperCase() : String(form[field]).trim();
    return payload;
  }, {})
);

const validateForm = (form, mode) => {
  const required = mode === 'create'
    ? ['accountType', 'userId', 'dpi', 'address', 'phone', 'jobName', 'monthlyIncome', 'currencyCode']
    : ['accountType', 'address', 'phone', 'jobName', 'monthlyIncome', 'currencyCode'];
  const missing = required.find((field) => !String(form[field] ?? '').trim());

  if (missing) return 'Completa todos los campos obligatorios.';
  if (mode === 'create' && !/^\d{13}$/.test(form.dpi)) return 'El DPI debe tener 13 digitos.';
  if (!/^\d{8}$/.test(form.phone)) return 'El celular debe tener 8 digitos.';
  if (!/^[A-Za-z]{3}$/.test(form.currencyCode)) return 'La moneda debe tener 3 letras, por ejemplo GTQ.';
  if (Number(form.monthlyIncome) < 0) return 'El ingreso mensual no puede ser negativo.';
  if (form.annualInterestRate !== '' && Number(form.annualInterestRate) > 100) {
    return 'El interes anual no puede exceder 100%.';
  }

  return '';
};

const Modal = ({ title, children, onClose, size = 'max-w-3xl' }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
    <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-xl ${size}`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-[#1e3a5f]">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]"
          aria-label="Cerrar modal"
        >
          x
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
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    ) : (
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100"
      />
    )}
  </label>
);

const AccountForm = ({ mode, initialData, onCancel, onSubmit, saving }) => {
  const [form, setForm] = useState(() => (
    mode === 'create'
      ? createInitialForm
      : editableFields.reduce((values, field) => ({ ...values, [field]: initialData?.[field] ?? '' }), {})
  ));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const error = validateForm(form, mode);
    if (error) {
      toast.error(error);
      return;
    }

    onSubmit(mode === 'create' ? buildCreatePayload(form) : buildUpdatePayload(form));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de cuenta" name="accountType" value={form.accountType} onChange={handleChange} options={ACCOUNT_TYPES} required />
        <Field label="Moneda" name="currencyCode" value={form.currencyCode} onChange={handleChange} required />
        {mode === 'create' && (
          <>
            <Field label="ID de usuario" name="userId" value={form.userId} onChange={handleChange} required />
            <Field label="DPI" name="dpi" value={form.dpi} onChange={handleChange} required />
          </>
        )}
        {mode === 'edit' && <Field label="Nombre del titular" name="name" value={form.name} onChange={handleChange} />}
        <Field label="Direccion" name="address" value={form.address} onChange={handleChange} required />
        <Field label="Celular" name="phone" value={form.phone} onChange={handleChange} required />
        <Field label="Trabajo" name="jobName" value={form.jobName} onChange={handleChange} required />
        <Field label="Ingreso mensual" name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} type="number" required />
        <Field label="Limite retiro diario" name="dailyWithdrawalLimit" value={form.dailyWithdrawalLimit} onChange={handleChange} type="number" />
        <Field label="Interes anual (%)" name="annualInterestRate" value={form.annualInterestRate} onChange={handleChange} type="number" />
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f5f5f5]">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-70">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-md border border-slate-200 bg-white p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-slate-900">{value || 'No definido'}</p>
  </div>
);

const DetailSection = ({ title, children }) => (
  <section>
    <h3 className="mb-3 text-sm font-semibold text-[#1e3a5f]">{title}</h3>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </section>
);

const DetailModal = ({ account, onClose }) => {
  const statusClass = statusStyles[account.status] || statusStyles.inactiva;

  return (
    <Modal title="Detalle de cuenta" onClose={onClose} size="max-w-3xl">
      <div className="space-y-5 bg-[#f5f5f5] p-5">
        <div className="rounded-lg bg-[#1e3a5f] p-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-blue-100">Cuenta bancaria</p>
              <h2 className="mt-1 text-2xl font-bold">{account.accountNumber}</h2>
              <p className="mt-2 text-sm capitalize text-blue-100">{account.accountType} · {account.currencyCode}</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass}`}>
              {account.status}
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-100">Saldo</p>
              <p className="mt-1 text-xl font-bold">{formatMoney(account.balance, account.currencyCode)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-100">Ingreso mensual</p>
              <p className="mt-1 text-xl font-bold">{formatMoney(account.monthlyIncome, account.currencyCode)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-100">Apertura</p>
              <p className="mt-1 text-base font-semibold">{formatDate(account.openingDate)}</p>
            </div>
          </div>
        </div>

        <DetailSection title="Titular">
          <DetailItem label="Nombre" value={account.name} />
          <DetailItem label="Username" value={account.username} />
          <DetailItem label="DPI" value={account.dpi} />
          <DetailItem label="ID usuario" value={account.userId} />
        </DetailSection>

        <DetailSection title="Contacto y trabajo">
          <DetailItem label="Direccion" value={account.address} />
          <DetailItem label="Celular" value={account.phone} />
          <DetailItem label="Trabajo" value={account.jobName} />
          <DetailItem label="Moneda" value={account.currencyCode} />
        </DetailSection>

        <DetailSection title="Configuracion financiera">
          <DetailItem label="Limite diario" value={account.dailyWithdrawalLimit ?? 'No definido'} />
          <DetailItem label="Interes anual" value={account.annualInterestRate !== undefined ? `${account.annualInterestRate}%` : 'No definido'} />
          <DetailItem label="Creada" value={formatDate(account.createdAt)} />
          <DetailItem label="Actualizada" value={formatDate(account.updatedAt)} />
        </DetailSection>
      </div>
    </Modal>
  );
};

const StatusModal = ({ account, busy, onClose, onSelect }) => (
  <Modal title="Cambiar estado" onClose={onClose} size="max-w-lg">
    <div className="space-y-4 p-5">
      <div className="rounded-lg bg-[#f5f5f5] p-4">
        <p className="text-sm text-slate-500">Cuenta</p>
        <p className="mt-1 font-semibold text-[#1e3a5f]">{account.accountNumber}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-slate-500">Estado actual:</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[account.status] || statusStyles.inactiva}`}>
            {account.status}
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {ACCOUNT_STATUSES.map((status) => {
          const isCurrent = account.status === status.value;
          const needsZeroBalance = status.value === 'inactiva' && Number(account.balance || 0) > 0;
          const disabled = busy || isCurrent || needsZeroBalance;
          return (
            <button
              key={status.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(account, status.value)}
              className={`rounded-lg border p-4 text-left transition ${
                isCurrent
                  ? 'border-[#0066cc] bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-[#0066cc] hover:bg-[#f5f5f5]'
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{status.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {needsZeroBalance ? 'Para desactivar, la cuenta debe tener saldo 0.' : status.description}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status.value]}`}>
                  {status.value}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f5f5f5]">
          Cancelar
        </button>
      </div>
    </div>
  </Modal>
);

const AccountActions = ({ account, onView, onEdit, onDelete, onOpenStatus, busy }) => (
  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
    <button type="button" onClick={() => onView(account)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc]">
      Ver detalle
    </button>
    <button type="button" onClick={() => onEdit(account)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc]">
      Editar
    </button>
    <button type="button" disabled={busy} onClick={() => onOpenStatus(account)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#0066cc] hover:text-[#0066cc] disabled:opacity-60">
      {busy ? 'Actualizando...' : 'Cambiar estado'}
    </button>
    <button type="button" onClick={() => onDelete(account)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50">
      Eliminar
    </button>
  </div>
);

const AccountCard = ({ account, busy, onView, onEdit, onDelete, onOpenStatus }) => (
  <article className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${cardAccentStyles[account.status] || cardAccentStyles.inactiva}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-[#1e3a5f]">{account.accountNumber}</p>
        <p className="mt-1 text-sm capitalize text-slate-500">{account.accountType} · {account.currencyCode}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[account.status] || statusStyles.inactiva}`}>
        {account.status}
      </span>
    </div>

    <div className="mt-5 rounded-md bg-[#f5f5f5] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo disponible</p>
      <p className="mt-1 text-2xl font-bold text-[#1e3a5f]">{formatMoney(account.balance, account.currencyCode)}</p>
    </div>

    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Titular</p>
        <p className="mt-1 truncate font-medium text-slate-900">{account.name || 'No definido'}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">DPI</p>
        <p className="mt-1 font-medium text-slate-900">{account.dpi || 'No definido'}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Celular</p>
        <p className="mt-1 font-medium text-slate-900">{account.phone || 'No definido'}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Apertura</p>
        <p className="mt-1 font-medium text-slate-900">{formatDate(account.openingDate)}</p>
      </div>
    </div>

    <div className="mt-5 border-t border-slate-200 pt-4">
      <AccountActions
        account={account}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onOpenStatus={onOpenStatus}
        busy={busy}
      />
    </div>
  </article>
);

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyAccount, setBusyAccount] = useState('');
  const [searchDpi, setSearchDpi] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [modal, setModal] = useState({ type: '', account: null });

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAllAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Error al cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getAllAccounts()
      .then((data) => {
        if (active) setAccounts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) toast.error(error.message || 'Error al cargar las cuentas');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredAccounts = useMemo(() => {
    const term = searchDpi.trim();
    return accounts.filter((account) => {
      const matchesDpi = !term || String(account.dpi || '').includes(term);
      const matchesStatus = statusFilter === 'todas' || account.status === statusFilter;
      return matchesDpi && matchesStatus;
    });
  }, [accounts, searchDpi, statusFilter]);

  const totals = useMemo(() => ({
    count: accounts.length,
    active: accounts.filter((account) => account.status === 'activa').length,
    inactive: accounts.filter((account) => account.status === 'inactiva').length,
    blocked: accounts.filter((account) => account.status === 'bloqueada').length,
    balance: accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
  }), [accounts]);

  const handleCreate = async (payload) => {
    try {
      setSaving(true);
      await createAccount(payload);
      toast.success('Cuenta creada exitosamente');
      setModal({ type: '', account: null });
      await loadAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo crear la cuenta');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setSaving(true);
      await updateAccount(modal.account.accountNumber, payload);
      toast.success('Cuenta actualizada');
      setModal({ type: '', account: null });
      await loadAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la cuenta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account) => {
    const confirmed = window.confirm(`Eliminar la cuenta ${account.accountNumber}? Esta accion no se puede deshacer.`);
    if (!confirmed) return;

    try {
      setBusyAccount(account.accountNumber);
      await deleteAccount(account.accountNumber);
      toast.success('Cuenta eliminada');
      await loadAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar la cuenta');
    } finally {
      setBusyAccount('');
    }
  };

  const handleToggleStatus = async (account, status) => {
    try {
      setBusyAccount(account.accountNumber);
      await changeAccountStatus(account.accountNumber, status);
      toast.success('Estado actualizado');
      setModal({ type: '', account: null });
      await loadAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar el estado');
    } finally {
      setBusyAccount('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0066cc]">Accounts</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f] sm:text-3xl">Gestion de cuentas</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            CRUD conectado al servicio de cuentas con busqueda por DPI y cambio de estado por PATCH.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: 'create', account: null })}
          className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f]"
        >
          Crear Cuenta
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total de cuentas</p>
          <p className="mt-2 text-3xl font-bold text-[#1e3a5f]">{totals.count}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Activas</p>
          <p className="mt-2 text-3xl font-bold text-[#1e3a5f]">{totals.active}</p>
          <p className="mt-1 text-xs text-slate-500">{totals.inactive} inactivas · {totals.blocked} bloqueadas</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 sm:col-span-2">
          <p className="text-sm text-slate-500">Saldo general</p>
          <p className="mt-2 text-2xl font-bold text-[#1e3a5f]">{formatMoney(totals.balance)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Buscar por DPI</span>
            <input
              value={searchDpi}
              onChange={(event) => setSearchDpi(event.target.value)}
              placeholder="Ingresa DPI de 13 digitos"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-[#0066cc] focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  statusFilter === filter.value
                    ? 'bg-[#1e3a5f] text-white'
                    : 'border border-slate-300 text-slate-700 hover:border-[#0066cc] hover:text-[#0066cc]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">Cargando cuentas...</div>
      ) : filteredAccounts.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="font-medium text-slate-800">No hay cuentas para mostrar.</p>
          <p className="mt-1 text-sm text-slate-500">Crea una cuenta o ajusta los filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.accountNumber}
              account={account}
              busy={busyAccount === account.accountNumber}
              onView={(selected) => setModal({ type: 'detail', account: selected })}
              onEdit={(selected) => setModal({ type: 'edit', account: selected })}
              onDelete={handleDelete}
              onOpenStatus={(selected) => setModal({ type: 'status', account: selected })}
            />
          ))}
        </div>
      )}

      {modal.type === 'create' && (
        <Modal title="Crear cuenta" onClose={() => setModal({ type: '', account: null })}>
          <AccountForm mode="create" saving={saving} onCancel={() => setModal({ type: '', account: null })} onSubmit={handleCreate} />
        </Modal>
      )}

      {modal.type === 'edit' && (
        <Modal title={`Editar ${modal.account.accountNumber}`} onClose={() => setModal({ type: '', account: null })}>
          <AccountForm mode="edit" initialData={modal.account} saving={saving} onCancel={() => setModal({ type: '', account: null })} onSubmit={handleUpdate} />
        </Modal>
      )}

      {modal.type === 'detail' && (
        <DetailModal account={modal.account} onClose={() => setModal({ type: '', account: null })} />
      )}

      {modal.type === 'status' && (
        <StatusModal
          account={modal.account}
          busy={busyAccount === modal.account.accountNumber}
          onClose={() => setModal({ type: '', account: null })}
          onSelect={handleToggleStatus}
        />
      )}
    </section>
  );
};

export default Accounts;
