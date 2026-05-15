import { useState } from 'react';
import toast from 'react-hot-toast';
import '../../../styles/cards.css';

const DEFAULT_FORM = {
  accountNumber: '',
  cardType: 'debito',
  cvv: '',
  pin: '',
  expirationDate: '',
  availableBalance: 100,
  creditLimit: '',
  status: 'activa',
};

const toFormStatus = (status) => {
  const statusMap = {
    active: 'activa',
    blocked: 'bloqueada',
    inactive: 'cancelada',
    expired: 'vencida',
    activa: 'activa',
    bloqueada: 'bloqueada',
    cancelada: 'cancelada',
    vencida: 'vencida',
  };

  return statusMap[status] || 'activa';
};

const toMonthInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const buildInitialForm = (card) => {
  if (!card) return DEFAULT_FORM;

  return {
    accountNumber: card.accountNumber && card.accountNumber !== 'N/D' ? card.accountNumber : '',
    cardType: card.cardType || 'debito',
    cvv: card.cvv || '',
    pin: card.pin || '',
    expirationDate: toMonthInputValue(card.expirationDate),
    availableBalance: card.availableBalance ?? 100,
    creditLimit: card.creditLimit ?? '',
    status: toFormStatus(card.status),
  };
};

const toIsoExpirationDate = (monthValue) => {
  if (!monthValue) return '';
  return `${monthValue}-01T00:00:00.000Z`;
};

const CardForm = ({ card, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(() => buildInitialForm(card));
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(card);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.accountNumber.trim()) {
      nextErrors.accountNumber = 'El numero de cuenta es requerido';
    } else if (!/^[A-Za-z]{3}-\d{3}-\d{4}$/.test(formData.accountNumber.trim())) {
      nextErrors.accountNumber = 'La cuenta debe tener formato ABC-000-0000';
    }

    if (!formData.cvv.trim()) {
      nextErrors.cvv = 'El CVV es requerido';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      nextErrors.cvv = 'El CVV debe tener 3 o 4 dígitos';
    }

    if (!formData.pin.trim()) {
      nextErrors.pin = 'El PIN es requerido';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      nextErrors.pin = 'El PIN debe tener 4 dígitos';
    }

    if (!formData.expirationDate) {
      nextErrors.expirationDate = 'La fecha de vencimiento es requerida';
    }

    if (Number(formData.availableBalance) < 100) {
      nextErrors.availableBalance = 'El saldo disponible debe ser al menos 100';
    }

    if (formData.cardType === 'credito' && formData.creditLimit !== '' && Number(formData.creditLimit) < 0) {
      nextErrors.creditLimit = 'El limite de credito no puede ser negativo';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Revisa los campos obligatorios del formulario');
      return;
    }

    const payload = {
      accountNumber: formData.accountNumber.trim().toUpperCase(),
      cardType: formData.cardType,
      cvv: formData.cvv.trim(),
      pin: formData.pin.trim(),
      expirationDate: toIsoExpirationDate(formData.expirationDate),
      availableBalance: Number(formData.availableBalance),
      status: formData.status,
      creditLimit: formData.cardType === 'credito' && formData.creditLimit !== ''
        ? Number(formData.creditLimit)
        : 0,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      console.error('Error in card form submit:', error);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="card-form-modal" role="dialog" aria-modal="true">
        <header className="modal-header">
          <h2>{isEditing ? 'Editar tarjeta' : 'Nueva tarjeta'}</h2>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            X
          </button>
        </header>

        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label htmlFor="accountNumber">Numero de cuenta *</label>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              placeholder="ACC-000-0000"
              value={formData.accountNumber}
              onChange={handleChange}
              required
            />
            {errors.accountNumber && <span className="error">{errors.accountNumber}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cardType">Tipo de tarjeta *</label>
              <select
                id="cardType"
                name="cardType"
                value={formData.cardType}
                onChange={handleChange}
              >
                <option value="debito">Debito</option>
                <option value="credito">Credito</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="activa">Activa</option>
                <option value="bloqueada">Bloqueada</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cvv">CVV *</label>
              <input
                id="cvv"
                name="cvv"
                type="text"
                placeholder="000"
                value={formData.cvv}
                onChange={(event) => handleChange({
                  target: {
                    name: 'cvv',
                    value: event.target.value.replace(/\D/g, '').slice(0, 4),
                  },
                })}
                maxLength="4"
                required
              />
              {errors.cvv && <span className="error">{errors.cvv}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pin">PIN *</label>
              <input
                id="pin"
                name="pin"
                type="password"
                placeholder="1234"
                value={formData.pin}
                onChange={(event) => handleChange({
                  target: {
                    name: 'pin',
                    value: event.target.value.replace(/\D/g, '').slice(0, 4),
                  },
                })}
                maxLength="4"
                required
              />
              {errors.pin && <span className="error">{errors.pin}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expirationDate">Vencimiento *</label>
              <input
                id="expirationDate"
                name="expirationDate"
                type="month"
                value={formData.expirationDate}
                onChange={handleChange}
                required
              />
              {errors.expirationDate && <span className="error">{errors.expirationDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="availableBalance">Saldo disponible *</label>
              <input
                id="availableBalance"
                name="availableBalance"
                type="number"
                min="100"
                step="0.01"
                value={formData.availableBalance}
                onChange={handleChange}
                required
              />
              {errors.availableBalance && <span className="error">{errors.availableBalance}</span>}
            </div>
          </div>

          {formData.cardType === 'credito' && (
            <div className="form-group">
              <label htmlFor="creditLimit">Límite de crédito</label>
              <input
                id="creditLimit"
                name="creditLimit"
                type="number"
                min="0"
                step="100"
                value={formData.creditLimit}
                onChange={handleChange}
              />
              {errors.creditLimit && <span className="error">{errors.creditLimit}</span>}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Actualizar tarjeta' : 'Crear tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardForm;
