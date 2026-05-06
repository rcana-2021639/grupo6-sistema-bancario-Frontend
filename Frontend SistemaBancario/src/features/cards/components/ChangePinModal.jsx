import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCardStore } from '../store/cardStore';
import '../../../styles/cards.css';

const ChangePinModal = ({ card, onClose }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { updatePin, loading } = useCardStore();

  const validateForm = () => {
    const newErrors = {};

    if (!currentPin) {
      newErrors.currentPin = 'El PIN actual es requerido';
    } else if (!/^\d{4}$/.test(currentPin)) {
      newErrors.currentPin = 'El PIN debe tener 4 dígitos';
    }

    if (!newPin) {
      newErrors.newPin = 'El nuevo PIN es requerido';
    } else if (!/^\d{4}$/.test(newPin)) {
      newErrors.newPin = 'El PIN debe tener 4 dígitos';
    } else if (newPin === currentPin) {
      newErrors.newPin = 'El nuevo PIN debe ser diferente al actual';
    }

    if (!confirmPin) {
      newErrors.confirmPin = 'Por favor, confirma el nuevo PIN';
    } else if (confirmPin !== newPin) {
      newErrors.confirmPin = 'Los PINs no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updatePin(card.id, newPin, currentPin);
      toast.success('PIN actualizado exitosamente');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error al cambiar el PIN');
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-content" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>Cambiar PIN - {card.cardHolder}</h2>
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
            <label htmlFor="currentPin">PIN Actual *</label>
            <div className="password-input-wrapper">
              <input
                id="currentPin"
                type={showPassword ? 'text' : 'password'}
                placeholder="****"
                value={currentPin}
                onChange={(e) => {
                  setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  if (errors.currentPin) {
                    setErrors({ ...errors, currentPin: '' });
                  }
                }}
                maxLength="4"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar PIN' : 'Mostrar PIN'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.currentPin && <span className="error">{errors.currentPin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="newPin">Nuevo PIN *</label>
            <div className="password-input-wrapper">
              <input
                id="newPin"
                type={showPassword ? 'text' : 'password'}
                placeholder="****"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  if (errors.newPin) {
                    setErrors({ ...errors, newPin: '' });
                  }
                }}
                maxLength="4"
                required
              />
            </div>
            {errors.newPin && <span className="error">{errors.newPin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPin">Confirmar Nuevo PIN *</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPin"
                type={showPassword ? 'text' : 'password'}
                placeholder="****"
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  if (errors.confirmPin) {
                    setErrors({ ...errors, confirmPin: '' });
                  }
                }}
                maxLength="4"
                required
              />
            </div>
            {errors.confirmPin && <span className="error">{errors.confirmPin}</span>}
          </div>

          <div className="info-box">
            <p>⚠️ El PIN debe tener exactamente 4 dígitos numéricos</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Cambiar PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePinModal;
