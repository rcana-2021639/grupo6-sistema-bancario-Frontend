import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllAccounts, getMyAccounts } from '../../accounts/services/accountService';
import { useAuthStore } from '../../auth/store/authStore';
import { isAdministrativeRole } from '../../../shared/utils/roles';
import {
  createDeposit,
  createTransfer,
  createWithdrawal,
  getTransactions,
} from '../services/transactionService';
import './Transactions.css';

const accountRegex = /^[A-Z]{3}-\d{3}-\d{4}$/;
const initialForms = {
  deposit: { accountNumber: '', amount: '', currencyCode: 'GTQ', description: '' },
  withdrawal: { accountNumber: '', amount: '', currencyCode: 'GTQ' },
  transfer: {
    sourceAccountNumber: '',
    destinationAccountNumber: '',
    amount: '',
    currencyCode: 'GTQ',
    description: '',
    favorito: false,
    alias: '',
  },
};

const typeLabels = {
  deposito: 'Deposito',
  retiro: 'Retiro',
  transferencia: 'Transferencia',
  local_retiro: 'Retiro',
};

const formatMoney = (value, currency = 'GTQ') => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: currency || 'GTQ',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
);

const formatDate = (value) => {
  if (!value) return 'Ahora';
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const normalizeAccount = (value) => String(value || '').trim().toUpperCase();

const validateAmount = (amount, min = 0.01) => {
  const numericAmount = Number(amount);
  if (!String(amount).trim()) return 'El monto es requerido.';
  if (Number.isNaN(numericAmount) || numericAmount < min) return `El monto debe ser mayor o igual a ${min}.`;
  return '';
};

const validateAccountNumber = (accountNumber, label) => {
  if (!accountNumber.trim()) return `${label} es requerida.`;
  if (!accountRegex.test(normalizeAccount(accountNumber))) return `${label} debe tener formato ABC-000-0000.`;
  return '';
};

const Modal = ({ title, children, onClose }) => (
  <div className="transactions-modal-backdrop" role="presentation">
    <div className="transactions-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
      <div className="transactions-modal__header">
        <h2 id="transaction-modal-title">{title}</h2>
        <button type="button" className="transactions-icon-button" onClick={onClose} aria-label="Cerrar modal">
          x
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  options,
  placeholder,
}) => (
  <label className="transactions-field">
    <span>
      {label} {required && <strong>*</strong>}
    </span>
    {options?.length ? (
      <select name={name} value={value} onChange={onChange} required={required}>
        <option value="">Selecciona una cuenta</option>
        {options.map((account) => (
          <option key={account.accountNumber} value={account.accountNumber}>
            {account.accountNumber} - {formatMoney(account.balance, account.currencyCode)}
          </option>
        ))}
      </select>
    ) : (
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={placeholder}
        min={type === 'number' ? '0.01' : undefined}
        step={type === 'number' ? '0.01' : undefined}
      />
    )}
  </label>
);

const CurrencyField = ({ value, onChange }) => (
  <label className="transactions-field">
    <span>Moneda <strong>*</strong></span>
    <select name="currencyCode" value={value} onChange={onChange} required>
      <option value="GTQ">GTQ</option>
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
    </select>
  </label>
);

const FormActions = ({ saving, onCancel, actionLabel }) => (
  <div className="transactions-form-actions">
    <button type="button" className="transactions-button transactions-button--secondary" onClick={onCancel}>
      Cancelar
    </button>
    <button type="submit" className="transactions-button transactions-button--primary" disabled={saving}>
      {saving ? 'Procesando...' : actionLabel}
    </button>
  </div>
);

const DepositForm = ({ accounts, form, saving, onChange, onCancel, onSubmit }) => (
  <form className="transactions-form" onSubmit={onSubmit}>
    <div className="transactions-form__grid">
      <Field
        label="Cuenta destino"
        name="accountNumber"
        value={form.accountNumber}
        onChange={onChange}
        options={accounts}
        placeholder="ABC-000-0000"
        required
      />
      <Field label="Monto" name="amount" value={form.amount} onChange={onChange} type="number" required />
      <CurrencyField value={form.currencyCode} onChange={onChange} />
      <Field
        label="Descripcion"
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder="Deposito en cuenta"
      />
    </div>
    <FormActions saving={saving} onCancel={onCancel} actionLabel="Depositar" />
  </form>
);

const WithdrawalForm = ({ accounts, form, saving, onChange, onCancel, onSubmit }) => (
  <form className="transactions-form" onSubmit={onSubmit}>
    <div className="transactions-form__grid">
      <Field
        label="Cuenta origen"
        name="accountNumber"
        value={form.accountNumber}
        onChange={onChange}
        options={accounts}
        placeholder="ABC-000-0000"
        required
      />
      <Field label="Monto" name="amount" value={form.amount} onChange={onChange} type="number" required />
      <CurrencyField value={form.currencyCode} onChange={onChange} />
    </div>
    <FormActions saving={saving} onCancel={onCancel} actionLabel="Retirar" />
  </form>
);

const TransferForm = ({ accounts, form, saving, onChange, onCancel, onSubmit }) => (
  <form className="transactions-form" onSubmit={onSubmit}>
    <div className="transactions-form__grid">
      <Field
        label="Cuenta origen"
        name="sourceAccountNumber"
        value={form.sourceAccountNumber}
        onChange={onChange}
        options={accounts}
        placeholder="ABC-000-0000"
        required
      />
      <Field
        label="Cuenta destino"
        name="destinationAccountNumber"
        value={form.destinationAccountNumber}
        onChange={onChange}
        placeholder="ABC-000-0000"
        required
      />
      <Field label="Monto" name="amount" value={form.amount} onChange={onChange} type="number" required />
      <CurrencyField value={form.currencyCode} onChange={onChange} />
      <Field
        label="Descripcion"
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder="Transferencia bancaria"
      />
      <Field
        label="Alias favorito"
        name="alias"
        value={form.alias}
        onChange={onChange}
        placeholder="Casa, renta, proveedor"
      />
    </div>
    <label className="transactions-check">
      <input name="favorito" type="checkbox" checked={form.favorito} onChange={onChange} />
      Guardar destino como favorito
    </label>
    <FormActions saving={saving} onCancel={onCancel} actionLabel="Transferir" />
  </form>
);

const TransactionCard = ({ transaction }) => {
  const type = transaction.transactionType || transaction.type || 'movimiento';
  const source = transaction.sourceAccountNumber || transaction.accountNumber || '';
  const destination = transaction.destinationAccountNumber || '';

  return (
    <article className="transactions-list__item">
      <div>
        <div className="transactions-list__title-row">
          <h3>{typeLabels[type] || type.replace('_', ' ')}</h3>
          <span>{transaction.status || 'exitosa'}</span>
        </div>
        <p className="transactions-list__date">
          {formatDate(transaction.transactionDate || transaction.date || transaction.createdAt)}
        </p>
        <p className="transactions-list__description">{transaction.description || 'Sin descripcion'}</p>
        <div className="transactions-list__accounts">
          {source && <span>Origen: {source}</span>}
          {destination && <span>Destino: {destination}</span>}
        </div>
      </div>
      <strong>{formatMoney(transaction.amount, transaction.currencyCode)}</strong>
    </article>
  );
};

const Transactions = () => {
  const { role } = useAuthStore();
  const isAdmin = isAdministrativeRole(role);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState('');
  const [forms, setForms] = useState(initialForms);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.status === 'activa'),
    [accounts],
  );

  const totals = useMemo(() => ({
    count: transactions.length,
    deposits: transactions.filter((item) => item.transactionType === 'deposito').length,
    transfers: transactions.filter((item) => item.transactionType === 'transferencia').length,
  }), [transactions]);

  const loadTransactions = useCallback(async () => {
    const response = await getTransactions({ limit: 25, status: 'exitosa' });
    setTransactions(Array.isArray(response.transactions) ? response.transactions : []);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setNotice('');
      const accountData = isAdmin ? await getAllAccounts() : await getMyAccounts();
      setAccounts(Array.isArray(accountData) ? accountData : []);

      try {
        await loadTransactions();
      } catch (error) {
        setTransactions([]);
        setNotice(error.message || 'No se pudo cargar el historial de transacciones.');
      }
    } catch (error) {
      setNotice(error.message || 'No se pudo cargar la informacion de cuentas.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, loadTransactions]);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  const closeModal = () => {
    setModal('');
    setForms(initialForms);
  };

  const handleChange = (type) => (event) => {
    const { name, value, checked, type: inputType } = event.target;
    const nextValue = inputType === 'checkbox' ? checked : value;
    setForms((current) => ({
      ...current,
      [type]: {
        ...current[type],
        [name]: nextValue,
      },
    }));
  };

  const validateOperation = (type) => {
    const form = forms[type];
    const amountError = validateAmount(form.amount, type === 'withdrawal' ? 1 : 0.01);
    if (amountError) return amountError;

    if (type === 'deposit') {
      return validateAccountNumber(form.accountNumber, 'La cuenta destino');
    }

    if (type === 'withdrawal') {
      return validateAccountNumber(form.accountNumber, 'La cuenta origen');
    }

    const sourceError = validateAccountNumber(form.sourceAccountNumber, 'La cuenta origen');
    if (sourceError) return sourceError;
    const destinationError = validateAccountNumber(form.destinationAccountNumber, 'La cuenta destino');
    if (destinationError) return destinationError;
    if (normalizeAccount(form.sourceAccountNumber) === normalizeAccount(form.destinationAccountNumber)) {
      return 'La cuenta origen y destino no pueden ser la misma.';
    }
    return '';
  };

  const addLocalTransaction = (transaction) => {
    if (!transaction) return;
    setTransactions((current) => [transaction, ...current].slice(0, 25));
  };

  const handleSubmit = (type) => async (event) => {
    event.preventDefault();
    const validationError = validateOperation(type);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      if (type === 'deposit') {
        const form = forms.deposit;
        const deposit = await createDeposit({
          accountNumber: normalizeAccount(form.accountNumber),
          amount: Number(form.amount),
          currencyCode: form.currencyCode,
          description: form.description.trim() || 'Deposito en cuenta',
        });
        addLocalTransaction({
          ...deposit,
          transactionType: 'deposito',
          destinationAccountNumber: deposit?.accountNumber || normalizeAccount(form.accountNumber),
        });
        toast.success('Deposito realizado');
      }

      if (type === 'withdrawal') {
        const form = forms.withdrawal;
        const withdrawal = await createWithdrawal({
          accountNumber: normalizeAccount(form.accountNumber),
          amount: Number(form.amount),
          currencyCode: form.currencyCode,
        });
        addLocalTransaction({
          ...withdrawal,
          transactionType: 'local_retiro',
          status: 'exitosa',
        });
        toast.success('Retiro realizado');
      }

      if (type === 'transfer') {
        const form = forms.transfer;
        const transfer = await createTransfer({
          sourceAccountNumber: normalizeAccount(form.sourceAccountNumber),
          destinationAccountNumber: normalizeAccount(form.destinationAccountNumber),
          amount: Number(form.amount),
          currencyCode: form.currencyCode,
          description: form.description.trim() || 'Transferencia bancaria',
          favorito: Boolean(form.favorito),
          alias: form.favorito ? form.alias.trim() : '',
        });
        addLocalTransaction(transfer);
        toast.success('Transferencia realizada');
      }

      closeModal();
      loadData();
    } catch (error) {
      toast.error(error.message || 'No se pudo procesar la transaccion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="transactions-page">
      <div className="transactions-hero">
        <div>
          <p>Transactions</p>
          <h1>Operaciones bancarias</h1>
          <span>Depositos, retiros y transferencias con validacion antes de enviar.</span>
        </div>
        <div className="transactions-actions">
          <button type="button" className="transactions-button transactions-button--primary" onClick={() => setModal('deposit')}>
            Deposito
          </button>
          <button type="button" className="transactions-button transactions-button--primary" onClick={() => setModal('withdrawal')}>
            Retiro
          </button>
          <button type="button" className="transactions-button transactions-button--primary" onClick={() => setModal('transfer')}>
            Transferencia
          </button>
        </div>
      </div>

      {notice && <div className="transactions-notice">{notice}</div>}

      <div className="transactions-stats">
        <div>
          <span>Transacciones</span>
          <strong>{loading ? '...' : totals.count}</strong>
        </div>
        <div>
          <span>Depositos</span>
          <strong>{loading ? '...' : totals.deposits}</strong>
        </div>
        <div>
          <span>Transferencias</span>
          <strong>{loading ? '...' : totals.transfers}</strong>
        </div>
      </div>

      <div className="transactions-panel">
        <div className="transactions-panel__header">
          <div>
            <h2>Transacciones realizadas</h2>
            <p>{activeAccounts.length} cuentas activas disponibles para operar.</p>
          </div>
          <button type="button" className="transactions-button transactions-button--secondary" onClick={loadData}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="transactions-empty">Cargando transacciones...</div>
        ) : transactions.length === 0 ? (
          <div className="transactions-empty">No hay transacciones para mostrar.</div>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction, index) => (
              <TransactionCard key={transaction._id || transaction.id || `${transaction.accountNumber}-${index}`} transaction={transaction} />
            ))}
          </div>
        )}
      </div>

      {modal === 'deposit' && (
        <Modal title="Nuevo deposito" onClose={closeModal}>
          <DepositForm
            accounts={activeAccounts}
            form={forms.deposit}
            saving={saving}
            onChange={handleChange('deposit')}
            onCancel={closeModal}
            onSubmit={handleSubmit('deposit')}
          />
        </Modal>
      )}

      {modal === 'withdrawal' && (
        <Modal title="Nuevo retiro" onClose={closeModal}>
          <WithdrawalForm
            accounts={activeAccounts}
            form={forms.withdrawal}
            saving={saving}
            onChange={handleChange('withdrawal')}
            onCancel={closeModal}
            onSubmit={handleSubmit('withdrawal')}
          />
        </Modal>
      )}

      {modal === 'transfer' && (
        <Modal title="Nueva transferencia" onClose={closeModal}>
          <TransferForm
            accounts={activeAccounts}
            form={forms.transfer}
            saving={saving}
            onChange={handleChange('transfer')}
            onCancel={closeModal}
            onSubmit={handleSubmit('transfer')}
          />
        </Modal>
      )}
    </section>
  );
};

export default Transactions;
