import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeDollarSign, CalendarDays, CheckCircle2, FileClock, Percent, Plus, ShieldCheck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore';
import { isAdministrativeRole } from '../../../shared/utils/roles';
import { getMyAccounts } from '../../accounts/services/accountService';
import { createLoan, getLoans, getMyLoans, updateLoan } from '../../dashboard/services/productService';
import { generatePaymentSchedule, calculateTotalInterest, calculateTotalAmount } from '../../../shared/utils/loanCalculator';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { formatCompactMoney, formatMoney, getMoneyTitle } from '../../../shared/utils/money';
import './Loans.css';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value));
};

const loanStatusLabels = {
  solicitado: 'Solicitado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  desembolsado: 'Desembolsado',
  pagado: 'Pagado',
  vencido: 'Vencido',
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
  const { user, role } = useAuthStore();
  const currentRole = role || user?.role;
  const isAdmin = isAdministrativeRole(currentRole);
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [busyLoanId, setBusyLoanId] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    accountNumber: '',
    termMonths: '',
    annualInterestRate: '0.12',
    purpose: '',
  });

  const loadLoans = useCallback(async () => {
    try {
      setLoading(true);
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
      toast.error('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    Promise.resolve().then(loadLoans);
  }, [loadLoans]);

  const summary = useMemo(() => ({
    total: loans.length,
    pending: loans.filter((loan) => loan.status === 'solicitado').length,
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
      toast.success('Solicitud de préstamo enviada exitosamente');
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

  const handleAdminStatus = async (loan, status) => {
    const loanId = loan._id || loan.id;
    try {
      setBusyLoanId(loanId);
      await updateLoan(loanId, { status });
      toast.success(`Prestamo ${loanStatusLabels[status].toLowerCase()}`);
      await loadLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'No se pudo actualizar el prestamo');
    } finally {
      setBusyLoanId('');
    }
  };

  return (
    <motion.section className="lumina-page" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="lumina-page-hero">
        <div className="lumina-hero-grid">
          <div>
            <p className="lumina-kicker">{isAdmin ? 'Revisión de crédito' : 'Créditos'}</p>
            <AnimatedTitle className="lumina-title">Préstamos Lumina</AnimatedTitle>
            <p className="lumina-copy">Solicitudes, tasas, plazos y cronogramas con una lectura financiera premium.</p>
            {!isAdmin && (
              <button onClick={() => setShowRequestForm(true)} className="lumina-button">
                <Plus size={16} /> Solicitar préstamo
              </button>
            )}
          </div>
          <div className="lumina-wealth-card">
            <span>Capital solicitado</span>
          <strong title={getMoneyTitle(summary.amount)}>{loading ? '...' : formatCompactMoney(summary.amount)}</strong>
            <p>{summary.total} solicitudes registradas</p>
          </div>
        </div>
      </div>

      <div className="lumina-grid-4">
        <div className="lumina-stat"><BadgeDollarSign size={22} /><span>Total</span><strong>{loading ? '...' : summary.total}</strong><small>Solicitudes</small></div>
        <div className="lumina-stat"><FileClock size={22} /><span>Pendientes</span><strong>{loading ? '...' : summary.pending}</strong><small>En revision</small></div>
        <div className="lumina-stat"><ShieldCheck size={22} /><span>Aprobados</span><strong>{loading ? '...' : summary.approved}</strong><small>Crédito activo</small></div>
        <div className="lumina-stat"><Percent size={22} /><span>Tasa base</span><strong>12%</strong><small>Editable en solicitud</small></div>
      </div>

      <div className="lumina-panel">
        <div className="lumina-section-head">
          <div>
            <p className="lumina-kicker">Registro</p>
            <h2>{isAdmin ? 'Solicitudes de crédito' : 'Mis préstamos'}</h2>
          </div>
        </div>
        {loading ? (
          <div className="lumina-empty">Cargando préstamos...</div>
        ) : loans.length === 0 ? (
          <div className="lumina-empty">No hay préstamos registrados.</div>
        ) : (
          <div className="loan-grid">
            {loans.map((loan) => (
              <article key={loan.id || loan._id} className="lumina-list-item loan-card">
                <div className="loan-card-top">
                  <span className="lumina-badge">{loanStatusLabels[loan.status] || loan.status || 'Solicitado'}</span>
                  <CalendarDays size={18} />
                </div>
                <strong title={getMoneyTitle(loan.amount ?? loan.requestedAmount ?? loan.approvedAmount)}>
                  {formatCompactMoney(loan.amount ?? loan.requestedAmount ?? loan.approvedAmount)}
                </strong>
                <p>{loan.termMonths} meses / {Number(loan.annualInterestRate ? loan.annualInterestRate * 100 : loan.interestRate || 0).toFixed(2)}%</p>
                <small>{formatDate(loan.createdAt)}</small>
                <button type="button" onClick={() => handleViewSchedule(loan)} className="lumina-button secondary">Ver cronograma</button>
                {isAdmin && (
                  <div className="lux-actions">
                    {loan.status === 'solicitado' && (
                      <>
                        <button type="button" disabled={busyLoanId === (loan._id || loan.id)} onClick={() => handleAdminStatus(loan, 'aprobado')} className="lumina-button secondary">
                          <CheckCircle2 size={16} /> Aprobar
                        </button>
                        <button type="button" disabled={busyLoanId === (loan._id || loan.id)} onClick={() => handleAdminStatus(loan, 'rechazado')} className="lumina-button secondary">
                          <XCircle size={16} /> Rechazar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {showRequestForm && (
        <Modal title="Solicitar préstamo" onClose={() => setShowRequestForm(false)}>
          <form onSubmit={handleSubmitRequest} className="lux-form loan-request-form">
            <div className="loan-form-intro">
              <BadgeDollarSign size={24} />
              <div>
                <strong>Solicitud de credito</strong>
                <p>Completa los datos principales para evaluar el prestamo antes de enviarlo.</p>
              </div>
            </div>
            <Field label="Monto solicitado" name="amount" type="number" value={formData.amount} onChange={handleInputChange} required min="1" step="0.01" placeholder="Ej: 10000" />
            <label>Cuenta de desembolso
              <select className="lux-input" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required>
                {accounts.map((account) => <option key={account.accountNumber} value={account.accountNumber}>{account.accountNumber} - {formatCompactMoney(account.balance, account.currencyCode)}</option>)}
              </select>
            </label>
            <Field label="Plazo (meses)" name="termMonths" type="number" value={formData.termMonths} onChange={handleInputChange} required min="1" placeholder="Ej: 12" />
            <Field label="Tasa de interés anual (%)" name="annualInterestRate" type="number" value={(Number(formData.annualInterestRate) * 100).toString()} onChange={(e) => setFormData((prev) => ({ ...prev, annualInterestRate: (Number(e.target.value) / 100).toString() }))} required min="0" step="0.01" />
            <Field label="Proposito" name="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="Describe el proposito" />
            {formData.amount && formData.termMonths && formData.annualInterestRate && (
              <div className="lumina-panel loan-estimate-panel">
                <h2>Resumen del préstamo</h2>
                <p>Pago mensual: {formatCompactMoney(generatePaymentSchedule(Number(formData.amount), Number(formData.annualInterestRate), Number(formData.termMonths))[0]?.monthlyPayment || 0)}</p>
                <p>Interes total: {formatCompactMoney(calculateTotalInterest(Number(formData.amount), Number(formData.annualInterestRate), Number(formData.termMonths)))}</p>
                <p>Total a pagar: {formatCompactMoney(calculateTotalAmount(Number(formData.amount), Number(formData.annualInterestRate), Number(formData.termMonths)))}</p>
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
              <thead><tr><th>Mes</th><th>Fecha</th><th>Pago</th><th>Interés</th><th>Capital</th><th>Saldo</th></tr></thead>
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
