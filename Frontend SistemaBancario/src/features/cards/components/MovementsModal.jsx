import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CircleDollarSign, RefreshCcw } from 'lucide-react';
import { useCardStore } from '../store/cardStore';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import '../../../styles/cards.css';

const movementTypes = {
  purchase: { label: 'Compra', icon: CircleDollarSign, color: '#fb7185' },
  compra_tarjeta: { label: 'Compra tarjeta', icon: CircleDollarSign, color: '#fb7185' },
  withdrawal: { label: 'Retiro', icon: ArrowUpRight, color: '#fb7185' },
  deposit: { label: 'Deposito', icon: ArrowDownLeft, color: '#5ee4a8' },
  transfer: { label: 'Transferencia', icon: ArrowLeftRight, color: '#f0cd61' },
  payment: { label: 'Pago', icon: CircleDollarSign, color: '#5ee4a8' },
  refund: { label: 'Reembolso', icon: RefreshCcw, color: '#5ee4a8' },
};

const formatDate = (date) => {
  if (!date) return 'N/D';
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

const MovementsModal = ({ card, onClose }) => {
  const { movements, loading } = useCardStore();

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true">
        <header className="modal-header">
          <div>
            <h2>Movimientos</h2>
            <p className="modal-subtitle">{card.cardHolder || 'Sin titular'}</p>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </header>

        <div className="modal-body">
          {loading && <p className="loading-text">Cargando movimientos...</p>}
          {!loading && movements.length === 0 && <p className="empty-text">No hay movimientos registrados</p>}

          {!loading && movements.length > 0 && (
            <div className="movements-list">
              {movements.map((movement) => {
                const movementType = movementTypes[movement.type] || movementTypes.purchase;
                const MovementIcon = movementType.icon;
                const isIncome = ['deposit', 'payment', 'refund'].includes(movement.type);

                return (
                  <div key={movement.id || movement._id} className="movement-item">
                    <div className="movement-icon" style={{ color: movementType.color }}>
                      <MovementIcon size={20} />
                    </div>

                    <div className="movement-details">
                      <div className="movement-title">
                        <p className="type">{movementType.label}</p>
                        <p className="description">{movement.description || 'Sin descripcion'}</p>
                      </div>
                      <div className="movement-meta">
                        <p className="date">{formatDate(movement.date || movement.createdAt)}</p>
                        <p className="merchant">{movement.merchant || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="movement-amount">
                      <p
                        className={`amount ${isIncome ? 'income' : 'expense'}`}
                        title={getMoneyTitle(Math.abs(movement.amount || 0), movement.currencyCode)}
                      >
                        {isIncome ? '+' : '-'}{formatCompactMoney(Math.abs(movement.amount || 0), movement.currencyCode)}
                      </p>
                      {movement.status && (
                        <p className={`status status-${movement.status}`}>{movement.status}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

export default MovementsModal;
