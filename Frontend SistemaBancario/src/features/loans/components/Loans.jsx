import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeDollarSign, CalendarDays, FileClock, Percent, Plus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore';
import { isAdministrativeRole } from '../../../shared/utils/roles';
import { getMyAccounts } from '../../accounts/services/accountService';
import { createLoan, getLoans, getMyLoans } from '../../dashboard/services/productService';
import { generatePaymentSchedule, calculateTotalInterest, calculateTotalAmount } from '../../../shared/utils/loanCalculator';

const formatMoney = (value, currency = 'GTQ') => (
  new Intl.NumberFormat('es-GT', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(value || 0))
);

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value));
};

const Modal = ({ title, children, onClose, size = 'profile-modal' }) => (
  <div className="modal-backdrop">
    <div className={`lumina-modal ${size}`}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button type="button" onClick={onClose} className="lumina-button secondary">Cerrar</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', required = false, placeholder, min, step }) => (
  <label>
    {label} {required && <span>*</span>}
    <input className="lux-input" type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} min={min} step={step} />
  </label>
);

const Loans = () => {
  const { user } = useAuthStore();
  const isAdmin = isAdministrativeRole(user?.role);
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    accountNumber: '',
    termMonths: '',
    annualInterestRate: '0.12',
    purpose: '',
  });

  const loadLoans = useCallback(async () => {
    try {
      const data = isAdmin ? await getLoans() : await getMyLoans();
      setLoans(Array.isArray(data) ? data : []);
      if (!isAdmin) {
        const accountData = await getMyAccounts().catch(() => []);
        setAccounts(Array.isArray(accountData) ? accountData : []);
        setFormData((current) => ({
          ...current,
          accountNumber: current.accountNumber || accountData?.[0]?.accountNumber || '',
        }));
      }
    } catch {
      toast.error('Error al cargar prestamos');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    Promise.resolve().then(loadLoans);
  }, [loadLoans]);

  const summary = useMemo(() => ({
    total: loans.length,
    pending: loans.filter((loan) => loan.status === 'pendiente').length,
    approved: loans.filter((loan) => loan.status === 'aprobado').length,
    amount: loans.reduce((sum, loan) => sum + Number(loan.amount ?? loan.requestedAmount ?? loan.approvedAmount ?? 0), 0),
  }), [loans]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const loanData = {
        accountNumber: formData.accountNumber,
        requestedAmount: Number(formData.amount),
        termMonths: Number(formData.termMonths),
        interestRate: Number(formData.annualInterestRate) * 100,
        loanPurpose: formData.purpose,
        userId: user.id,
      };
      await createLoan(loanData);
      toast.success('Solicitud de prestamo enviada exitosamente');
      setShowRequestForm(false);
      setFormData({ amount: '', accountNumber: accounts[0]?.accountNumber || '', termMonths: '', annualInterestRate: '0.12', purpose: '' });
      loadLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar solicitud');
    }
  };

  const handleViewSchedule = (loan) => {
    const amount = loan.amount ?? loan.requestedAmount ?? loan.approvedAmount ?? 0;
    const rate = loan.annualInterestRate ?? (Number(loan.interestRate || 0) / 100);
    const sched = generatePaymentSchedule(amount, rate, loan.termMonths, new Date(loan.createdAt || loan.requestDate));
    setSchedule(sched);
    setSelectedLoan(loan);
    setShowSchedule(true);
  };

  return (
    <motion.section className="lumina-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">{isAdmin ? 'Credit review' : 'Credit atelier'}</p>
            <h1 className="lumina-title">Prestamos Lumina</h1>
            <p className="lumina-copy">Solicitudes, tasas, plazos y cronogramas con una lectura financiera premium.</p>
            {!isAdmin && (
              <button onClick={() => setShowRequestForm(true)} className="lumina-button">
                <Plus size={16} /> Solicitar prestamo
              </button>
            )}
          </div>
          <div className="lumina-wealth-card">
            <span>Capital solicitado</span>
          <strong>{loading ? '...' : formatMoney(summary.amount)}</strong>
            <p>{summary.total} solicitudes registradas</p>
          </div>
        </div>
      </div>

      <div className="lumina-grid-4">
        <div className="lumina-stat"><BadgeDollarSign size={22} /><span>Total</span><strong>{loading ? '...' : summary.total}</strong><small>Solicitudes</small></div>
        <div className="lumina-stat"><FileClock size={22} /><span>Pendientes</span><strong>{loading ? '...' : summary.pending}</strong><small>En revision</small></div>
        <div className="lumina-stat"><ShieldCheck size={22} /><span>Aprobados</span><strong>{loading ? '...' : summary.approved}</strong><small>Credito activo</small></div>
        <div className="lumina-stat"><Percent size={22} /><span>Tasa base</span><strong>12%</strong><small>Editable en solicitud</small></div>
      </div>

      <div className="lumina-panel">
        <div className="lumina-section-head">
          <div>
            <p className="lumina-kicker">Registry</p>
            <h2>{isAdmin ? 'Solicitudes de credito' : 'Mis prestamos'}</h2>
          </div>
        </div>
        {loading ? (
          <div className="lumina-empty">Cargando prestamos...</div>
        ) : loans.length === 0 ? (
          <div className="lumina-empty">No hay prestamos registrados.</div>
        ) : (
          <div className="loan-grid">
            {loans.map((loan) => (
              <article key={loan.id || loan._id} className="lumina-list-item loan-card">
                <div className="loan-card-top">
                  <span className="lumina-badge">{loan.status || 'pendiente'}</span>
                  <CalendarDays size={18} />
                </div>
                <strong>{formatMoney(loan.amount ?? loan.requestedAmount ?? loan.approvedAmount)}</strong>
                <p>{loan.termMonths} meses / {Number(loan.annualInterestRate ? loan.annualInterestRate * 100 : loan.interestRate || 0).toFixed(2)}%</p>
                <small>{formatDate(loan.createdAt)}</small>
                <button onClick={() => handleViewSchedule(loan)} className="lumina-button secondary">Ver cronograma</button>
              </article>
            ))}
          </div>
        )}
      </div>

      {showRequestForm && (
        <Modal title="Solicitar prestamo" onClose={() => setShowRequestForm(false)}>
          <form onSubmit={handleSubmitRequest} className="lux-form">
            <Field label="Monto solicitado" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required min="1" step="0.01" placeholder="Ej: 10000" />
            <label>Cuenta de desembolso
              <select className="lux-input" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required>
                {accounts.map((account) => <option key={account.accountNumber} value={account.accountNumber}>{account.accountNumber} - {formatMoney(account.balance, account.currencyCode)}</option>)}
              </select>
            </label>
            <Field label="Plazo (meses)" name="termMonths" type="number" value={formData.termMonths} onChange={handleInputChange} required min="1" placeholder="Ej: 12" />
            <Field label="Tasa de interes anual (%)" name="annualInterestRate" type="number" value={(Number(formData.annualInterestRate) * 100).toString()} onChange={(e) => setFormData((prev) => ({ ...prev, annualInterestRate: (Number(e.target.value) / 100).toString() }))} required min="0" step="0.01" />
            <Field label="Proposito" name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="Describe el proposito" />
            {formData.amount && formData.termMonths && formData.annualInterestRate && (
              <div className="lumina-panel">
                <h2>Resumen del prestamo</h2>
                <p>Pago mensual: {formatMoney(generatePaymentSchedule(Number(formData.amount), Number(formData.annualInterestRate), Number(formData.termMonths))[0]?.monthlyPayment || 0)}</p>
                <p>Interes total: {formatMoney(calculateTotalInterest(Number(formData.amount), Number(formData.annualInterestRate), Number(formData.termMonths)))}</p>
                <p>Total a pagar: {formatMoney(calculateTotalAmount(Number(formData.amount), Number(formData.annualInterestRate), Number(formData.termMonths)))}</p>
              </div>
            )}
            <div className="lux-actions">
              <button type="button" onClick={() => setShowRequestForm(false)} className="lumina-button secondary">Cancelar</button>
              <button type="submit" className="lumina-button">Enviar solicitud</button>
            </div>
          </form>
        </Modal>
      )}

      {showSchedule && selectedLoan && (
        <Modal title={`Cronograma - ${formatMoney(selectedLoan.amount ?? selectedLoan.requestedAmount ?? selectedLoan.approvedAmount)}`} onClose={() => setShowSchedule(false)} size="profile-modal loan-modal">
          <div className="lumina-table">
            <table>
              <thead><tr><th>Mes</th><th>Fecha</th><th>Pago</th><th>Interes</th><th>Capital</th><th>Saldo</th></tr></thead>
              <tbody>
                {schedule.map((payment) => (
                  <tr key={payment.month}>
                    <td>{payment.month}</td>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>{formatMoney(payment.monthlyPayment)}</td>
                    <td>{formatMoney(payment.interestPayment)}</td>
                    <td>{formatMoney(payment.principalPayment)}</td>
                    <td>{formatMoney(payment.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </motion.section>
  );
};

export default Loans;
