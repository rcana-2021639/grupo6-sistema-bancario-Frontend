import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useCardStore } from '../store/cardStore';
import { useAuthStore } from '../../auth/store/authStore';
import { isAdminRole } from '../../../shared/utils/roles';
import {
  getAccountByAccountNumber,
  getAllAccounts,
  getMyAccounts as getMyAccountsService,
} from '../../accounts/services/accountService';
import CardForm from './CardForm';
import CardList from './CardList';
import MovementsModal from './MovementsModal';
import ChangePinModal from './ChangePinModal';
import SetLimitModal from './SetLimitModal';
import SpendingDetailsModal from './SpendingDetailsModal';
import CardDetailModal from './CardDetailModal';
import ConsumeCardModal from './ConsumeCardModal';
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
import { formatCompactMoney, getMoneyTitle } from '../../../shared/utils/money';
import '../../../styles/cards.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
  { value: 'blocked', label: 'Bloqueadas' },
  { value: 'expired', label: 'Vencidas' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activar' },
  { value: 'blocked', label: 'Bloquear' },
  { value: 'inactive', label: 'Cancelar' },
];

const resolveCardPayload = async (cardData) => {
  const account = await getAccountByAccountNumber(cardData.accountNumber);

  if (!account?.userId) {
    throw new Error('No se pudo resolver el usuario de la cuenta seleccionada');
  }

  return {
    userId: account.userId,
    accountNumber: account.accountNumber,
    cardType: cardData.cardType,
    cvv: cardData.cvv,
    pin: cardData.pin,
    expirationDate: cardData.expirationDate,
    status: cardData.status,
    ...(cardData.creditLimit !== undefined ? { creditLimit: cardData.creditLimit } : {}),
  };
};

const Cards = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showMovements, setShowMovements] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showSetLimit, setShowSetLimit] = useState(false);
  const [showSpendingDetails, setShowSpendingDetails] = useState(false);
  const [showCardDetail, setShowCardDetail] = useState(false);
  const [showConsumeCard, setShowConsumeCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountMap, setAccountMap] = useState({});
  const [pendingDeleteCard, setPendingDeleteCard] = useState(null);

  const {
    cards,
    loading,
    error,
    fetchAllCards,
    fetchMyCards,
    addCard,
    editCard,
    removeCard,
    setStatus,
    clearError,
  } = useCardStore();

  const { user } = useAuthStore();
  const canManageCards = isAdminRole(user?.role);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const [, accountsResult] = await Promise.all([
          canManageCards ? fetchAllCards() : fetchMyCards(),
          canManageCards ? getAllAccounts() : getMyAccountsService(),
        ]);

        const accounts = accountsResult || [];
        const nextAccountMap = accounts.reduce((accumulator, account) => {
          if (account?.userId && account?.accountNumber && !accumulator[account.userId]) {
            accumulator[account.userId] = account.accountNumber;
          }
          return accumulator;
        }, {});

        setAccountMap(nextAccountMap);
      } catch {
        toast.error('Error al cargar las tarjetas');
      }
    };

    loadCards();
  }, [fetchAllCards, fetchMyCards, canManageCards]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [clearError, error]);

  const handleAddCard = async (cardData) => {
    if (!canManageCards) {
      toast.error('Solo un administrador puede crear tarjetas');
      return;
    }

    try {
      const payload = await resolveCardPayload(cardData);
      await addCard(payload);
      toast.success('Tarjeta creada exitosamente');
      setShowForm(false);
    } catch (err) {
      toast.error(err.message || 'Error al crear la tarjeta');
    }
  };

  const handleEditCard = async (cardData) => {
    if (!canManageCards) {
      toast.error('Solo un administrador puede editar tarjetas');
      return;
    }

    try {
      const payload = await resolveCardPayload(cardData);
      await editCard(editingCard.id, payload);
      toast.success('Tarjeta actualizada exitosamente');
      setEditingCard(null);
      setShowForm(false);
    } catch (err) {
      toast.error(err.message || 'Error al actualizar la tarjeta');
    }
  };

  const handleDeleteCard = (card) => {
    if (!canManageCards) {
      toast.error('Solo un administrador puede eliminar tarjetas');
      return;
    }

    setPendingDeleteCard(card);
  };

  const confirmDeleteCard = async () => {
    if (!pendingDeleteCard) return;

    try {
      await removeCard(pendingDeleteCard.id);
      toast.success('Tarjeta eliminada exitosamente');
      setPendingDeleteCard(null);
    } catch (err) {
      toast.error(err.message || 'Error al eliminar la tarjeta');
    }
  };

  const handleChangeStatus = async (cardId, status) => {
    try {
      await setStatus(cardId, status);
      toast.success('Estado de la tarjeta actualizado');
    } catch (err) {
      toast.error(err.message || 'Error al cambiar el estado');
    }
  };

  const handleViewMovements = async (card) => {
    try {
      setEditingCard(card);
      setShowSpendingDetails(true);
    } catch (err) {
      toast.error(err.message || 'Error al cargar los movimientos');
    }
  };

  const handleShowChangePin = (card) => {
    setEditingCard(card);
    setShowChangePin(true);
  };

  const handleShowSetLimit = (card) => {
    setEditingCard(card);
    setShowSetLimit(true);
  };

  const handleCloseModals = () => {
    setShowForm(false);
    setShowMovements(false);
    setShowChangePin(false);
    setShowSetLimit(false);
    setShowSpendingDetails(false);
    setShowCardDetail(false);
    setShowConsumeCard(false);
    setPendingDeleteCard(null);
    setEditingCard(null);
  };

  const filteredCards = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return cards.filter((card) => {
      const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
      const matchesSearch = !normalizedTerm || [
        card.cardNumber,
        card.cardHolder,
        card.cardBrand,
        card.accountNumber,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedTerm));

      return matchesStatus && matchesSearch;
    });
  }, [cards, searchTerm, statusFilter]);

  const cardsWithAccounts = useMemo(() => (
    filteredCards.map((card) => ({
      ...card,
      accountNumber: card.accountNumber && card.accountNumber !== 'N/D'
        ? card.accountNumber
        : accountMap[card.userId] || 'N/D',
    }))
  ), [accountMap, filteredCards]);

  const summary = useMemo(() => {
    const balanceByCurrency = cards.reduce((accumulator, card) => {
      const currency = card.currencyCode || 'GTQ';
      accumulator[currency] = (accumulator[currency] || 0) + Number(card.availableBalance || 0);
      return accumulator;
    }, {});

    return {
      total: cards.length,
      active: cards.filter((card) => card.status === 'active').length,
      blocked: cards.filter((card) => card.status === 'blocked').length,
      balanceByCurrency,
    };
  }, [cards]);

  return (
    <section className="cards-page">
      <div className="cards-shell">
        <header className="cards-topbar">
          <div className="cards-topbar-copy">
            <p className="cards-kicker">{canManageCards ? 'Registro de tarjetas' : 'Mis tarjetas'}</p>
            <AnimatedTitle>Gestión de tarjetas</AnimatedTitle>
            <p>
              {canManageCards
                ? 'Administra tarjetas bancarias, consulta movimientos y controla PIN, limites y estado desde un solo lugar.'
                : 'Consulta tus tarjetas, revisa movimientos y administra tu PIN y estado operativo.'}
            </p>
          </div>

          {canManageCards && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingCard(null);
                setShowForm(true);
              }}
            >
              Agregar tarjeta
            </button>
          )}
        </header>

        <section className="cards-stats">
          <article className="cards-stat">
            <span>Total tarjetas</span>
            <strong>{summary.total}</strong>
          </article>
          <article className="cards-stat">
            <span>Activas</span>
            <strong>{summary.active}</strong>
          </article>
          <article className="cards-stat">
            <span>Bloqueadas</span>
            <strong>{summary.blocked}</strong>
          </article>
          <article className="cards-stat">
            <span>Saldo disponible</span>
            {Object.entries(summary.balanceByCurrency).map(([currency, amount]) => (
              <strong key={currency} title={getMoneyTitle(amount, currency)}>{formatCompactMoney(amount, currency)}</strong>
            ))}
          </article>
        </section>

        <section className="cards-toolbar-panel">
          <div className="cards-toolbar-search">
            <label htmlFor="card-search">Buscar tarjeta</label>
            <input
              id="card-search"
              type="text"
              className="cards-search-input"
              placeholder="Numero, titular, marca o cuenta"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="cards-toolbar-actions">
            <div className="cards-filter-group">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`btn btn-filter ${statusFilter === filter.value ? 'is-active' : ''}`}
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="cards-toolbar-buttons">
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="cards-list-panel">
          <div className="cards-list-header">
            <div>
              <h2>Listado de tarjetas</h2>
              <p>
                {searchTerm
                  ? `Mostrando ${cardsWithAccounts.length} resultado(s) para "${searchTerm}".`
                  : 'Vista general de tarjetas disponibles.'}
              </p>
            </div>
            <span>{cardsWithAccounts.length} tarjeta(s) visibles</span>
          </div>

          {loading && <div className="cards-state">Cargando tarjetas...</div>}

          {!loading && cardsWithAccounts.length === 0 && (
            <div className="cards-state cards-empty">
              <strong>
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron tarjetas con esos filtros.'
                  : 'No hay tarjetas registradas.'}
              </strong>
              <p>
                {searchTerm || statusFilter !== 'all'
                  ? 'Prueba con otra busqueda o cambia el filtro de estado.'
                  : 'Agrega una tarjeta para comenzar a administrar este modulo.'}
              </p>
            </div>
          )}

          {!loading && cardsWithAccounts.length > 0 && (
            <CardList
              cards={cardsWithAccounts}
              onEdit={(card) => {
                setEditingCard(card);
                setShowForm(true);
              }}
              onDelete={handleDeleteCard}
              onChangeStatus={handleChangeStatus}
              onViewMovements={handleViewMovements}
              onConsume={(card) => {
                setEditingCard(card);
                setShowConsumeCard(true);
              }}
              onChangePin={handleShowChangePin}
              onSetLimit={handleShowSetLimit}
              onViewDetails={(card) => {
                setEditingCard(card);
                setShowCardDetail(true);
              }}
              canManageCards={canManageCards}
              statusOptions={STATUS_OPTIONS}
            />
          )}
        </section>
      </div>

      {showForm && canManageCards && (
        <CardForm
          card={editingCard}
          onSubmit={editingCard ? handleEditCard : handleAddCard}
          onClose={handleCloseModals}
        />
      )}

      {showMovements && editingCard && (
        <MovementsModal card={editingCard} onClose={handleCloseModals} />
      )}

      {showChangePin && editingCard && (
        <ChangePinModal card={editingCard} onClose={handleCloseModals} />
      )}

      {showSetLimit && editingCard && (
        <SetLimitModal card={editingCard} onClose={handleCloseModals} />
      )}

      {showSpendingDetails && editingCard && (
        <SpendingDetailsModal card={editingCard} onClose={handleCloseModals} />
      )}

      {showCardDetail && editingCard && (
        <CardDetailModal card={editingCard} onClose={handleCloseModals} />
      )}

      {showConsumeCard && editingCard && (
        <ConsumeCardModal card={editingCard} onClose={handleCloseModals} />
      )}

      {pendingDeleteCard && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-content confirm-card-modal" role="dialog" aria-modal="true">
            <header className="modal-header">
              <h2>Eliminar tarjeta</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setPendingDeleteCard(null)}
                aria-label="Cerrar"
              >
                X
              </button>
            </header>
            <div className="modal-body">
              <p className="modal-subtitle">
                Estas seguro de eliminar esta tarjeta? Esta accion no se puede deshacer.
              </p>
              <div className="delete-card-summary">
                <strong>{pendingDeleteCard.cardBrand || 'Tarjeta'}</strong>
                <span>{pendingDeleteCard.cardNumber || pendingDeleteCard.accountNumber || 'Sin numero'}</span>
              </div>
            </div>
            <footer className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setPendingDeleteCard(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary danger-confirm-btn" onClick={confirmDeleteCard} disabled={loading}>
                {loading ? 'Eliminando...' : 'Eliminar tarjeta'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default Cards;
