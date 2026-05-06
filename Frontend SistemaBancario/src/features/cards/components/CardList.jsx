import { useState } from 'react';
import '../../../styles/cards.css';

const STATUS_META = {
  active: { label: 'Activa', tone: 'is-active' },
  inactive: { label: 'Inactiva', tone: 'is-inactive' },
  blocked: { label: 'Bloqueada', tone: 'is-blocked' },
  expired: { label: 'Vencida', tone: 'is-expired' },
};

const formatCurrency = (amount) => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(amount || 0))
);

const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '**** **** **** ****';
  const normalized = String(cardNumber).replace(/\D/g, '');
  return `**** **** **** ${normalized.slice(-4)}`;
};

const formatDate = (value) => {
  if (!value) return 'N/D';
  return new Date(value).toLocaleDateString('es-GT');
};

const CardList = ({
  cards,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewMovements,
  onChangePin,
  onSetLimit,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="cards-grid">
      {cards.map((card) => {
        const statusMeta = STATUS_META[card.status] || STATUS_META.inactive;
        const isExpanded = expandedId === card.id;
        const remainingToday = Math.max(0, Number(card.dailyLimit || 0) - Number(card.usedToday || 0));

        return (
          <article
            key={card.id}
            className={`card-record ${statusMeta.tone}`}
          >
            <div className="card-record-top">
              <div>
                <p className="card-record-brand">{card.cardBrand || 'VISA'}</p>
                <h3>{formatCardNumber(card.cardNumber)}</h3>
                <p className="card-record-holder">{card.cardHolder || 'Sin titular'}</p>
              </div>
              <span className={`card-status-pill ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
            </div>

            <div className="card-balance-box">
              <span>Saldo disponible</span>
              <strong>{formatCurrency(card.availableBalance)}</strong>
            </div>

            <div className="card-mini-grid">
              <div className="card-mini-item">
                <span>Cuenta</span>
                <strong>{card.accountNumber || 'N/D'}</strong>
              </div>
              <div className="card-mini-item">
                <span>Vence</span>
                <strong>{card.expiryDate || 'N/D'}</strong>
              </div>
              <div className="card-mini-item">
                <span>Limite diario</span>
                <strong>{formatCurrency(card.dailyLimit)}</strong>
              </div>
              <div className="card-mini-item">
                <span>Disponible hoy</span>
                <strong>{formatCurrency(remainingToday)}</strong>
              </div>
            </div>

            <div className="card-action-grid">
              <button type="button" className="action-btn" onClick={() => onViewMovements(card)}>
                Movimientos
              </button>
              <button type="button" className="action-btn" onClick={() => onEdit(card)}>
                Editar
              </button>
              <button type="button" className="action-btn" onClick={() => onSetLimit(card)}>
                Limite
              </button>
              <button type="button" className="action-btn" onClick={() => onChangePin(card)}>
                PIN
              </button>
              <button type="button" className="action-btn" onClick={() => onToggleStatus(card.id)}>
                {card.status === 'active' ? 'Bloquear' : 'Activar'}
              </button>
              <button type="button" className="action-btn danger-btn" onClick={() => onDelete(card.id)}>
                Eliminar
              </button>
            </div>

            <div className="card-detail-toggle">
              <button
                type="button"
                className="card-link-button"
                onClick={() => setExpandedId(isExpanded ? null : card.id)}
              >
                {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
              </button>
            </div>

            {isExpanded && (
              <div className="card-detail-panel">
                <div className="card-detail-grid">
                  <div className="card-detail-item">
                    <span>ID tarjeta</span>
                    <strong>{card.id}</strong>
                  </div>
                  <div className="card-detail-item">
                    <span>Marca</span>
                    <strong>{card.cardBrand || 'N/D'}</strong>
                  </div>
                  <div className="card-detail-item">
                    <span>Utilizado hoy</span>
                    <strong>{formatCurrency(card.usedToday)}</strong>
                  </div>
                  <div className="card-detail-item">
                    <span>Creacion</span>
                    <strong>{formatDate(card.createdAt)}</strong>
                  </div>
                  <div className="card-detail-item">
                    <span>Actualizacion</span>
                    <strong>{formatDate(card.updatedAt)}</strong>
                  </div>
                  <div className="card-detail-item">
                    <span>Estado actual</span>
                    <strong>{statusMeta.label}</strong>
                  </div>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default CardList;
