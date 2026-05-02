import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyAccounts } from '../../../features/accounts/services/accountService';
import { formatDate, formatMoney, roleLabels, StatCard, statusStyles } from './DashboardShared';

const PermissionCard = ({ title, description, allowed, path, action, disabledReason }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-[#1e3a5f]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        {!allowed && disabledReason && (
          <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-700">{disabledReason}</p>
        )}
      </div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        allowed ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}>
        {allowed ? 'Permitido' : 'Pendiente'}
      </span>
    </div>
    {allowed && path && (
      <Link to={path} className="mt-4 inline-flex rounded-md bg-[#0066cc] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f]">
        {action}
      </Link>
    )}
  </div>
);

const ClientDashboard = ({ user, userName }) => {
  const role = user?.role || 'USER_ROLE';
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsNotice, setAccountsNotice] = useState('');

  useEffect(() => {
    let active = true;

    getMyAccounts()
      .then((data) => {
        if (active) setAccounts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) setAccountsNotice(error.message || 'No se pudieron cargar tus cuentas.');
      })
      .finally(() => {
        if (active) setLoadingAccounts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const accountSummary = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter((account) => account.status === 'activa').length,
    balance: accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
  }), [accounts]);

  const hasAccount = accountSummary.total > 0;
  const hasActiveAccount = accountSummary.active > 0;
  const accountRequiredMessage = 'Necesitas una cuenta bancaria real creada por un administrador o cajero para usar esta funcion.';

  const allowedActions = [
    {
      title: 'Crear transacciones',
      description: 'Transferencias, depositos y pagos solo deben habilitarse cuando el usuario ya tiene una cuenta bancaria propia.',
      allowed: hasActiveAccount,
      path: '/dashboard/transactions',
      action: 'Ir a transacciones',
      disabledReason: hasAccount ? 'Tu cuenta debe estar activa para operar.' : accountRequiredMessage,
    },
    {
      title: 'Consultar tus movimientos',
      description: 'La consulta de movimientos se habilita cuando existe una cuenta vinculada a tu usuario.',
      allowed: hasAccount,
      path: '/dashboard/statements',
      action: 'Ver estados',
      disabledReason: accountRequiredMessage,
    },
    {
      title: 'Solicitar prestamos',
      description: 'Los prestamos deben asociarse a un cliente con cuenta bancaria existente.',
      allowed: hasActiveAccount,
      path: '/dashboard/loans',
      action: 'Ir a prestamos',
      disabledReason: hasAccount ? 'Tu cuenta debe estar activa para solicitar productos.' : accountRequiredMessage,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-lg bg-[#1e3a5f] p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Dashboard usuario</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Hola, {userName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
          Esta vista muestra tus cuentas reales si ya fueron creadas por personal autorizado. El registro de usuario no crea una cuenta bancaria automaticamente.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">
            {roleLabels[role] || role}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">
            Sesion activa
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Mis cuentas" value={loadingAccounts ? '...' : accountSummary.total} detail={`${accountSummary.active} activas`} />
        <StatCard label="Mi saldo total" value={loadingAccounts ? '...' : formatMoney(accountSummary.balance)} detail="Solo cuentas propias" />
        <StatCard label="Estado operativo" value={loadingAccounts ? '...' : hasActiveAccount ? 'Habilitado' : 'Pendiente'} detail={hasActiveAccount ? 'Cuenta activa disponible' : 'Sin cuenta activa'} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-[#1e3a5f]">Mis cuentas</h2>
          <p className="mt-1 text-sm text-slate-500">Cuentas bancarias vinculadas a tu usuario.</p>
        </div>
        {accountsNotice && (
          <div className="m-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{accountsNotice}</div>
        )}
        {loadingAccounts ? (
          <p className="p-5 text-sm text-slate-500">Cargando tus cuentas...</p>
        ) : accounts.length === 0 ? (
          <div className="p-5">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-800">Aun no tienes una cuenta bancaria asignada.</p>
              <p className="mt-2 text-sm leading-6 text-amber-700">
                Tu usuario existe, pero todavia no hay una cuenta real vinculada a tu `userId`. Un administrador, gerente o cajero debe crearla desde Accounts.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            {accounts.map((account) => (
              <article key={account.accountNumber} className="rounded-lg border border-slate-200 bg-[#f5f5f5] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1e3a5f]">{account.accountNumber}</p>
                    <p className="mt-1 text-sm capitalize text-slate-500">{account.accountType} - {account.currencyCode}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[account.status] || statusStyles.inactiva}`}>
                    {account.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo</p>
                    <p className="mt-1 text-xl font-bold text-[#1e3a5f]">{formatMoney(account.balance, account.currencyCode)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Apertura</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(account.openingDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Titular</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{account.name || userName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">DPI</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{account.dpi || 'No definido'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {allowedActions.map((item) => (
          <PermissionCard key={item.title} {...item} />
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-[#1e3a5f]">Estado de acceso</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Tu acceso operativo depende de tener una cuenta bancaria real vinculada y activa. Si aun no aparece, un administrador o cajero debe crearla desde el modulo de cuentas.
        </p>
      </div>
    </section>
  );
};

export default ClientDashboard;
