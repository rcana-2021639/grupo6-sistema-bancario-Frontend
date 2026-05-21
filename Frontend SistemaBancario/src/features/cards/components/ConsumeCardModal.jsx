import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCardStore } from '../store/cardStore';
import { CURRENCIES } from '../../../shared/config/api';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import '../../../styles/cards.css';

const ConsumeCardModal = ({ card, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currencyCode: card.currencyCode || 'GTQ',
    description: '',
  });
  const [error, setError] = useState('');
  const { consume, loading } = useCardStore();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(formData.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    try {
      await consume(card.id, {
        amount,
        currencyCode: formData.currencyCode,
        description: formData.description.trim() || 'Consumo con tarjeta',
      });
      toast.success('Consumo registrado');
      onClose();
    } catch (err) {
      toast.error(err.message || 'No se pudo registrar el consumo');
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>Registrar consumo</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="info-box">
            <p>
              Disponible actual: {formatCompactMoney(card.availableBalance, card.currencyCode)}
            </p>
            <p title={getMoneyTitle(card.creditLimit || 60000, card.currencyCode)}>
              {card.cardType === 'credito' ? `Credito mensual maximo ${formatCompactMoney(card.creditLimit || 60000, card.currencyCode)}` : 'Debito contra balance de cuenta'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="consumeAmount">Monto *</label>
            <input
              id="consumeAmount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="consumeCurrency">Moneda *</label>
            <select
              id="consumeCurrency"
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              required
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="consumeDescription">Descripcion</label>
            <input
              id="consumeDescription"
              name="description"
              type="text"
              maxLength="200"
              value={formData.description}
              onChange={handleChange}
              placeholder="Compra, pago o consumo"
            />
          </div>

          {error && <span className="error">{error}</span>}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar consumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumeCardModal;
