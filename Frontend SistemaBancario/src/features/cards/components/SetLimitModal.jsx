import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCardStore } from '../store/cardStore';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import '../../../styles/cards.css';

const SetLimitModal = ({ card, onClose }) => {
  const [dailyLimit, setDailyLimit] = useState(card.dailyLimit || 5000);
  const [errors, setErrors] = useState('');

  const { updateDailyLimit, loading } = useCardStore();

  const validateForm = () => {
    if (!dailyLimit || dailyLimit <= 0) {
      setErrors('El limite debe ser mayor a 0');
      return false;
    }
    if (dailyLimit > 999999) {
      setErrors('El limite no puede exceder 999,999');
      return false;
    }
    setErrors('');
    return true;
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setDailyLimit(value ? Number(value) : '');
    setErrors('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      await updateDailyLimit(card.id, dailyLimit);
      toast.success('Límite diario actualizado exitosamente');
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
          <h2>Establecer limite diario - {card.cardHolder}</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Cerrar">
            X
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="dailyLimit">Límite diario (Q) *</label>
            <input
              id="dailyLimit"
              type="number"
              placeholder="Ingresa el limite"
              value={dailyLimit}
              onChange={handleChange}
              min="0"
              step="100"
              required
            />
            {errors && <span className="error">{errors}</span>}
          </div>

          <div className="limit-preview">
            <div className="preview-item">
              <span className="label">Límite actual:</span>
              <span className="value" title={getMoneyTitle(card.dailyLimit)}>{formatCompactMoney(card.dailyLimit)}</span>
            </div>
            <div className="preview-item">
              <span className="label">Nuevo limite:</span>
              <span className="value" style={{ color: '#0066cc', fontWeight: 'bold' }}>
                {formatCompactMoney(dailyLimit)}
              </span>
            </div>
            {dailyLimit > card.dailyLimit && (
              <div className="preview-item info">
                Aumento de {formatCompactMoney(dailyLimit - card.dailyLimit)}
              </div>
            )}
            {dailyLimit < card.dailyLimit && (
              <div className="preview-item warning">
                Reduccion de {formatCompactMoney(card.dailyLimit - dailyLimit)}
              </div>
            )}
          </div>

          <div className="preset-limits">
            <p className="preset-label">Límites predefinidos:</p>
            <div className="preset-buttons">
              {presetLimits.map((limit) => (
                <button
                  key={limit}
                  type="button"
                  className={`preset-btn ${dailyLimit === limit ? 'active' : ''}`}
                  onClick={() => setDailyLimit(limit)}
                >
                  {formatCompactMoney(limit)}
                </button>
              ))}
            </div>
          </div>

          <div className="info-box">
            <p>El limite diario es el maximo que puedes gastar en un dia natural (00:00 - 23:59).</p>
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
