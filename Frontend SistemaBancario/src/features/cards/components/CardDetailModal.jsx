import { useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../../auth/services/authService';
import { getCardById } from '../services/cardService';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import '../../../styles/cards.css';

const formatDate = (value) => {
  if (!value) return 'N/D';
  return new Date(value).toLocaleDateString('es-GT');
};

const formatCardNumber = (cardNumber) => (
  String(cardNumber || '').replace(/(\d{4})(?=\d)/g, '$1 ').trim() || 'N/D'
);

const CardDetailModal = ({ card, onClose }) => {
  const [password, setPassword] = useState('');
  const [verifiedCard, setVerifiedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      toast.error('Ingresa tu contrasena para ver el detalle');
      return;
    }

    try {
      setLoading(true);
      setVerifyError('');
      await authService.verifyPassword(password);
      const fullCard = await getCardById(card.id);
      setVerifiedCard(fullCard);
      setPassword('');
      toast.success('Detalle desbloqueado');
    } catch (error) {
      const message = error.message || 'No se pudo verificar la contrasena';
      setVerifyError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const detailCard = verifiedCard || card;

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>Detalle de tarjeta</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </header>

        {!verifiedCard ? (
          <form onSubmit={handleVerify} className="modal-form">
            <div className="form-group">
              <label htmlFor="cardDetailPassword">Contrasena de inicio de sesion *</label>
              <input
                id="cardDetailPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="La misma contrasena que usas para iniciar sesion"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="info-box">
              <p>Usa tu contrasena de inicio de sesion. No es el PIN de la tarjeta.</p>
            </div>
            {verifyError && <div className="warning-box">{verifyError}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Verificando...' : 'Ver detalle'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card-detail-panel is-unlocked">
            <div className="card-detail-grid">
              <div className="card-detail-item">
                <span>Numero de tarjeta</span>
                <strong>{formatCardNumber(detailCard.cardNumber)}</strong>
              </div>
              <div className="card-detail-item">
                <span>CVV</span>
                <strong>{detailCard.cvv || 'N/D'}</strong>
              </div>
              <div className="card-detail-item">
                <span>Cuenta</span>
                <strong>{detailCard.accountNumber || 'N/D'}</strong>
              </div>
              <div className="card-detail-item">
                <span>Tipo</span>
                <strong>{detailCard.cardType || 'N/D'}</strong>
              </div>
              <div className="card-detail-item">
                <span>Saldo disponible</span>
                <strong title={getMoneyTitle(detailCard.availableBalance, detailCard.currencyCode)}>{formatCompactMoney(detailCard.availableBalance, detailCard.currencyCode)}</strong>
              </div>
              <div className="card-detail-item">
                <span>Vence</span>
                <strong>{formatDate(detailCard.expirationDate)}</strong>
              </div>
              <div className="card-detail-item">
                <span>Estado</span>
                <strong>{detailCard.status || 'N/D'}</strong>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDetailModal;
