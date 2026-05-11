import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeDollarSign, CreditCard, FileText, Gem, Landmark, LockKeyhole, Send, ShieldCheck, WalletCards } from 'lucide-react';
import { getMyAccounts } from '../../../features/accounts/services/accountService';
import { formatDate, formatMoney, roleLabels, statusStyles } from './DashboardShared';

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const ActionCard = ({ icon: Icon, title, description, allowed, path, action, disabledReason }) => (
  <motion.article variants={fade} whileHover={{ y: -5 }} className="lumina-card">
    <div className="lumina-action-icon"><Icon size={22} /></div>
    <h3>{title}</h3>
    <p>{description}</p>
    {!allowed && disabledReason && <p className="lumina-warning">{disabledReason}</p>}
    {allowed && path ? (
      <Link to={path} className="lumina-button">
        {action} <ArrowRight size={16} />
      </Link>
    ) : (
      <span className="lumina-badge"><LockKeyhole size={14} /> Pendiente</span>
    )}
  </motion.article>
);

const AccountCard = ({ account, userName }) => (
  <motion.article variants={fade} whileHover={{ y: -6, rotateX: 1 }} className="lumina-account-card">
    <div className="lumina-account-top">
      <span>Lumina Reserve</span>
      <span className={`lumina-status ${statusStyles[account.status] || statusStyles.inactiva}`}>{account.status}</span>
    </div>
    <strong>{formatMoney(account.balance, account.currencyCode)}</strong>
    <p>{account.accountNumber}</p>
    <div className="lumina-account-meta">
      <span>{account.accountType} / {account.currencyCode}</span>
      <span>{account.name || userName}</span>
      <span>Apertura {formatDate(account.openingDate)}</span>
      <span>DPI {account.dpi || 'No definido'}</span>
    </div>
  </motion.article>
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
  const accountRequiredMessage = 'Necesitas una cuenta bancaria real creada por personal autorizado.';

  const allowedActions = [
    {
      icon: Send,
      title: 'Capital Moves',
      description: 'Transferencias, depositos y retiros desde un panel de operaciones privado.',
      allowed: hasActiveAccount,
      path: '/dashboard/transactions',
      action: 'Operar',
      disabledReason: hasAccount ? 'Tu cuenta debe estar activa para operar.' : accountRequiredMessage,
    },
    {
      icon: FileText,
      title: 'Statements Vault',
      description: 'Consulta estados y movimientos vinculados a tus cuentas Lumina.',
      allowed: hasAccount,
      path: '/dashboard/statements',
      action: 'Ver estados',
      disabledReason: accountRequiredMessage,
    },
    {
      icon: BadgeDollarSign,
      title: 'Credit Atelier',
      description: 'Solicita prestamos y revisa cronogramas con una lectura financiera clara.',
      allowed: hasActiveAccount,
      path: '/dashboard/loans',
      action: 'Explorar credito',
      disabledReason: hasAccount ? 'Tu cuenta debe estar activa para solicitar productos.' : accountRequiredMessage,
    },
  ];

  return (
    <motion.section className="lumina-page" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fade} className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Private client dashboard</p>
            <h1 className="lumina-title">Bienvenido, {userName}</h1>
            <p className="lumina-copy">
              Tu consola de banca privada: patrimonio, movimientos y productos en un ambiente seguro, elegante y vivo.
            </p>
            <div className="lumina-hero-actions">
              <Link to="/dashboard/transactions" className="lumina-button"><Send size={16} /> Nueva operacion</Link>
              <Link to="/dashboard/profile" className="lumina-button secondary"><ShieldCheck size={16} /> Identidad</Link>
            </div>
          </div>
          <div className="lumina-wealth-card lumina-float">
            <span>Patrimonio disponible</span>
            <strong>{loadingAccounts ? '...' : formatMoney(accountSummary.balance)}</strong>
            <p>{accountSummary.active} cuentas activas / {roleLabels[role] || role}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fade} className="lumina-grid-3">
        <div className="lumina-stat"><WalletCards size={22} /><span>Cuentas privadas</span><strong>{loadingAccounts ? '...' : accountSummary.total}</strong><small>{accountSummary.active} activas</small></div>
        <div className="lumina-stat"><Landmark size={22} /><span>Estado operativo</span><strong>{loadingAccounts ? '...' : hasActiveAccount ? 'Elite' : 'Pendiente'}</strong><small>{hasActiveAccount ? 'Cuenta activa disponible' : 'Sin cuenta activa'}</small></div>
        <div className="lumina-stat"><Gem size={22} /><span>Nivel Lumina</span><strong>Gold</strong><small>Sesion privada activa</small></div>
      </motion.div>

      {accountsNotice && <motion.div variants={fade} className="lumina-panel">{accountsNotice}</motion.div>}

      <motion.div variants={fade} className="lumina-section-head">
        <div>
          <p className="lumina-kicker">Portfolio</p>
          <h2>Tus cuentas Lumina</h2>
        </div>
        <Link to="/dashboard/cards" className="lumina-button secondary"><CreditCard size={16} /> Tarjetas</Link>
      </motion.div>

      {loadingAccounts ? (
        <div className="lumina-empty">Cargando tus cuentas privadas...</div>
      ) : accounts.length === 0 ? (
        <motion.div variants={fade} className="lumina-panel">
          <h2>Aun no tienes una cuenta bancaria asignada</h2>
          <p>Tu usuario existe, pero todavia no hay una cuenta real vinculada. Un administrador, gerente o cajero debe crearla desde Accounts.</p>
        </motion.div>
      ) : (
        <div className="lumina-account-grid">
          {accounts.map((account) => (
            <AccountCard key={account.accountNumber} account={account} userName={userName} />
          ))}
        </div>
      )}

      <motion.div variants={fade} className="lumina-section-head">
        <div>
          <p className="lumina-kicker">Access</p>
          <h2>Servicios privados</h2>
        </div>
      </motion.div>

      <div className="lumina-grid-3">
        {allowedActions.map((item) => (
          <ActionCard key={item.title} {...item} />
        ))}
      </div>

      <motion.div variants={fade} className="lumina-panel">
        <h2>Estado de acceso</h2>
        <p>
          Tu acceso operativo depende de tener una cuenta bancaria real vinculada y activa. Si aun no aparece,
          personal autorizado debe crearla desde el modulo de cuentas.
        </p>
      </motion.div>
    </motion.section>
  );
};

export default ClientDashboard;
