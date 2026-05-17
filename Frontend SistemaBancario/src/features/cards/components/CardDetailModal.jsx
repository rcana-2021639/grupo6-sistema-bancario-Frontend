import { useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../../auth/services/authService';
import { getCardById } from '../services/cardService';
import '../../../styles/cards.css';

const formatCurrency = (amount) => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(amount || 0))
);

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

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      toast.error('Ingresa tu contrasena para ver el detalle');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyPassword(password);
      const fullCard = await getCardById(card.id);
      setVerifiedCard(fullCard);
      setPassword('');
      toast.success('Detalle desbloqueado');
    } catch (error) {
      toast.error(error.message || 'No se pudo verificar la contrasena');
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
              <label htmlFor="cardDetailPassword">Contrasena de tu cuenta *</label>
              <input
                id="cardDetailPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contrasena"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="info-box">
              <p>Por seguridad, el numero completo y CVV solo se muestran despues de verificar tu identidad.</p>
            </div>
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
                <strong>{formatCurrency(detailCard.availableBalance)}</strong>
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
