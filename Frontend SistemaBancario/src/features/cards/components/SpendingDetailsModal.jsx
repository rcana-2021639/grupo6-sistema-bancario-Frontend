import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  RefreshCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getTransactions } from '../../transactions/services/transactionService';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import '../../../styles/cards.css';

const typeMap = {
  purchase: { label: 'Compra', icon: CircleDollarSign, color: '#fb7185' },
  compra_tarjeta: { label: 'Compra tarjeta', icon: CircleDollarSign, color: '#fb7185' },
  withdrawal: { label: 'Retiro', icon: ArrowUpRight, color: '#fb7185' },
  retiro: { label: 'Retiro', icon: ArrowUpRight, color: '#fb7185' },
  local_retiro: { label: 'Retiro', icon: ArrowUpRight, color: '#fb7185' },
  deposit: { label: 'Deposito', icon: ArrowDownLeft, color: '#5ee4a8' },
  deposito: { label: 'Deposito', icon: ArrowDownLeft, color: '#5ee4a8' },
  transfer: { label: 'Transferencia', icon: ArrowLeftRight, color: '#f0cd61' },
  transferencia: { label: 'Transferencia', icon: ArrowLeftRight, color: '#f0cd61' },
  payment: { label: 'Pago', icon: BadgeCheck, color: '#5ee4a8' },
  refund: { label: 'Reembolso', icon: RefreshCcw, color: '#5ee4a8' },
};

const normalizeType = (type) => String(type || '').toLowerCase();

const formatDate = (date) => {
  if (!date) return 'N/D';
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SpendingDetailsModal = ({ card, onClose }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const { transactions } = await getTransactions({ limit: 50, status: 'exitosa' });
        const allTransactions = Array.isArray(transactions) ? transactions : [];
        const cardTransactions = allTransactions.filter((transaction) => (
          transaction.sourceAccountNumber === card.accountNumber
          || transaction.destinationAccountNumber === card.accountNumber
          || !card.accountNumber
          || card.accountNumber === 'N/D'
        ));

        const visibleTransactions = cardTransactions.length ? cardTransactions : allTransactions;
        setMovements(visibleTransactions);

        const income = visibleTransactions.reduce((sum, transaction) => {
          const type = normalizeType(transaction.transactionType);
          const isIncome = ['deposit', 'deposito', 'payment', 'refund'].includes(type)
            || (type === 'transferencia' && transaction.destinationAccountNumber === card.accountNumber);
          return isIncome ? sum + Number(transaction.amount || 0) : sum;
        }, 0);

        const expenses = visibleTransactions.reduce((sum, transaction) => {
          const type = normalizeType(transaction.transactionType);
          const isExpense = ['withdrawal', 'retiro', 'local_retiro', 'purchase', 'compra_tarjeta'].includes(type)
            || (type === 'transferencia' && transaction.sourceAccountNumber === card.accountNumber);
          return isExpense ? sum + Number(transaction.amount || 0) : sum;
        }, 0);

        setTotals({ income, expenses });
      } catch (error) {
        toast.error(error.message || 'Error al cargar los movimientos');
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [card]);

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content modal-content-large" role="dialog" aria-modal="true">
        <header className="modal-header">
          <div>
            <h2>Movimientos de tarjeta</h2>
            <p className="modal-subtitle">Tarjeta: {card.cardHolder || 'Sin titular'}</p>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </header>

        <div className="modal-body">
          <div className="spending-summary-grid">
            <div className="spending-card income-card">
              <div className="spending-icon icon-income"><ArrowDownLeft size={24} /></div>
              <div className="spending-info">
                <span className="spending-label">Total ingresos</span>
                <strong className="spending-amount income" title={getMoneyTitle(totals.income)}>
                  +{formatCompactMoney(totals.income)}
                </strong>
              </div>
            </div>

            <div className="spending-card expense-card">
              <div className="spending-icon icon-expense"><ArrowUpRight size={24} /></div>
              <div className="spending-info">
                <span className="spending-label">Total gastos</span>
                <strong className="spending-amount expense" title={getMoneyTitle(totals.expenses)}>
                  -{formatCompactMoney(totals.expenses)}
                </strong>
              </div>
            </div>

            <div className="spending-card balance-card">
              <div className="spending-icon icon-balance"><CircleDollarSign size={24} /></div>
              <div className="spending-info">
                <span className="spending-label">Balance neto</span>
                <strong className="spending-amount balance" title={getMoneyTitle(totals.income - totals.expenses)}>
                  {formatCompactMoney(totals.income - totals.expenses)}
                </strong>
              </div>
            </div>
          </div>

          <div className="spending-movements-section">
            <h3 className="section-title">Movimientos recientes</h3>

            {loading && <p className="loading-text">Cargando movimientos...</p>}
            {!loading && movements.length === 0 && <p className="empty-text">No hay movimientos registrados</p>}

            {!loading && movements.length > 0 && (
              <div className="spending-movements-list">
                {movements.slice(0, 15).map((movement, index) => {
                  const type = normalizeType(movement.transactionType);
                  const movementType = typeMap[type] || typeMap.purchase;
                  const MovementIcon = movementType.icon;
                  const isIncome = ['deposit', 'deposito', 'payment', 'refund'].includes(type)
                    || (type === 'transferencia' && movement.destinationAccountNumber === card.accountNumber);

                  return (
                    <div key={movement.id || movement._id || index} className="spending-movement-item">
                      <div className="movement-left">
                        <div className="movement-icon" style={{ color: movementType.color }}>
                          <MovementIcon size={20} />
                        </div>
                        <div className="movement-info">
                          <p className="movement-type">{movementType.label}</p>
                          <p className="movement-date">{formatDate(movement.createdAt || movement.date)}</p>
                          <p className="movement-account">
                            {movement.concept || movement.description || 'Transaccion bancaria'}
                          </p>
                        </div>
                      </div>
                      <div className="movement-right">
                        <p
                          className={`movement-amount ${isIncome ? 'income' : 'expense'}`}
                          title={getMoneyTitle(Math.abs(movement.amount || 0), movement.currencyCode)}
                        >
                          {isIncome ? '+' : '-'}{formatCompactMoney(Math.abs(movement.amount || 0), movement.currencyCode)}
                        </p>
                        {movement.status && (
                          <p className={`movement-status status-${movement.status}`}>
                            {movement.status === 'exitosa' || movement.status === 'completed' ? 'Completada' : 'Pendiente'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && movements.length > 15 && (
              <p className="info-text">Mostrando 15 de {movements.length} movimientos</p>
            )}
          </div>
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SpendingDetailsModal;
