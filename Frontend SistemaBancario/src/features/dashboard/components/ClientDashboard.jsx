import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeDollarSign, CreditCard, FileText, Gem, Landmark, LockKeyhole, Send, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
import { getMyAccounts } from '../../../features/accounts/services/accountService';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { formatCompactMoney, formatDate, getMoneyTitle, roleLabels, statusStyles } from './DashboardShared';

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const ActionCard = ({ icon: Icon, title, description, allowed, path, action, disabledReason }) => (
  <motion.article variants={fade} whileHover={{ y: -5 }} className="lumina-card client-service-card">
    <div className="client-service-head">
      <div className="lumina-action-icon"><Icon size={22} /></div>
      <span className={`client-service-status ${allowed ? 'is-ready' : 'is-locked'}`}>
        {allowed ? 'Disponible' : 'Pendiente'}
      </span>
    </div>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
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
    <strong title={getMoneyTitle(account.balance, account.currencyCode)}>{formatCompactMoney(account.balance, account.currencyCode)}</strong>
    <p>{account.accountNumber}</p>
    <div className="lumina-account-meta">
      <span>{account.accountType} / {account.currencyCode}</span>
      <span>{account.name || userName}</span>
      <span>Apertura {formatDate(account.openingDate)}</span>
      <span>DPI {account.dpi || 'No definido'}</span>
    </div>
  </motion.article>
);

const ClientStat = ({ icon: Icon, label, value, detail }) => (
  <motion.div variants={fade} whileHover={{ y: -4 }} className="lumina-stat client-stat-card">
    <div className="client-stat-icon"><Icon size={22} /></div>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{detail}</small>
  </motion.div>
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
  }), [accounts]);

  const wealthByCurrency = useMemo(() => {
    const totals = accounts.reduce((summary, account) => {
      const currency = account.currencyCode || 'GTQ';
      return {
        ...summary,
        [currency]: (summary[currency] || 0) + Number(account.balance || 0),
      };
    }, {});

    return Object.entries(totals)
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }, [accounts]);

  const wealthTitle = wealthByCurrency
    .map(({ amount, currency }) => getMoneyTitle(amount, currency))
    .join(' / ');

  const hasAccount = accountSummary.total > 0;
  const hasActiveAccount = accountSummary.active > 0;
  const accountRequiredMessage = 'Necesitas una cuenta bancaria real creada por personal autorizado.';

  const allowedActions = [
    {
      icon: Send,
      title: 'Operaciones',
      description: 'Transferencias desde un panel de operaciones privado.',
      allowed: hasActiveAccount,
      path: '/dashboard/transactions',
      action: 'Operar',
      disabledReason: hasAccount ? 'Tu cuenta debe estar activa para operar.' : accountRequiredMessage,
    },
    {
      icon: FileText,
      title: 'Estados de cuenta',
      description: 'Consulta estados y movimientos vinculados a tus cuentas Lumina.',
      allowed: hasAccount,
      path: '/dashboard/statements',
      action: 'Ver estados',
      disabledReason: accountRequiredMessage,
    },
    {
      icon: BadgeDollarSign,
      title: 'Créditos',
      description: 'Solicita préstamos y revisa cronogramas con una lectura financiera clara.',
      allowed: hasActiveAccount,
      path: '/dashboard/loans',
      action: 'Explorar credito',
      disabledReason: hasAccount ? 'Tu cuenta debe estar activa para solicitar productos.' : accountRequiredMessage,
    },
  ];

  return (
    <motion.section className="lumina-page" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fade} className="lumina-page-hero client-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Panel de cliente privado</p>
            <AnimatedTitle className="lumina-title">Bienvenido, {userName}</AnimatedTitle>
            <p className="lumina-copy">
              Tu consola de banca privada: patrimonio, movimientos, tarjetas y productos con controles claros para operar con confianza.
            </p>
            <div className="lumina-hero-actions">
              <Link to="/dashboard/transactions" className="lumina-button"><Send size={16} /> Nueva operación</Link>
              <Link to="/dashboard/profile" className="lumina-button secondary"><ShieldCheck size={16} /> Identidad</Link>
            </div>
          </div>
          <div className="client-wealth-stack">
            <div className="lumina-wealth-card lumina-float client-wealth-card">
              <span>Patrimonio disponible</span>
              {loadingAccounts ? (
                <strong>...</strong>
              ) : wealthByCurrency.length <= 1 ? (
                <strong title={wealthTitle || getMoneyTitle(0, 'GTQ')}>
                  {formatCompactMoney(wealthByCurrency[0]?.amount || 0, wealthByCurrency[0]?.currency || 'GTQ')}
                </strong>
              ) : (
                <div className="client-wealth-breakdown" title={wealthTitle}>
                  {wealthByCurrency.map(({ amount, currency }) => (
                    <strong key={currency}>{formatCompactMoney(amount, currency)}</strong>
                  ))}
                </div>
              )}
              <p>{accountSummary.active} cuentas activas / {roleLabels[role] || role}</p>
            </div>
            <div className="client-hero-strip">
              <span><ShieldCheck size={15} /> Sesión protegida</span>
              <span><TrendingUp size={15} /> Vista ejecutiva</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fade} className="lumina-grid-3">
        <ClientStat icon={WalletCards} label="Cuentas privadas" value={loadingAccounts ? '...' : accountSummary.total} detail={`${accountSummary.active} activas`} />
        <ClientStat icon={Landmark} label="Estado operativo" value={loadingAccounts ? '...' : hasActiveAccount ? 'Elite' : 'Pendiente'} detail={hasActiveAccount ? 'Cuenta activa disponible' : 'Sin cuenta activa'} />
        <ClientStat icon={Gem} label="Nivel Lumina" value="Gold" detail="Sesión privada activa" />
      </motion.div>

      {accountsNotice && <motion.div variants={fade} className="lumina-panel">{accountsNotice}</motion.div>}

      <motion.div variants={fade} className="lumina-section-head">
        <div>
          <p className="lumina-kicker">Portafolio</p>
          <h2>Tus cuentas Lumina</h2>
        </div>
        <Link to="/dashboard/cards" className="lumina-button secondary"><CreditCard size={16} /> Tarjetas</Link>
      </motion.div>

      {loadingAccounts ? (
        <div className="lumina-empty">Cargando tus cuentas privadas...</div>
      ) : accounts.length === 0 ? (
        <motion.div variants={fade} className="lumina-panel">
          <h2>Aún no tienes una cuenta bancaria asignada</h2>
          <p>Tu usuario existe, pero todavía no hay una cuenta real vinculada. Un administrador, gerente o cajero debe crearla desde el módulo de cuentas.</p>
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
          <p className="lumina-kicker">Accesos</p>
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
          personal autorizado debe crearla desde el módulo de cuentas.
        </p>
      </motion.div>
    </motion.section>
  );
};

export default ClientDashboard;
