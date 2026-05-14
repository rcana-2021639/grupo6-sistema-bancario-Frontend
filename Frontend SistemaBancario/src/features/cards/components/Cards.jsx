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
import AnimatedTitle from '../../../shared/components/AnimatedTitle';
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

const formatCurrency = (amount) => (
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(amount || 0))
);

const resolveCardPayload = async (cardData) => {
  const account = await getAccountByAccountNumber(cardData.accountNumber);

  if (!account?.userId) {
    throw new Error('No se pudo resolver el usuario de la cuenta seleccionada');
  }

  return {
    userId: account.userId,
    cardType: cardData.cardType,
    cvv: cardData.cvv,
    pin: cardData.pin,
    expirationDate: cardData.expirationDate,
    availableBalance: cardData.availableBalance,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountMap, setAccountMap] = useState({});

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

  const handleDeleteCard = async (cardId) => {
    if (!canManageCards) {
      toast.error('Solo un administrador puede eliminar tarjetas');
      return;
    }

    if (!window.confirm('Estas seguro de que deseas eliminar esta tarjeta?')) return;

    try {
      await removeCard(cardId);
      toast.success('Tarjeta eliminada exitosamente');
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

  const summary = useMemo(() => ({
    total: cards.length,
    active: cards.filter((card) => card.status === 'active').length,
    blocked: cards.filter((card) => card.status === 'blocked').length,
    balance: cards.reduce((sum, card) => sum + Number(card.availableBalance || 0), 0),
  }), [cards]);

  return (
    <section className="cards-page">
      <div className="cards-shell">
        <header className="cards-topbar">
          <div className="cards-topbar-copy">
            <p className="cards-kicker">{canManageCards ? 'Registro de tarjetas' : 'Mis tarjetas'}</p>
            <AnimatedTitle>Gestion de tarjetas</AnimatedTitle>
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
            <strong>{formatCurrency(summary.balance)}</strong>
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
              onChangePin={handleShowChangePin}
              onSetLimit={handleShowSetLimit}
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
    </section>
  );
};

export default Cards;
