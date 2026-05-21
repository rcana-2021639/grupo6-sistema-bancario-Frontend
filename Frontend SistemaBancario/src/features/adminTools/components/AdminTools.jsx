import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Coins, FileText, LockKeyhole, RotateCcw, Save, Search } from 'lucide-react';
import { getAllAccounts } from '../../accounts/services/accountService';
import {
  cancelTransaction,
  getTransactions,
  updateTransaction,
} from '../../transactions/services/transactionService';
import {
  createAccountStatement,
  deleteAccountStatement,
  getAccountStatements,
  updateAccountStatement,
} from '../../dashboard/services/reportingService';
import {
  changeCurrencyStatus,
  createAccountLock,
  createCurrency,
  deleteAccountLock,
  getAccountLocks,
  getCurrencies,
  updateAccountLock,
  updateCurrency,
} from '../services/adminToolsService';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { formatCompactMoney, formatMoney, getMoneyTitle } from '../../../shared/utils/money';

const TABS = [
  { key: 'currencies', label: 'Monedas', icon: Coins },
  { key: 'locks', label: 'Bloqueos', icon: LockKeyhole },
  { key: 'statements', label: 'Estados', icon: FileText },
  { key: 'transactions', label: 'Transacciones', icon: RotateCcw },
];

const currencyInitial = {
  code: '',
  name: '',
  symbol: '',
  exchangeRate: '',
  baseCurrency: false,
  status: 'activa',
};

const lockInitial = {
  accountId: '',
  userId: '',
  lockReason: 'seguridad',
  description: '',
  lockedBy: '',
  status: 'bloqueado',
};

const statementInitial = {
  accountNumber: '',
  periodStart: '',
  periodEnd: '',
  openingBalance: '',
  closingBalance: '',
  totalDeposits: '',
  totalWithdrawals: '',
  totalTransfersSent: '',
  totalTransfersReceived: '',
  interestEarned: '',
  feesCharged: '',
};

const transactionInitial = {
  description: '',
  favorito: false,
  alias: '',
};

const todayInput = () => new Date().toISOString().slice(0, 10);
const monthStartInput = () => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
};

const getId = (item) => item?._id || item?.id;

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('es-GT') : 'Sin fecha');

const isCancelable = (transaction) => {
  if (transaction?.status !== 'exitosa') return false;
  const createdAt = new Date(transaction.createdAt || transaction.transactionDate).getTime();
  return Boolean(createdAt) && Date.now() - createdAt <= 30 * 60 * 1000;
};

const Field = ({ label, children }) => (
  <label className="admin-tools-field">
    <span>{label}</span>
    {children}
  </label>
);

const PanelTitle = ({ eyebrow, title, meta }) => (
  <div className="admin-tools-panel-head">
    <div>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
    </div>
    {meta && <span className="admin-tools-count">{meta}</span>}
  </div>
);

const AdminTools = () => {
  const [tab, setTab] = useState('currencies');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [locks, setLocks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [statements, setStatements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currencyForm, setCurrencyForm] = useState(currencyInitial);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [lockForm, setLockForm] = useState(lockInitial);
  const [editingLock, setEditingLock] = useState(null);
  const [statementForm, setStatementForm] = useState(() => ({
    ...statementInitial,
    periodStart: monthStartInput(),
    periodEnd: todayInput(),
  }));
  const [editingStatement, setEditingStatement] = useState(null);
  const [transactionForm, setTransactionForm] = useState(transactionInitial);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState('');

  const accountByNumber = useMemo(() => (
    new Map(accounts.map((account) => [account.accountNumber, account]))
  ), [accounts]);

  const filteredTransactions = useMemo(() => {
    const term = transactionSearch.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((transaction) => [
      transaction.sourceAccountNumber,
      transaction.destinationAccountNumber,
      transaction.accountNumber,
      transaction.description,
      transaction.transactionType,
      transaction.status,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [transactionSearch, transactions]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [activeCurrencies, inactiveCurrencies, activeLocks, inactiveLocks, accountData, statementData, transactionData] = await Promise.all([
        getCurrencies({ status: 'activa' }).catch(() => []),
        getCurrencies({ status: 'inactiva' }).catch(() => []),
        getAccountLocks({ status: 'bloqueado' }).catch(() => []),
        getAccountLocks({ status: 'desbloqueado' }).catch(() => []),
        getAllAccounts().catch(() => []),
        getAccountStatements({ limit: 100 }).catch(() => ({ statements: [] })),
        getTransactions({ status: 'all', limit: 100 }).catch(() => ({ transactions: [] })),
      ]);

      setCurrencies([...activeCurrencies, ...inactiveCurrencies]);
      setLocks([...activeLocks, ...inactiveLocks]);
      setAccounts(Array.isArray(accountData) ? accountData : []);
      setStatements(Array.isArray(statementData.statements) ? statementData.statements : []);
      setTransactions(Array.isArray(transactionData.transactions) ? transactionData.transactions : []);
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar el centro admin');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  const resetCurrency = () => {
    setCurrencyForm(currencyInitial);
    setEditingCurrency(null);
  };

  const resetLock = () => {
    setLockForm(lockInitial);
    setEditingLock(null);
  };

  const resetStatement = () => {
    setStatementForm({ ...statementInitial, periodStart: monthStartInput(), periodEnd: todayInput() });
    setEditingStatement(null);
  };

  const resetTransaction = () => {
    setTransactionForm(transactionInitial);
    setEditingTransaction(null);
  };

  const saveCurrency = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...currencyForm,
        code: currencyForm.code.trim().toUpperCase(),
        exchangeRate: Number(currencyForm.exchangeRate),
        baseCurrency: Boolean(currencyForm.baseCurrency),
      };
      if (editingCurrency) {
        await updateCurrency(getId(editingCurrency), payload);
        toast.success('Moneda actualizada');
      } else {
        await createCurrency(payload);
        toast.success('Moneda creada');
      }
      resetCurrency();
      await loadData();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar la moneda');
    } finally {
      setSaving(false);
    }
  };

  const saveLock = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...lockForm,
        unlockDate: lockForm.status === 'desbloqueado' ? new Date().toISOString() : undefined,
      };
      if (editingLock) {
        await updateAccountLock(getId(editingLock), payload);
        toast.success('Bloqueo actualizado');
      } else {
        await createAccountLock(payload);
        toast.success('Bloqueo creado');
      }
      resetLock();
      await loadData();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el bloqueo');
    } finally {
      setSaving(false);
    }
  };

  const saveStatement = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = Object.fromEntries(
        Object.entries(statementForm).map(([key, value]) => (
          key.includes('Balance') || key.startsWith('total') || ['interestEarned', 'feesCharged'].includes(key)
            ? [key, Number(value || 0)]
            : [key, value]
        )),
      );

      if (editingStatement) {
        await updateAccountStatement(getId(editingStatement), payload);
        toast.success('Estado actualizado');
      } else {
        await createAccountStatement(payload);
        toast.success('Estado creado');
      }
      resetStatement();
      await loadData();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el estado');
    } finally {
      setSaving(false);
    }
  };

  const saveTransaction = async (event) => {
    event.preventDefault();
    if (!editingTransaction) return;
    try {
      setSaving(true);
      await updateTransaction(getId(editingTransaction), transactionForm);
      toast.success('Transaccion actualizada');
      resetTransaction();
      await loadData();
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar la transaccion');
    } finally {
      setSaving(false);
    }
  };

  const cancelSelectedTransaction = async (transaction) => {
    if (!window.confirm('Cancelar y reversar esta transaccion?')) return;
    try {
      await cancelTransaction(getId(transaction));
      toast.success('Transaccion cancelada');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'No se pudo cancelar la transaccion');
    }
  };

  const renderCurrencies = () => (
    <div className="admin-tools-grid">
      <form className="admin-tools-panel" onSubmit={saveCurrency}>
        <PanelTitle eyebrow="Catalogo" title={editingCurrency ? 'Editar moneda' : 'Nueva moneda'} />
        <Field label="Codigo"><input value={currencyForm.code} onChange={(e) => setCurrencyForm((c) => ({ ...c, code: e.target.value }))} maxLength="3" required /></Field>
        <Field label="Nombre"><input value={currencyForm.name} onChange={(e) => setCurrencyForm((c) => ({ ...c, name: e.target.value }))} required /></Field>
        <Field label="Simbolo"><input value={currencyForm.symbol} onChange={(e) => setCurrencyForm((c) => ({ ...c, symbol: e.target.value }))} required /></Field>
        <Field label="Tasa"><input type="number" min="0.000001" step="0.000001" value={currencyForm.exchangeRate} onChange={(e) => setCurrencyForm((c) => ({ ...c, exchangeRate: e.target.value }))} required /></Field>
        <Field label="Estado"><select value={currencyForm.status} onChange={(e) => setCurrencyForm((c) => ({ ...c, status: e.target.value }))}><option value="activa">Activa</option><option value="inactiva">Inactiva</option></select></Field>
        <label className="admin-tools-check"><input type="checkbox" checked={currencyForm.baseCurrency} onChange={(e) => setCurrencyForm((c) => ({ ...c, baseCurrency: e.target.checked }))} /> Moneda base</label>
        <div className="admin-tools-actions"><button className="admin-tools-ghost" type="button" onClick={resetCurrency}>Limpiar</button><button className="admin-tools-primary" disabled={saving}><Save size={16} /> Guardar</button></div>
      </form>
      <div className="admin-tools-panel">
        <PanelTitle eyebrow="Disponibles" title="Monedas registradas" meta={currencies.length} />
        <div className="admin-tools-list">
          {currencies.map((currency) => (
            <article key={getId(currency)} className="admin-tools-row">
              <div><strong>{currency.code}</strong><p>{currency.name} / {currency.symbol}</p><small>Tasa {currency.exchangeRate}</small></div>
              <span className={`admin-tools-status status-${currency.status}`}>{currency.status}</span>
              <div className="admin-tools-row-actions">
                <button className="admin-tools-ghost" type="button" onClick={() => { setEditingCurrency(currency); setCurrencyForm({ ...currency, exchangeRate: currency.exchangeRate ?? '' }); }}>Editar</button>
                <button className="admin-tools-ghost" type="button" onClick={() => changeCurrencyStatus(getId(currency), currency.status === 'activa' ? 'inactiva' : 'activa').then(loadData).catch((e) => toast.error(e.message))}>{currency.status === 'activa' ? 'Inactivar' : 'Activar'}</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLocks = () => (
    <div className="admin-tools-grid">
      <form className="admin-tools-panel" onSubmit={saveLock}>
        <PanelTitle eyebrow="Seguridad" title={editingLock ? 'Editar bloqueo' : 'Nuevo bloqueo'} />
        <Field label="Cuenta"><input value={lockForm.accountId} onChange={(e) => setLockForm((c) => ({ ...c, accountId: e.target.value.toUpperCase() }))} placeholder="ACC-000-0000" required /></Field>
        <Field label="Usuario"><input value={lockForm.userId} onChange={(e) => setLockForm((c) => ({ ...c, userId: e.target.value }))} placeholder="usr_..." required /></Field>
        <Field label="Motivo"><select value={lockForm.lockReason} onChange={(e) => setLockForm((c) => ({ ...c, lockReason: e.target.value }))}><option value="fraude">Fraude</option><option value="deuda">Deuda</option><option value="seguridad">Seguridad</option><option value="solicitud_cliente">Solicitud cliente</option><option value="inactividad">Inactividad</option></select></Field>
        <Field label="Descripcion"><input value={lockForm.description} onChange={(e) => setLockForm((c) => ({ ...c, description: e.target.value }))} /></Field>
        <Field label="Bloqueado por"><input value={lockForm.lockedBy} onChange={(e) => setLockForm((c) => ({ ...c, lockedBy: e.target.value }))} /></Field>
        <Field label="Estado"><select value={lockForm.status} onChange={(e) => setLockForm((c) => ({ ...c, status: e.target.value }))}><option value="bloqueado">Bloqueado</option><option value="desbloqueado">Desbloqueado</option></select></Field>
        <div className="admin-tools-actions"><button className="admin-tools-ghost" type="button" onClick={resetLock}>Limpiar</button><button className="admin-tools-primary" disabled={saving}><Save size={16} /> Guardar</button></div>
      </form>
      <div className="admin-tools-panel">
        <PanelTitle eyebrow="Control" title="Bloqueos" meta={locks.length} />
        <div className="admin-tools-list">
          {locks.map((lock) => (
            <article key={getId(lock)} className="admin-tools-row">
              <div><strong>{lock.accountId}</strong><p>{lock.lockReason} / {lock.status}</p><small>{lock.description || 'Sin descripcion'}</small></div>
              <span className={`admin-tools-status status-${lock.status}`}>{lock.status}</span>
              <div className="admin-tools-row-actions">
                <button className="admin-tools-ghost" type="button" onClick={() => { setEditingLock(lock); setLockForm({ ...lock }); }}>Editar</button>
                <button className="admin-tools-ghost" type="button" onClick={() => updateAccountLock(getId(lock), { ...lock, status: 'desbloqueado', unlockDate: new Date().toISOString() }).then(loadData).catch((e) => toast.error(e.message))}>Desbloquear</button>
                <button className="admin-tools-danger" type="button" onClick={() => deleteAccountLock(getId(lock)).then(loadData).catch((e) => toast.error(e.message))}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatements = () => (
    <div className="admin-tools-grid">
      <form className="admin-tools-panel" onSubmit={saveStatement}>
        <PanelTitle eyebrow="Reporteria" title={editingStatement ? 'Editar estado' : 'Nuevo estado'} />
        <Field label="Cuenta"><select value={statementForm.accountNumber} onChange={(e) => setStatementForm((c) => ({ ...c, accountNumber: e.target.value }))} required><option value="">Selecciona</option>{accounts.map((account) => <option key={account.accountNumber} value={account.accountNumber}>{account.accountNumber} - {account.currencyCode}</option>)}</select></Field>
        <Field label="Inicio"><input type="date" value={statementForm.periodStart} onChange={(e) => setStatementForm((c) => ({ ...c, periodStart: e.target.value }))} required /></Field>
        <Field label="Fin"><input type="date" value={statementForm.periodEnd} onChange={(e) => setStatementForm((c) => ({ ...c, periodEnd: e.target.value }))} required /></Field>
        {['openingBalance', 'closingBalance', 'totalDeposits', 'totalWithdrawals', 'totalTransfersSent', 'totalTransfersReceived', 'interestEarned', 'feesCharged'].map((field) => (
          <Field key={field} label={field}><input type="number" step="0.01" min="0" value={statementForm[field]} onChange={(e) => setStatementForm((c) => ({ ...c, [field]: e.target.value }))} /></Field>
        ))}
        <div className="admin-tools-actions"><button className="admin-tools-ghost" type="button" onClick={resetStatement}>Limpiar</button><button className="admin-tools-primary" disabled={saving}><Save size={16} /> Guardar</button></div>
      </form>
      <div className="admin-tools-panel">
        <PanelTitle eyebrow="Historico" title="Estados registrados" meta={statements.length} />
        <div className="admin-tools-list">
          {statements.map((statement) => {
            const account = accountByNumber.get(statement.accountNumber);
            const currency = statement.currencyCode || account?.currencyCode || 'GTQ';
            return (
              <article key={getId(statement)} className="admin-tools-row">
                <div><strong>{statement.accountNumber || statement.accountId}</strong><p>{formatDateTime(statement.periodStart)} - {formatDateTime(statement.periodEnd)}</p><small title={getMoneyTitle(statement.closingBalance, currency)}>{formatMoney(statement.closingBalance, currency)}</small></div>
                <span className="admin-tools-status status-neutral">{currency}</span>
                <div className="admin-tools-row-actions">
                  <button className="admin-tools-ghost" type="button" onClick={() => { setEditingStatement(statement); setStatementForm({ ...statementInitial, ...statement, accountNumber: statement.accountNumber || '', periodStart: String(statement.periodStart || '').slice(0, 10), periodEnd: String(statement.periodEnd || '').slice(0, 10) }); }}>Editar</button>
                  <button className="admin-tools-danger" type="button" onClick={() => deleteAccountStatement(getId(statement)).then(loadData).catch((e) => toast.error(e.message))}>Eliminar</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="admin-tools-grid">
      <form className="admin-tools-panel" onSubmit={saveTransaction}>
        <PanelTitle eyebrow="Reversos" title="Detalle de transaccion" />
        {editingTransaction ? (
          <>
            <p className="admin-tools-muted">{editingTransaction.transactionType} / {editingTransaction.status}</p>
            <strong title={getMoneyTitle(editingTransaction.amount, editingTransaction.currencyCode)}>{formatCompactMoney(editingTransaction.amount, editingTransaction.currencyCode)}</strong>
            <Field label="Descripcion"><input value={transactionForm.description} onChange={(e) => setTransactionForm((c) => ({ ...c, description: e.target.value }))} /></Field>
            <Field label="Alias"><input value={transactionForm.alias} onChange={(e) => setTransactionForm((c) => ({ ...c, alias: e.target.value }))} /></Field>
            <label className="admin-tools-check"><input type="checkbox" checked={transactionForm.favorito} onChange={(e) => setTransactionForm((c) => ({ ...c, favorito: e.target.checked }))} /> Favorito</label>
            <div className="admin-tools-actions"><button className="admin-tools-ghost" type="button" onClick={resetTransaction}>Cerrar</button><button className="admin-tools-primary" disabled={saving}><Save size={16} /> Guardar</button></div>
          </>
        ) : <p className="admin-tools-muted">Selecciona una transaccion para editar o cancelar.</p>}
      </form>
      <div className="admin-tools-panel">
        <PanelTitle eyebrow="Auditoria" title="Transacciones" meta={filteredTransactions.length} />
        <label className="admin-tools-search"><Search size={16} /><input value={transactionSearch} onChange={(e) => setTransactionSearch(e.target.value)} placeholder="Buscar por cuenta, estado o descripcion" /></label>
        <div className="admin-tools-list">
          {filteredTransactions.map((transaction) => (
            <article key={getId(transaction)} className="admin-tools-row">
              <div><strong>{transaction.transactionType}</strong><p>{transaction.sourceAccountNumber || 'N/D'} {'->'} {transaction.destinationAccountNumber || 'N/D'}</p><small>{transaction.description || formatDateTime(transaction.createdAt)}</small></div>
              <span className={`admin-tools-status status-${transaction.status}`}>{transaction.status}</span>
              <strong className="admin-tools-amount" title={getMoneyTitle(transaction.amount, transaction.currencyCode)}>{formatCompactMoney(transaction.amount, transaction.currencyCode)}</strong>
              <div className="admin-tools-row-actions">
                <button className="admin-tools-ghost" type="button" onClick={() => { setEditingTransaction(transaction); setTransactionForm({ description: transaction.description || '', favorito: Boolean(transaction.favorito), alias: transaction.alias || '' }); }}>Ver/editar</button>
                <button className="admin-tools-danger" type="button" disabled={!isCancelable(transaction)} onClick={() => cancelSelectedTransaction(transaction)}>Cancelar</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section className="lumina-page admin-tools-page">
      <div className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">Administracion avanzada</p>
            <AnimatedTitle className="lumina-title">Centro admin</AnimatedTitle>
            <p className="lumina-copy">Gestion operativa para monedas, bloqueos, estados y reversos de transacciones.</p>
          </div>
          <div className="lumina-wealth-card">
            <span>Ventana de cancelacion</span>
            <strong>30 min</strong>
            <p>Reversion contable cuando hay saldo suficiente</p>
          </div>
        </div>
      </div>

      <div className="admin-tools-tabs">
        {TABS.map((item) => {
          const Icon = item.icon;
          return <button key={item.key} type="button" className={tab === item.key ? 'is-active' : ''} onClick={() => setTab(item.key)}><Icon size={16} /> {item.label}</button>;
        })}
      </div>

      {loading ? <div className="lumina-empty">Cargando centro admin...</div> : (
        <>
          {tab === 'currencies' && renderCurrencies()}
          {tab === 'locks' && renderLocks()}
          {tab === 'statements' && renderStatements()}
          {tab === 'transactions' && renderTransactions()}
        </>
      )}
    </section>
  );
};

export default AdminTools;
