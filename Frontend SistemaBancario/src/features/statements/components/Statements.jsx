import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Landmark, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllAccounts, getMyAccounts, updateAccount } from '../../accounts/services/accountService';
import { useAuthStore } from '../../auth/store/authStore';
import { convertCurrency, getTransactions } from '../../transactions/services/transactionService';
import { getAccountStatements, requestAccountStatementPdf } from '../../dashboard/services/reportingService';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import { isAdministrativeRole } from '../../../shared/utils/roles';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('es-GT') : 'Sin periodo');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString('es-GT') : 'Sin fecha');

const Statements = () => {
  const { role, user } = useAuthStore();
  const isAdmin = isAdministrativeRole(role || user?.role);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [statements, setStatements] = useState([]);
  const [conversion, setConversion] = useState({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [editingAccount, setEditingAccount] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', address: '', jobName: '', monthlyIncome: '' });

  const loadAccounts = useCallback(async () => {
    const accountData = isAdmin ? await getAllAccounts() : await getMyAccounts();
    setAccounts(Array.isArray(accountData) ? accountData : []);
  }, [isAdmin]);

  const loadStatements = useCallback(async () => {
    const statementData = await getAccountStatements({ limit: 20 });
    setStatements(Array.isArray(statementData.statements) ? statementData.statements : []);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      (isAdmin ? getAllAccounts() : getMyAccounts()),
      getTransactions({ limit: 50, status: 'all' }).catch(() => ({ transactions: [] })),
      getAccountStatements({ limit: 20 }).catch(() => ({ statements: [] })),
    ])
      .then(([accountData, transactionData, statementData]) => {
        if (!active) return;
        setAccounts(Array.isArray(accountData) ? accountData : []);
        setTransactions(Array.isArray(transactionData.transactions) ? transactionData.transactions : []);
        setStatements(Array.isArray(statementData.statements) ? statementData.statements : []);
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
  }, [isAdmin]);

  const accountCurrencyById = useMemo(() => (
    new Map(accounts.map((account) => [String(account._id || account.id), account.currencyCode || 'GTQ']))
  ), [accounts]);

  const accountCurrencyByNumber = useMemo(() => (
    new Map(accounts.map((account) => [account.accountNumber, account.currencyCode || 'GTQ']))
  ), [accounts]);

  const summary = useMemo(() => {
    const balanceByCurrency = accounts.reduce((accumulator, account) => {
      const currency = account.currencyCode || 'GTQ';
      accumulator[currency] = (accumulator[currency] || 0) + Number(account.balance || 0);
      return accumulator;
    }, {});

    return {
      total: accounts.length,
      balanceByCurrency,
      active: accounts.filter((account) => account.status === 'activa').length,
    };
  }, [accounts]);

  const openEdit = (account) => {
    setEditingAccount(account);
    setEditForm({
      name: account.name || '',
      address: account.address || '',
      jobName: account.jobName || '',
      monthlyIncome: account.monthlyIncome ?? '',
    });
  };

  const saveAccount = async (event) => {
    event.preventDefault();
    try {
      await updateAccount(editingAccount.accountNumber, {
        name: editForm.name,
        address: editForm.address,
        jobName: editForm.jobName,
        monthlyIncome: Number(editForm.monthlyIncome),
      });
      toast.success('Cuenta actualizada');
      setEditingAccount(null);
      await loadAccounts();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la cuenta');
    }
  };

  const convertBalance = async (account, targetCurrency) => {
    try {
      const result = await convertCurrency({
        amount: account.balance,
        from: account.currencyCode,
        to: targetCurrency,
      });
      setConversion((current) => ({
        ...current,
        [account.accountNumber]: result,
      }));
    } catch (error) {
      toast.error(error.message || 'No se pudo convertir el saldo');
    }
  };

  const requestStatement = async (accountNumber) => {
    try {
      const response = await requestAccountStatementPdf(accountNumber);
      toast.success(response.message || 'Estado de cuenta solicitado');
      await loadStatements().catch(() => {
        toast.error('Estado enviado, pero no se pudo actualizar el historial');
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo solicitar el estado de cuenta');
    }
  };

  return (
    <motion.section className="lumina-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Estados</p>
            <AnimatedTitle className="lumina-title">Estados de cuenta</AnimatedTitle>
            <p className="lumina-copy">
              {isAdmin
                ? 'Vista operativa de cuentas administradas, saldos consolidados e historial de solicitudes enviadas.'
                : 'Una lectura privada de tus cuentas vinculadas, saldos y estado operativo.'}
            </p>
          </div>
          <div className="lumina-wealth-card">
            <span>Balance consolidado</span>
            {loading ? <strong>...</strong> : Object.entries(summary.balanceByCurrency).length === 0 ? (
              <strong title={getMoneyTitle(0, 'GTQ')}>{formatCompactMoney(0, 'GTQ')}</strong>
            ) : Object.entries(summary.balanceByCurrency).map(([currency, amount]) => (
              <strong key={currency} title={getMoneyTitle(amount, currency)}>{formatCompactMoney(amount, currency)}</strong>
            ))}
            <p>{summary.active} cuentas activas</p>
          </div>
        </div>
      </div>

      {notice && <div className="lumina-panel">{notice}</div>}

      <div className="lumina-grid-3">
        <div className="lumina-stat"><FileText size={22} /><span>Estados</span><strong>{loading ? '...' : summary.total}</strong><small>{isAdmin ? 'Cuentas administradas' : 'Cuentas vinculadas'}</small></div>
        <div className="lumina-stat"><Landmark size={22} /><span>Activas</span><strong>{loading ? '...' : summary.active}</strong><small>Disponibles para operar</small></div>
        <div className="lumina-stat"><ShieldCheck size={22} /><span>Custodia</span><strong>{isAdmin ? 'Operativa' : 'Privada'}</strong><small>Acceso Lumina</small></div>
      </div>

      <div className="lumina-panel">
        <div className="lumina-section-head">
          <div>
            <p className="lumina-kicker">Cuentas</p>
            <h2>{isAdmin ? 'Cuentas administradas' : 'Listado de estados'}</h2>
          </div>
          <span className="lumina-badge"><RefreshCw size={14} /> Actualizado</span>
        </div>

        {loading ? (
          <div className="lumina-empty">Cargando estados...</div>
        ) : accounts.length === 0 ? (
          <div className="lumina-empty">
            {isAdmin
              ? 'No hay cuentas administradas para mostrar en este momento.'
              : 'Aun no hay cuentas vinculadas para generar estados.'}
          </div>
        ) : (
          <div className="lumina-list">
            {accounts.map((account) => (
              <article key={account.accountNumber} className="lumina-list-item statement-row">
                <div>
                  <strong>{account.accountNumber}</strong>
                  <p>{account.accountType} / {account.currencyCode}</p>
                  <small>{transactions.filter((transaction) => transaction.sourceAccountNumber === account.accountNumber || transaction.destinationAccountNumber === account.accountNumber || transaction.accountNumber === account.accountNumber).length} movimientos cargados</small>
                </div>
                <span className="lumina-badge">{account.status}</span>
                <div>
                  <strong title={getMoneyTitle(account.balance, account.currencyCode)}>{formatCompactMoney(account.balance, account.currencyCode)}</strong>
                  {conversion[account.accountNumber] && (
                    <p title={getMoneyTitle(conversion[account.accountNumber].convertedAmount, conversion[account.accountNumber].to)}>{formatCompactMoney(conversion[account.accountNumber].convertedAmount, conversion[account.accountNumber].to)}</p>
                  )}
                </div>
                <div className="lux-actions">
                  <button type="button" onClick={() => openEdit(account)} className="lumina-button secondary">Editar</button>
                  <button type="button" onClick={() => convertBalance(account, account.currencyCode === 'USD' ? 'GTQ' : 'USD')} className="lumina-button secondary">Convertir</button>
                  {!isAdmin && <button type="button" onClick={() => requestStatement(account.accountNumber)} className="lumina-button secondary">Enviar PDF</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="lumina-panel">
        <div className="lumina-section-head">
          <div>
            <p className="lumina-kicker">Historial</p>
            <h2>Solicitudes de estados</h2>
          </div>
        </div>
        {statements.length === 0 ? (
          <div className="lumina-empty">Aun no hay estados generados.</div>
        ) : (
          <div className="lumina-list">
            {statements.map((statement) => (
              <article key={statement._id || statement.id} className="lumina-list-item statement-row">
                <div>
                  <strong>{statement.accountNumber || statement.accountId || 'Estado generado'}</strong>
                  <p>{formatDate(statement.periodStart)} - {formatDate(statement.periodEnd)}</p>
                </div>
                <span className="lumina-badge">Enviado</span>
                <div>
                  <strong title={getMoneyTitle(
                    statement.closingBalance,
                    statement.currencyCode || accountCurrencyByNumber.get(statement.accountNumber) || accountCurrencyById.get(String(statement.accountId)) || 'GTQ',
                  )}>
                    {formatCompactMoney(
                      statement.closingBalance,
                      statement.currencyCode || accountCurrencyByNumber.get(statement.accountNumber) || accountCurrencyById.get(String(statement.accountId)) || 'GTQ',
                    )}
                  </strong>
                  <p>{formatDateTime(statement.createdAt)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {editingAccount && (
        <div className="modal-backdrop">
          <div className="lumina-modal profile-modal">
            <div className="modal-header">
              <h2>Editar cuenta {editingAccount.accountNumber}</h2>
              <button type="button" onClick={() => setEditingAccount(null)} className="lumina-button secondary">Cerrar</button>
            </div>
            <form onSubmit={saveAccount} className="lux-form">
              <label>Nombre<input className="lux-input" value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} required /></label>
              <label>Dirección<input className="lux-input" value={editForm.address} onChange={(event) => setEditForm((current) => ({ ...current, address: event.target.value }))} required /></label>
              <label>Trabajo<input className="lux-input" value={editForm.jobName} onChange={(event) => setEditForm((current) => ({ ...current, jobName: event.target.value }))} required /></label>
              <label>Ingresos mensuales<input className="lux-input" type="number" min="100" value={editForm.monthlyIncome} onChange={(event) => setEditForm((current) => ({ ...current, monthlyIncome: event.target.value }))} required /></label>
              <div className="lux-actions">
                <button type="button" onClick={() => setEditingAccount(null)} className="lumina-button secondary">Cancelar</button>
                <button type="submit" className="lumina-button">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Statements;
