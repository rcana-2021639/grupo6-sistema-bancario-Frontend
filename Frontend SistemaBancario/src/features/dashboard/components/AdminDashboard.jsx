import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Banknote, Landmark, ListChecks, ShieldCheck, UsersRound } from 'lucide-react';
import { getAllAccounts } from '../../../features/accounts/services/accountService';
import { getRecentTransactions } from '../../../features/transactions/services/transactionService';
import { formatDate, formatMoney, statusStyles } from './DashboardShared';

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

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
    <motion.section className="lumina-page lumina-admin-mode" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
      <motion.div variants={fade} className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Administrative command</p>
            <h1 className="lumina-title">Centro ejecutivo, {userName}</h1>
            <p className="lumina-copy">Gestion operativa de cuentas, saldos, accesos administrativos y actividad reciente.</p>
            <div className="lumina-hero-actions">
              <Link to="/dashboard/accounts" className="lumina-button"><Landmark size={16} /> Gestionar cuentas</Link>
              <Link to="/dashboard/transactions" className="lumina-button secondary"><ListChecks size={16} /> Ver operaciones</Link>
            </div>
          </div>
          <div className="lumina-wealth-card">
            <span>Saldo bajo administracion</span>
            <strong>{loading ? '...' : formatMoney(totals.totalBalance)}</strong>
            <p>{totals.activeAccounts} cuentas activas bajo supervision</p>
          </div>
        </div>
      </motion.div>

      {notice && <motion.div variants={fade} className="lumina-panel">{notice}</motion.div>}

      <motion.div variants={fade} className="lumina-grid-3">
        <div className="lumina-stat"><UsersRound size={22} /><span>Total de cuentas</span><strong>{loading ? '...' : totals.totalAccounts}</strong><small>{totals.activeAccounts} activas</small></div>
        <div className="lumina-stat"><Banknote size={22} /><span>Saldo general</span><strong>{loading ? '...' : formatMoney(totals.totalBalance)}</strong><small>Suma de cuentas cargadas</small></div>
        <div className="lumina-stat"><ShieldCheck size={22} /><span>Transacciones</span><strong>{loading ? '...' : transactions.length}</strong><small>Movimientos recientes</small></div>
      </motion.div>

      <div className="admin-command-grid">
        <motion.div variants={fade} className="lumina-panel">
          <div className="lumina-section-head">
            <div>
              <p className="lumina-kicker">Registry</p>
              <h2>Cuentas recientes</h2>
            </div>
            <Link to="/dashboard/accounts" className="lumina-button secondary">Ver todas <ArrowRight size={16} /></Link>
          </div>
          <div className="lumina-list">
            {loading ? (
              <div className="lumina-empty">Cargando cuentas...</div>
            ) : accounts.length === 0 ? (
              <div className="lumina-empty">No hay cuentas registradas.</div>
            ) : (
              accounts.slice(0, 6).map((account) => (
                <article key={account.accountNumber} className="lumina-list-item admin-row">
                  <div>
                    <strong>{account.accountNumber}</strong>
                    <p>{account.name} / {account.accountType}</p>
                  </div>
                  <span className={`lumina-status ${statusStyles[account.status] || statusStyles.inactiva}`}>{account.status}</span>
                  <strong>{formatMoney(account.balance, account.currencyCode)}</strong>
                </article>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={fade} className="lumina-panel">
          <div className="lumina-section-head">
            <div>
              <p className="lumina-kicker">Activity</p>
              <h2>Ultimas transacciones</h2>
            </div>
          </div>
          <div className="lumina-list">
            {loading ? (
              <div className="lumina-empty">Cargando transacciones...</div>
            ) : transactions.length === 0 ? (
              <div className="lumina-empty">No hay transacciones recientes.</div>
            ) : (
              transactions.slice(0, 6).map((transaction) => (
                <article key={transaction._id || transaction.id} className="lumina-list-item">
                  <div className="admin-transaction-row">
                    <div>
                      <strong>{transaction.transactionType?.replace('_', ' ') || 'Movimiento'}</strong>
                      <p>{formatDate(transaction.transactionDate || transaction.createdAt)}</p>
                    </div>
                    <strong>{formatMoney(transaction.amount, transaction.currencyCode)}</strong>
                  </div>
                  <p>{transaction.description || 'Sin descripcion'}</p>
                </article>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AdminDashboard;
