import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore';
import { isAdministrativeRole } from '../../../shared/utils/roles';
import { createLoan, getLoans, getMyLoans } from '../../dashboard/services/productService';
import { generatePaymentSchedule, calculateTotalInterest, calculateTotalAmount } from '../../../shared/utils/loanCalculator';

const formatMoney = (value, currency = 'GTQ') => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
);

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value));
};

const statusStyles = {
  pendiente: 'bg-amber-50 text-amber-700 ring-amber-200',
  aprobado: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rechazado: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const Modal = ({ title, children, onClose, size = 'max-w-4xl' }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
    <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-xl ${size}`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-[#1e3a5f]">{title}</h2>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-[#f5f5f5] hover:text-[#0066cc]">
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', required = false, options, placeholder, min, step }) => (
  <label className="block">
    <span className="text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
      >
        <option value="">{placeholder || 'Selecciona una opción'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#0066cc] focus:outline-none focus:ring-1 focus:ring-[#0066cc]"
      />
    )}
  </label>
);

const Loans = () => {
  const { user } = useAuthStore();
  const isAdmin = isAdministrativeRole(user?.role);

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);

  const [formData, setFormData] = useState({
    amount: '',
    termMonths: '',
    annualInterestRate: '0.12', // 12% default
    purpose: '',
  });

  const loadLoans = async () => {
    try {
      const data = isAdmin ? await getLoans() : await getMyLoans();
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const loanData = {
        ...formData,
        amount: Number(formData.amount),
        termMonths: Number(formData.termMonths),
        annualInterestRate: Number(formData.annualInterestRate),
        userId: user.id,
      };

      await createLoan(loanData);
      toast.success('Solicitud de préstamo enviada exitosamente');
      setShowRequestForm(false);
      setFormData({
        amount: '',
        termMonths: '',
        annualInterestRate: '0.12',
        purpose: '',
      });
      loadLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar solicitud');
      console.error(error);
    }
  };

  const handleViewSchedule = (loan) => {
    const sched = generatePaymentSchedule(
      loan.amount,
      loan.annualInterestRate,
      loan.termMonths,
      new Date(loan.createdAt)
    );
    setSchedule(sched);
    setSelectedLoan(loan);
    setShowSchedule(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#0066cc] border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-600">Cargando préstamos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Préstamos</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona tus solicitudes de préstamo y cronogramas de pago
          </p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e3a5f]"
        >
          Solicitar Préstamo
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1e3a5f]">Mis Préstamos</h2>
        </div>
        <div className="p-6">
          {loans.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No tienes préstamos registrados
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 font-medium text-slate-700">Monto</th>
                    <th className="text-left py-3 font-medium text-slate-700">Plazo</th>
                    <th className="text-left py-3 font-medium text-slate-700">Tasa</th>
                    <th className="text-left py-3 font-medium text-slate-700">Estado</th>
                    <th className="text-left py-3 font-medium text-slate-700">Fecha</th>
                    <th className="text-left py-3 font-medium text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="border-b border-slate-100">
                      <td className="py-3">{formatMoney(loan.amount)}</td>
                      <td className="py-3">{loan.termMonths} meses</td>
                      <td className="py-3">{(loan.annualInterestRate * 100).toFixed(2)}%</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyles[loan.status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3">{formatDate(loan.createdAt)}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleViewSchedule(loan)}
                          className="text-[#0066cc] hover:text-[#1e3a5f] text-sm font-medium"
                        >
                          Ver Cronograma
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Solicitud */}
      {showRequestForm && (
        <Modal title="Solicitar Préstamo" onClose={() => setShowRequestForm(false)}>
          <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
            <Field
              label="Monto solicitado"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="1"
              step="0.01"
              placeholder="Ej: 10000"
            />
            <Field
              label="Plazo (meses)"
              name="termMonths"
              type="number"
              value={formData.termMonths}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Ej: 12"
            />
            <Field
              label="Tasa de interés anual (%)"
              name="annualInterestRate"
              type="number"
              value={(Number(formData.annualInterestRate) * 100).toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, annualInterestRate: (Number(e.target.value) / 100).toString() }))}
              required
              min="0"
              step="0.01"
              placeholder="Ej: 12"
            />
            <Field
              label="Propósito"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Describe el propósito del préstamo"
            />

            {/* Cálculo preliminar */}
            {formData.amount && formData.termMonths && formData.annualInterestRate && (
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="font-medium text-[#1e3a5f] mb-2">Resumen del Préstamo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Pago mensual:</span>
                    <span className="ml-2 font-medium">
                      {formatMoney(generatePaymentSchedule(
                        Number(formData.amount),
                        Number(formData.annualInterestRate),
                        Number(formData.termMonths)
                      )[0]?.monthlyPayment || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Interés total:</span>
                    <span className="ml-2 font-medium">
                      {formatMoney(calculateTotalInterest(
                        Number(formData.amount),
                        Number(formData.annualInterestRate),
                        Number(formData.termMonths)
                      ))}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total a pagar:</span>
                    <span className="ml-2 font-medium">
                      {formatMoney(calculateTotalAmount(
                        Number(formData.amount),
                        Number(formData.annualInterestRate),
                        Number(formData.termMonths)
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-[#0066cc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e3a5f]"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Cronograma */}
      {showSchedule && selectedLoan && (
        <Modal title={`Cronograma de Pagos - ${formatMoney(selectedLoan.amount)}`} onClose={() => setShowSchedule(false)} size="max-w-6xl">
          <div className="p-6">
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Monto del préstamo:</span>
                <span className="ml-2 font-medium">{formatMoney(selectedLoan.amount)}</span>
              </div>
              <div>
                <span className="text-slate-600">Tasa de interés:</span>
                <span className="ml-2 font-medium">{(selectedLoan.annualInterestRate * 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-slate-600">Plazo:</span>
                <span className="ml-2 font-medium">{selectedLoan.termMonths} meses</span>
              </div>
              <div>
                <span className="text-slate-600">Pago mensual:</span>
                <span className="ml-2 font-medium">{formatMoney(schedule[0]?.monthlyPayment || 0)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-medium text-slate-700">Mes</th>
                    <th className="text-left py-2 font-medium text-slate-700">Fecha</th>
                    <th className="text-left py-2 font-medium text-slate-700">Pago Mensual</th>
                    <th className="text-left py-2 font-medium text-slate-700">Interés</th>
                    <th className="text-left py-2 font-medium text-slate-700">Capital</th>
                    <th className="text-left py-2 font-medium text-slate-700">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((payment) => (
                    <tr key={payment.month} className="border-b border-slate-100">
                      <td className="py-2">{payment.month}</td>
                      <td className="py-2">{formatDate(payment.paymentDate)}</td>
                      <td className="py-2">{formatMoney(payment.monthlyPayment)}</td>
                      <td className="py-2">{formatMoney(payment.interestPayment)}</td>
                      <td className="py-2">{formatMoney(payment.principalPayment)}</td>
                      <td className="py-2">{formatMoney(payment.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Loans;