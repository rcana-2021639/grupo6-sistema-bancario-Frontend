import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Landmark, RefreshCw, ShieldCheck } from 'lucide-react';
import { getMyAccounts } from '../../accounts/services/accountService';

const formatMoney = (value, currency = 'GTQ') => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
);

const Statements = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    getMyAccounts()
      .then((data) => {
        if (active) setAccounts(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (active) setNotice(error.message || 'No se pudieron cargar tus estados.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => ({
    total: accounts.length,
    balance: accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0),
    active: accounts.filter((account) => account.status === 'activa').length,
  }), [accounts]);

  return (
    <motion.section className="lumina-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Statements vault</p>
            <h1 className="lumina-title">Estados de cuenta</h1>
            <p className="lumina-copy">Una lectura privada de tus cuentas vinculadas, saldos y estado operativo.</p>
          </div>
          <div className="lumina-wealth-card">
            <span>Balance consolidado</span>
            <strong>{loading ? '...' : formatMoney(summary.balance)}</strong>
            <p>{summary.active} cuentas activas</p>
          </div>
        </div>
      </div>

      {notice && <div className="lumina-panel">{notice}</div>}

      <div className="lumina-grid-3">
        <div className="lumina-stat"><FileText size={22} /><span>Estados</span><strong>{loading ? '...' : summary.total}</strong><small>Cuentas vinculadas</small></div>
        <div className="lumina-stat"><Landmark size={22} /><span>Activas</span><strong>{loading ? '...' : summary.active}</strong><small>Disponibles para operar</small></div>
        <div className="lumina-stat"><ShieldCheck size={22} /><span>Custodia</span><strong>Privada</strong><small>Acceso Lumina</small></div>
      </div>

      <div className="lumina-panel">
        <div className="lumina-section-head">
          <div>
            <p className="lumina-kicker">Accounts</p>
            <h2>Listado de estados</h2>
          </div>
          <span className="lumina-badge"><RefreshCw size={14} /> Actualizado</span>
        </div>

        {loading ? (
          <div className="lumina-empty">Cargando estados...</div>
        ) : accounts.length === 0 ? (
          <div className="lumina-empty">Aun no hay cuentas vinculadas para generar estados.</div>
        ) : (
          <div className="lumina-list">
            {accounts.map((account) => (
              <article key={account.accountNumber} className="lumina-list-item statement-row">
                <div>
                  <strong>{account.accountNumber}</strong>
                  <p>{account.accountType} / {account.currencyCode}</p>
                </div>
                <span className="lumina-badge">{account.status}</span>
                <strong>{formatMoney(account.balance, account.currencyCode)}</strong>
              </article>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default Statements;
