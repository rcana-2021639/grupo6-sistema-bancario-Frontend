import { create } from 'zustand';
import {
  getAllCards,
  getMyCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  updateCardStatus,
  setCardLimit,
  consumeCard,
  changeCardPin,
  getCardMovements,
  searchCards,
} from '../services/cardService';

export const useCardStore = create((set) => ({
  cards: [],
  selectedCard: null,
  movements: [],
  loading: false,
  error: null,
  searchQuery: '',

  // Cargar todas las tarjetas
  fetchAllCards: async () => {
    set({ loading: true, error: null });
    try {
      const cards = await getAllCards();
      set({ cards, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Cargar tarjetas del usuario
  fetchMyCards: async () => {
    set({ loading: true, error: null });
    try {
      const cards = await getMyCards();
      set({ cards, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Obtener tarjeta por ID
  fetchCardById: async (cardId) => {
    set({ loading: true, error: null });
    try {
      const card = await getCardById(cardId);
      set({ selectedCard: card, loading: false });
      return card;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Crear nueva tarjeta
  addCard: async (cardData) => {
    set({ loading: true, error: null });
    try {
      const newCard = await createCard(cardData);
      set((state) => ({
        cards: [...state.cards, newCard],
        loading: false,
      }));
      return newCard;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Actualizar tarjeta
  editCard: async (cardId, cardData) => {
    set({ loading: true, error: null });
    try {
      const updatedCard = await updateCard(cardId, cardData);
      set((state) => ({
        cards: state.cards.map((card) => (card.id === cardId ? updatedCard : card)),
        selectedCard: state.selectedCard?.id === cardId ? updatedCard : state.selectedCard,
        loading: false,
      }));
      return updatedCard;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Eliminar tarjeta
  removeCard: async (cardId) => {
    set({ loading: true, error: null });
    try {
      await deleteCard(cardId);
      set((state) => ({
        cards: state.cards.filter((card) => card.id !== cardId),
        selectedCard: state.selectedCard?.id === cardId ? null : state.selectedCard,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Cambiar estado de tarjeta (activa/bloqueada)
  toggleStatus: async (cardId) => {
    set({ loading: true, error: null });
    try {
      const currentCard = useCardStore.getState().cards.find((card) => card.id === cardId);
      const nextStatus = currentCard?.status === 'active' ? 'blocked' : 'active';
      const updatedCard = await updateCardStatus(cardId, nextStatus);
      set((state) => ({
        cards: state.cards.map((card) => (card.id === cardId ? updatedCard : card)),
        selectedCard: state.selectedCard?.id === cardId ? updatedCard : state.selectedCard,
        loading: false,
      }));
      return updatedCard;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  setStatus: async (cardId, status) => {
    set({ loading: true, error: null });
    try {
      const updatedCard = await updateCardStatus(cardId, status);
      set((state) => ({
        cards: state.cards.map((card) => (card.id === cardId ? updatedCard : card)),
        selectedCard: state.selectedCard?.id === cardId ? updatedCard : state.selectedCard,
        loading: false,
      }));
      return updatedCard;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Establecer límite diario
  updateDailyLimit: async (cardId, dailyLimit) => {
    set({ loading: true, error: null });
    try {
      const updatedCard = await setCardLimit(cardId, dailyLimit);
      set((state) => ({
        cards: state.cards.map((card) => (card.id === cardId ? updatedCard : card)),
        selectedCard: state.selectedCard?.id === cardId ? updatedCard : state.selectedCard,
        loading: false,
      }));
      return updatedCard;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  consume: async (cardId, consumeData) => {
    set({ loading: true, error: null });
    try {
      const result = await consumeCard(cardId, consumeData);
      const updatedCard = result.card;
      set((state) => ({
        cards: updatedCard
          ? state.cards.map((card) => (card.id === cardId ? updatedCard : card))
          : state.cards,
        selectedCard: updatedCard && state.selectedCard?.id === cardId ? updatedCard : state.selectedCard,
        loading: false,
      }));
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Cambiar PIN
  updatePin: async (cardId, newPin, currentPin) => {
    set({ loading: true, error: null });
    try {
      const updatedCard = await changeCardPin(cardId, newPin, currentPin);
      set((state) => ({
        cards: state.cards.map((card) => (card.id === cardId ? updatedCard : card)),
        selectedCard: state.selectedCard?.id === cardId ? updatedCard : state.selectedCard,
        loading: false,
      }));
      return updatedCard;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Obtener movimientos de tarjeta
  fetchMovements: async (cardId) => {
    set({ loading: true, error: null });
    try {
      const movements = await getCardMovements(cardId);
      set({ movements, loading: false });
      return movements;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Buscar tarjetas
  searchForCards: async (query) => {
    set({ loading: true, error: null, searchQuery: query });
    try {
      const cards = await searchCards(query);
      set({ cards, loading: false });
      return cards;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Limpiar error
  clearError: () => set({ error: null }),

  // Resetear estado
  reset: () => set({
    cards: [],
    selectedCard: null,
    movements: [],
    loading: false,
    error: null,
    searchQuery: '',
  }),
}));
