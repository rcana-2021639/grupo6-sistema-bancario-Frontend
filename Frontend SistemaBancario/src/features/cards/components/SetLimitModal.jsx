import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCardStore } from '../store/cardStore';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import '../../../styles/cards.css';

const SetLimitModal = ({ card, onClose }) => {
  const currentLimit = Number(card.creditLimit ?? card.dailyLimit ?? 0);
  const [creditLimit, setCreditLimit] = useState(currentLimit || 5000);
  const [errors, setErrors] = useState('');

  const { updateDailyLimit, loading } = useCardStore();

  const validateForm = () => {
    if (!creditLimit || creditLimit <= 0) {
      setErrors('El limite debe ser mayor a 0');
      return false;
    }
    setErrors('');
    return true;
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setCreditLimit(value ? Number(value) : '');
    setErrors('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      await updateDailyLimit(card.id, creditLimit);
      toast.success('Limite de tarjeta actualizado exitosamente');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el limite');
    }
  };

  const presetLimits = [1000, 2500, 5000, 10000, 25000, 50000];

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>Establecer limite de tarjeta - {card.cardHolder}</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="creditLimit">Limite de tarjeta (Q) *</label>
            <input
              id="creditLimit"
              type="number"
              placeholder="Ingresa el limite"
              value={creditLimit}
              onChange={handleChange}
              min="0"
              step="100"
              required
            />
            {errors && <span className="error">{errors}</span>}
          </div>

          <div className="limit-preview">
            <div className="preview-item">
              <span className="label">Limite actual:</span>
              <span className="value" title={getMoneyTitle(currentLimit)}>{formatCompactMoney(currentLimit)}</span>
            </div>
            <div className="preview-item">
              <span className="label">Nuevo limite:</span>
              <span className="value" style={{ color: '#0066cc', fontWeight: 'bold' }}>
                {formatCompactMoney(creditLimit)}
              </span>
            </div>
            {creditLimit > currentLimit && (
              <div className="preview-item info">
                Aumento de {formatCompactMoney(creditLimit - currentLimit)}
              </div>
            )}
            {creditLimit < currentLimit && (
              <div className="preview-item warning">
                Reduccion de {formatCompactMoney(currentLimit - creditLimit)}
              </div>
            )}
          </div>

          <div className="preset-limits">
            <p className="preset-label">Limites predefinidos:</p>
            <div className="preset-buttons">
              {presetLimits.map((limit) => (
                <button
                  key={limit}
                  type="button"
                  className={`preset-btn ${creditLimit === limit ? 'active' : ''}`}
                  onClick={() => setCreditLimit(limit)}
                >
                  {formatCompactMoney(limit)}
                </button>
              ))}
            </div>
          </div>

          <div className="info-box">
            <p>Este limite controla el monto disponible para operaciones de la tarjeta.</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar limite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetLimitModal;
