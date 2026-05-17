import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getTransactions } from '../../transactions/services/transactionService';
import '../../../styles/cards.css';

const SpendingDetailsModal = ({ card, onClose }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const { transactions } = await getTransactions({ limit: 50, status: 'exitosa' });
        
        if (transactions && transactions.length > 0) {
          // Filtrar transacciones por cuenta si es posible
          const cardTransactions = transactions.filter(t => 
            t.sourceAccountNumber === card.accountNumber || 
            t.destinationAccountNumber === card.accountNumber ||
            !card.accountNumber || 
            card.accountNumber === 'N/D'
          );

          setMovements(cardTransactions || transactions);

          // Calcular totales
          const income = cardTransactions.reduce((sum, t) => {
            const isIncome = ['deposit', 'payment', 'refund', 'transferencia'].includes(
              t.transactionType?.toLowerCase()
            ) && t.destinationAccountNumber === card.accountNumber;
            return isIncome ? sum + Number(t.amount || 0) : sum;
          }, 0);

          const expenses = cardTransactions.reduce((sum, t) => {
            const isExpense = ['withdrawal', 'purchase', 'transferencia'].includes(
              t.transactionType?.toLowerCase()
            ) && t.sourceAccountNumber === card.accountNumber;
            return isExpense ? sum + Number(t.amount || 0) : sum;
          }, 0);

          setTotals({ income, expenses });
        }
      } catch {
        toast.error('Error al cargar los movimientos');
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [card]);

  const formatCurrency = (amount, currency = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency || 'GTQ',
    }).format(amount);
  };

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

  const getTransactionType = (type) => {
    const types = {
      purchase: { label: 'Compra', icon: 'cart', color: '#e74c3c' },
      withdrawal: { label: 'Retiro', icon: 'withdraw', color: '#e74c3c' },
      deposit: { label: 'Depósito', icon: 'deposit', color: '#27ae60' },
      transfer: { label: 'Transferencia', icon: 'transfer', color: '#3498db' },
      transferencia: { label: 'Transferencia', icon: 'transfer', color: '#3498db' },
      payment: { label: 'Pago', icon: 'payment', color: '#27ae60' },
      refund: { label: 'Reembolso', icon: 'refund', color: '#27ae60' },
    };
    return types[type?.toLowerCase()] || types.purchase;
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content modal-content-large" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>Detalles de Gastos e Ingresos</h2>
          <p className="modal-subtitle">Tarjeta: {card.cardHolder || 'Sin titular'}</p>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className="modal-body">
          {/* Resumen de Totales */}
          <div className="spending-summary-grid">
            <div className="spending-card income-card">
              <div className="spending-icon icon-income">→</div>
              <div className="spending-info">
                <span className="spending-label">Total Ingresos</span>
                <strong className="spending-amount income">
                  +{formatCurrency(totals.income)}
                </strong>
              </div>
            </div>

            <div className="spending-card expense-card">
              <div className="spending-icon icon-expense">←</div>
              <div className="spending-info">
                <span className="spending-label">Total Gastos</span>
                <strong className="spending-amount expense">
                  -{formatCurrency(totals.expenses)}
                </strong>
              </div>
            </div>

            <div className="spending-card balance-card">
              <div className="spending-icon icon-balance">=</div>
              <div className="spending-info">
                <span className="spending-label">Balance Neto</span>
                <strong className="spending-amount balance">
                  {formatCurrency(totals.income - totals.expenses)}
                </strong>
              </div>
            </div>
          </div>

          {/* Movimientos Recientes */}
          <div className="spending-movements-section">
            <h3 className="section-title">Movimientos Recientes</h3>

            {loading && <p className="loading-text">Cargando movimientos...</p>}

            {!loading && movements.length === 0 && (
              <p className="empty-text">No hay movimientos registrados</p>
            )}

            {!loading && movements.length > 0 && (
              <div className="spending-movements-list">
                {movements.slice(0, 15).map((movement, index) => {
                  const movementType = getTransactionType(movement.transactionType);
                  const isIncome = ['deposit', 'payment', 'refund'].includes(
                    movement.transactionType?.toLowerCase()
                  );

                  return (
                    <div key={movement.id || index} className="spending-movement-item">
                      <div className="movement-left">
                        <div 
                          className={`movement-icon icon-${movementType.icon}`}
                          style={{ color: movementType.color }}
                        >
                          {movementType.icon === 'deposit' && '↓'}
                          {movementType.icon === 'withdraw' && '↑'}
                          {movementType.icon === 'transfer' && '⟷'}
                          {movementType.icon === 'payment' && '✓'}
                          {movementType.icon === 'refund' && '⟲'}
                          {movementType.icon === 'cart' && '◆'}
                        </div>
                        <div className="movement-info">
                          <p className="movement-type">{movementType.label}</p>
                          <p className="movement-date">
                            {formatDate(movement.createdAt || movement.date)}
                          </p>
                          <p className="movement-account">
                            {movement.concept || movement.description || 'Transacción bancaria'}
                          </p>
                        </div>
                      </div>
                      <div className="movement-right">
                        <p
                          className={`movement-amount ${isIncome ? 'income' : 'expense'}`}
                          style={{ color: isIncome ? '#27ae60' : '#e74c3c' }}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(movement.amount || 0))}
                        </p>
                        {movement.status && (
                          <p className={`movement-status status-${movement.status}`}>
                            {movement.status === 'exitosa' || movement.status === 'completed'
                              ? 'Completada'
                              : 'Pendiente'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && movements.length > 15 && (
              <p className="info-text">
                Mostrando 15 de {movements.length} movimientos
              </p>
            )}
          </div>
        </div>

        <footer className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SpendingDetailsModal;
