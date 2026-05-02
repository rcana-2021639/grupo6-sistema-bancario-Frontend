import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllAccounts } from '../../../features/accounts/services/accountService';
import { getRecentTransactions } from '../../../features/transactions/services/transactionService';
import { formatDate, formatMoney, StatCard, statusStyles } from './DashboardShared';

const AdminDashboard = ({ userName }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const accountData = await getAllAccounts();
        if (active) setAccounts(Array.isArray(accountData) ? accountData : []);

        try {
          const transactionData = await getRecentTransactions();
          if (active) setTransactions(Array.isArray(transactionData) ? transactionData : []);
        } catch {
          if (active) {
            setTransactions([]);
            setNotice('Las ultimas transacciones no estan disponibles para este rol.');
          }
        }
      } catch (error) {
        if (active) setNotice(error.message || 'No se pudo cargar la informacion del dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => ({
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter((account) => account.status === 'activa').length,
    totalBalance: accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
  }), [accounts]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#0066cc]">Dashboard admin</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1e3a5f] sm:text-3xl">Hola, {userName}</h1>
          <p className="mt-2 text-sm text-slate-600">Gestion operativa de cuentas, saldos y movimientos recientes.</p>
        </div>
        <Link to="/dashboard/accounts" className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f]">
          Gestionar cuentas
        </Link>
      </div>

      {notice && <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-[#1e3a5f]">{notice}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total de cuentas" value={loading ? '...' : totals.totalAccounts} detail={`${totals.activeAccounts} activas`} />
        <StatCard label="Saldo general" value={loading ? '...' : formatMoney(totals.totalBalance)} detail="Suma de cuentas cargadas" />
        <StatCard label="Ultimas transacciones" value={loading ? '...' : transactions.length} detail="Movimientos recientes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-[#1e3a5f]">Cuentas recientes</h2>
            <Link to="/dashboard/accounts" className="text-sm font-semibold text-[#0066cc] hover:text-[#1e3a5f]">Ver todas</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <p className="p-5 text-sm text-slate-500">Cargando cuentas...</p>
            ) : accounts.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No hay cuentas registradas.</p>
            ) : (
              accounts.slice(0, 5).map((account) => (
                <div key={account.accountNumber} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-semibold text-[#1e3a5f]">{account.accountNumber}</p>
                    <p className="text-sm text-slate-500">{account.name} - {account.accountType}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[account.status] || statusStyles.inactiva}`}>
                      {account.status}
                    </span>
                    <span className="font-semibold text-slate-900">{formatMoney(account.balance, account.currencyCode)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white lg:col-span-2">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-[#1e3a5f]">Ultimas transacciones</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <p className="p-5 text-sm text-slate-500">Cargando transacciones...</p>
            ) : transactions.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">No hay transacciones recientes para mostrar.</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction._id || transaction.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium capitalize text-slate-900">{transaction.transactionType?.replace('_', ' ')}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(transaction.transactionDate || transaction.createdAt)}</p>
                    </div>
                    <p className="font-semibold text-[#1e3a5f]">{formatMoney(transaction.amount, transaction.currencyCode)}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{transaction.description || 'Sin descripcion'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
