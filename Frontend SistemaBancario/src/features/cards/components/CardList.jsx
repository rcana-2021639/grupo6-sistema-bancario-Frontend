import '../../../styles/cards.css';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';

const STATUS_META = {
  active: { label: 'Activa', tone: 'is-active' },
  inactive: { label: 'Inactiva', tone: 'is-inactive' },
  blocked: { label: 'Bloqueada', tone: 'is-blocked' },
  expired: { label: 'Vencida', tone: 'is-expired' },
};

const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '**** **** **** ****';
  const normalized = String(cardNumber).replace(/\D/g, '');
  return `**** **** **** ${normalized.slice(-4)}`;
};

const CardList = ({
  cards,
  onEdit,
  onDelete,
  onChangeStatus,
  onViewMovements,
  onConsume,
  onChangePin,
  onSetLimit,
  onViewDetails,
  canManageCards = false,
  statusOptions = [],
}) => {
  return (
    <div className="cards-grid">
      {cards.map((card) => {
        const statusMeta = STATUS_META[card.status] || STATUS_META.inactive;
        const cardLimit = Number(card.creditLimit ?? card.dailyLimit ?? 0);
        const remainingToday = Math.max(0, cardLimit - Number(card.usedToday || 0));
        const isCredit = card.cardType === 'credito';
        const balanceLabel = isCredit ? 'Monto maximo de Q 60,000' : 'Monto total de la cuenta';

        return (
          <article
            key={card.id}
            className={`card-record ${statusMeta.tone}`}
          >
            <div className="credit-card-face">
              <div className="card-visual-glow" aria-hidden="true" />
              <div className="credit-card-top">
                <span className={`card-status-pill ${statusMeta.tone}`}>
                  {statusMeta.label}
                </span>
                <p className="card-record-brand">{card.cardBrand || 'VISA'}</p>
              </div>

              <div className="card-chip-row" aria-hidden="true">
                <span className="card-chip" />
                <span className="card-wave" />
              </div>

              <h3 className="credit-card-number">{formatCardNumber(card.cardNumber)}</h3>

              <div className="credit-card-bottom">
                <div>
                  <span>Titular</span>
                  <strong>{card.cardHolder || 'Sin titular'}</strong>
                </div>
                <div>
                  <span>Vence</span>
                  <strong>{card.expiryDate || 'N/D'}</strong>
                </div>
              </div>
            </div>

            <div className="card-balance-box">
              <span>{balanceLabel}</span>
              <strong title={getMoneyTitle(card.availableBalance, card.currencyCode)}>
                {formatCompactMoney(card.availableBalance, card.currencyCode)}
              </strong>
            </div>

            <div className="card-mini-grid">
              <div className="card-mini-item">
                <span>Cuenta</span>
                <strong>{card.accountNumber || 'N/D'}</strong>
              </div>
              <div className="card-mini-item">
                <span>Tipo</span>
                <strong>{card.cardType || card.cardBrand || 'N/D'}</strong>
              </div>
              <div className="card-mini-item">
                <span>{canManageCards ? 'Limite' : 'Estado'}</span>
                <strong title={canManageCards ? getMoneyTitle(cardLimit) : undefined}>
                  {canManageCards ? formatCompactMoney(cardLimit) : statusMeta.label}
                </strong>
              </div>
              <div className="card-mini-item">
                <span>{canManageCards ? 'Disponible' : 'Vence'}</span>
                <strong title={canManageCards ? getMoneyTitle(remainingToday) : undefined}>
                  {canManageCards ? formatCompactMoney(remainingToday) : card.expiryDate || 'N/D'}
                </strong>
              </div>
            </div>

            <div className="card-action-tray">
              <div className="card-action-grid">
                <button type="button" className="action-btn" onClick={() => onViewMovements(card)}>
                  Movimientos
                </button>
                <button type="button" className="action-btn" onClick={() => onConsume(card)}>
                  Consumo
                </button>
                {canManageCards && (
                  <button type="button" className="action-btn" onClick={() => onEdit(card)}>
                    Editar
                  </button>
                )}
                {canManageCards && (
                  <button type="button" className="action-btn" onClick={() => onSetLimit(card)}>
                    Limite
                  </button>
                )}
                <button type="button" className="action-btn" onClick={() => onChangePin(card)}>
                  PIN
                </button>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="action-btn"
                    disabled={card.status === option.value}
                    onClick={() => onChangeStatus(card.id, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
                {canManageCards && (
                  <button type="button" className="action-btn danger-btn" onClick={() => onDelete(card)}>
                    Eliminar
                  </button>
                )}
              </div>

              <button
                type="button"
                className="card-link-button"
                onClick={() => onViewDetails(card)}
              >
                Ver detalle
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default CardList;
