import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Banknote, CircleAlert, Gauge, Landmark, ListChecks, ShieldCheck, UsersRound } from 'lucide-react';
import { getAllAccounts } from '../../../features/accounts/services/accountService';
import { getRecentTransactions } from '../../../features/transactions/services/transactionService';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { formatCompactMoney, formatDate, getMoneyTitle, statusStyles } from './DashboardShared';

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
        if (active) setNotice(error.message || 'No se pudo cargar la información del dashboard.');
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
    blockedAccounts: accounts.filter((account) => account.status === 'bloqueada').length,
    inactiveAccounts: accounts.filter((account) => account.status === 'inactiva').length,
    totalBalance: accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
  }), [accounts]);

  return (
    <motion.section className="lumina-page lumina-admin-mode" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
      <motion.div variants={fade} className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Comando administrativo</p>
            <AnimatedTitle className="lumina-title">Mesa operativa, {userName}</AnimatedTitle>
            <p className="lumina-copy">Supervisión de cuentas, saldos, usuarios administrativos y actividad reciente con una lectura rápida para trabajo diario.</p>
            <div className="lumina-hero-actions">
              <Link to="/dashboard/accounts" className="lumina-button"><Landmark size={16} /> Gestionar cuentas</Link>
              <Link to="/dashboard/transactions" className="lumina-button secondary"><ListChecks size={16} /> Ver operaciones</Link>
            </div>
          </div>
          <div className="lumina-wealth-card admin-command-card">
            <span>Saldo bajo administración</span>
            <strong title={getMoneyTitle(totals.totalBalance)}>{loading ? '...' : formatCompactMoney(totals.totalBalance)}</strong>
            <p>{totals.activeAccounts} activas / {totals.blockedAccounts} bloqueadas / {totals.inactiveAccounts} inactivas</p>
          </div>
        </div>
      </motion.div>

      {notice && <motion.div variants={fade} className="lumina-panel">{notice}</motion.div>}

      <motion.div variants={fade} className="lumina-grid-4 admin-kpi-grid">
        <motion.div whileHover={{ y: -3 }} className="lumina-stat"><UsersRound size={22} /><span>Total cuentas</span><strong>{loading ? '...' : totals.totalAccounts}</strong><small>{totals.activeAccounts} activas</small></motion.div>
        <motion.div whileHover={{ y: -3 }} className="lumina-stat"><Banknote size={22} /><span>Saldo general</span><strong title={getMoneyTitle(totals.totalBalance)}>{loading ? '...' : formatCompactMoney(totals.totalBalance)}</strong><small>Suma de cuentas cargadas</small></motion.div>
        <motion.div whileHover={{ y: -3 }} className="lumina-stat"><ShieldCheck size={22} /><span>Transacciones</span><strong>{loading ? '...' : transactions.length}</strong><small>Movimientos recientes</small></motion.div>
        <motion.div whileHover={{ y: -3 }} className="lumina-stat"><CircleAlert size={22} /><span>Atención</span><strong>{loading ? '...' : totals.blockedAccounts}</strong><small>Cuentas bloqueadas</small></motion.div>
      </motion.div>

      <motion.div variants={fade} className="lumina-work-panel admin-work-strip">
        <div>
          <p className="lumina-kicker">Accesos rápidos</p>
          <h2>Trabajo administrativo</h2>
        </div>
        <div className="lumina-action-row">
          <Link to="/dashboard/accounts" className="lumina-button secondary"><UsersRound size={16} /> Clientes y staff</Link>
          <Link to="/dashboard/cards" className="lumina-button secondary"><Gauge size={16} /> Tarjetas</Link>
          <Link to="/dashboard/products" className="lumina-button secondary"><Banknote size={16} /> Productos</Link>
        </div>
      </motion.div>

      <div className="admin-command-grid">
        <motion.div variants={fade} className="lumina-panel">
          <div className="lumina-section-head">
            <div>
              <p className="lumina-kicker">Registro</p>
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
                  <strong title={getMoneyTitle(account.balance, account.currencyCode)}>{formatCompactMoney(account.balance, account.currencyCode)}</strong>
                </article>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={fade} className="lumina-panel">
          <div className="lumina-section-head">
            <div>
              <p className="lumina-kicker">Actividad</p>
              <h2>Últimas transacciones</h2>
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
                    <strong title={getMoneyTitle(transaction.amount, transaction.currencyCode)}>{formatCompactMoney(transaction.amount, transaction.currencyCode)}</strong>
                  </div>
                  <p>{transaction.description || 'Sin descripción'}</p>
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
