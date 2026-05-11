import { useCardStore } from '../store/cardStore';
import '../../../styles/cards.css';

const MovementsModal = ({ card, onClose }) => {
  const { movements, loading } = useCardStore();

  const formatCurrency = (amount, currency = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency || 'GTQ',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-GT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getMovementType = (type) => {
    const types = {
      purchase: { label: 'Compra', icon: '🛒', color: '#e74c3c' },
      withdrawal: { label: 'Retiro', icon: '💸', color: '#e74c3c' },
      deposit: { label: 'Depósito', icon: '💰', color: '#27ae60' },
      transfer: { label: 'Transferencia', icon: '🔄', color: '#3498db' },
      payment: { label: 'Pago', icon: '💳', color: '#27ae60' },
      refund: { label: 'Reembolso', icon: '↩️', color: '#27ae60' },
    };
    return types[type] || types.purchase;
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>Movimientos - {card.cardHolder}</h2>
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
          {loading && <p className="loading-text">Cargando movimientos...</p>}

          {!loading && movements.length === 0 && (
            <p className="empty-text">No hay movimientos registrados</p>
          )}

          {!loading && movements.length > 0 && (
            <div className="movements-list">
              {movements.map((movement) => {
                const movementType = getMovementType(movement.type);
                const isIncome = ['deposit', 'payment', 'refund'].includes(movement.type);

                return (
                  <div key={movement.id} className="movement-item">
                    <div className="movement-icon" style={{ color: movementType.color }}>
                      {movementType.icon}
                    </div>

                    <div className="movement-details">
                      <div className="movement-title">
                        <p className="type">{movementType.label}</p>
                        <p className="description">{movement.description || 'Sin descripción'}</p>
                      </div>
                      <div className="movement-meta">
                        <p className="date">{formatDate(movement.date)}</p>
                        <p className="merchant">{movement.merchant || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="movement-amount">
                      <p
                        className="amount"
                        style={{ color: isIncome ? '#27ae60' : '#e74c3c' }}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(Math.abs(movement.amount))}
                      </p>
                      {movement.status && (
                        <p className={`status status-${movement.status}`}>
                          {movement.status === 'completed' ? '✓' : '⏳'} {movement.status}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MovementsModal;
