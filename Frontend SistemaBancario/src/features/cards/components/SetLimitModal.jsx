import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCardStore } from '../store/cardStore';
import '../../../styles/cards.css';

const SetLimitModal = ({ card, onClose }) => {
  const [dailyLimit, setDailyLimit] = useState(card.dailyLimit || 5000);
  const [errors, setErrors] = useState('');

  const { updateDailyLimit, loading } = useCardStore();

  const validateForm = () => {
    if (!dailyLimit || dailyLimit <= 0) {
      setErrors('El límite debe ser mayor a 0');
      return false;
    }
    if (dailyLimit > 999999) {
      setErrors('El límite no puede exceder 999,999');
      return false;
    }
    setErrors('');
    return true;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setDailyLimit(value ? Number(value) : '');
    setErrors('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateDailyLimit(card.id, dailyLimit);
      toast.success('Límite diario actualizado exitosamente');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el límite');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount || 0);
  };

  const presetLimits = [1000, 2500, 5000, 10000, 25000, 50000];

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>Establecer Límite Diario - {card.cardHolder}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="dailyLimit">Límite Diario (Q) *</label>
            <input
              id="dailyLimit"
              type="number"
              placeholder="Ingresa el límite"
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
              <span className="label">Límite Actual:</span>
              <span className="value">{formatCurrency(card.dailyLimit)}</span>
            </div>
            <div className="preview-item">
              <span className="label">Nuevo Límite:</span>
              <span className="value" style={{ color: '#0066cc', fontWeight: 'bold' }}>
                {formatCurrency(dailyLimit)}
              </span>
            </div>
            {dailyLimit > card.dailyLimit && (
              <div className="preview-item info">
                ↑ Aumento de {formatCurrency(dailyLimit - card.dailyLimit)}
              </div>
            )}
            {dailyLimit < card.dailyLimit && (
              <div className="preview-item warning">
                ↓ Reducción de {formatCurrency(card.dailyLimit - dailyLimit)}
              </div>
            )}
          </div>

          <div className="preset-limits">
            <p className="preset-label">Límites Predefinidos:</p>
            <div className="preset-buttons">
              {presetLimits.map((limit) => (
                <button
                  key={limit}
                  type="button"
                  className={`preset-btn ${dailyLimit === limit ? 'active' : ''}`}
                  onClick={() => setDailyLimit(limit)}
                >
                  {formatCurrency(limit)}
                </button>
              ))}
            </div>
          </div>

          <div className="info-box">
            <p>💡 El límite diario es el máximo que puedes gastar en un día natural (00:00 - 23:59)</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Actualizar Límite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetLimitModal;
