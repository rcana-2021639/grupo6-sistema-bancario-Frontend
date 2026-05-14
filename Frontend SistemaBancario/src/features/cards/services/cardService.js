import { API_ENDPOINTS, getAuthHeaders } from '../../../shared/config/api';
import { parseFetchResponse } from '../../../shared/utils/apiError';

const request = async (path, options = {}, fallbackMessage = 'Error en la solicitud') => {
  const response = await fetch(`${API_ENDPOINTS.CARDS.BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  return parseFetchResponse(response, fallbackMessage);
};

const normalizeStatus = (status) => {
  const statusMap = {
    activa: 'active',
    bloqueada: 'blocked',
    cancelada: 'inactive',
    vencida: 'expired',
  };

  return statusMap[status] || status;
};

const denormalizeStatus = (status) => {
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

  return statusMap[status] || status;
};

const normalizeCard = (card) => {
  if (!card) return card;

  return {
    ...card,
    id: card.id || card._id,
    status: normalizeStatus(card.status),
    expiryDate: card.expirationDate
      ? new Intl.DateTimeFormat('es-GT', {
        month: '2-digit',
        year: '2-digit',
        timeZone: 'UTC',
      }).format(new Date(card.expirationDate))
      : '',
    expirationDate: card.expirationDate,
    cardBrand: card.cardBrand || String(card.cardType || '').toUpperCase(),
    cardHolder: card.cardHolder || card.userId || 'Sin titular',
    dailyLimit: card.dailyLimit ?? card.creditLimit ?? 0,
    accountNumber: card.accountNumber || 'N/D',
    usedToday: card.usedToday ?? 0,
  };
};

const normalizeCardList = (cards) => (cards || []).map(normalizeCard);

const buildUpdatePayload = (cardData) => ({
  ...cardData,
  ...(cardData.status ? { status: denormalizeStatus(cardData.status) } : {}),
});

export const getAllCards = async () => {
  try {
    const data = await request(
      `${API_ENDPOINTS.CARDS.GET_ALL}?status=`,
      { method: 'GET' },
      'Error al obtener las tarjetas',
    );

    return normalizeCardList(data.data);
  } catch (error) {
    console.error('Error fetching all cards:', error);
    throw error;
  }
};

export const getMyCards = async () => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.GET_MY,
      { method: 'GET' },
      'Error al obtener tus tarjetas',
    );

    return normalizeCardList(data.data);
  } catch (error) {
    console.error('Error fetching my cards:', error);
    throw error;
  }
};

export const getCardById = async (cardId) => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.GET_BY_ID(cardId),
      { method: 'GET' },
      'Error al obtener la tarjeta',
    );

    return normalizeCard(data.data);
  } catch (error) {
    console.error('Error fetching card:', error);
    throw error;
  }
};

export const createCard = async (cardData) => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(buildUpdatePayload(cardData)),
      },
      'Error al crear la tarjeta',
    );

    return normalizeCard(data.data);
  } catch (error) {
    console.error('Error creating card:', error);
    throw error;
  }
};

export const updateCard = async (cardId, cardData) => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.UPDATE(cardId),
      {
        method: 'PUT',
        body: JSON.stringify(buildUpdatePayload(cardData)),
      },
      'Error al actualizar la tarjeta',
    );

    return normalizeCard(data.data);
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

export const deleteCard = async (cardId) => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.DELETE(cardId),
      { method: 'DELETE' },
      'Error al eliminar la tarjeta',
    );

    return data.data;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

export const updateCardStatus = async (cardId, status) => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.STATUS(cardId),
      {
        method: 'PATCH',
        body: JSON.stringify({ status: denormalizeStatus(status) }),
      },
      'Error al cambiar el estado de la tarjeta',
    );

    return normalizeCard(data.data);
  } catch (error) {
    console.error('Error updating card status:', error);
    throw error;
  }
};

export const setCardLimit = async (cardId, creditLimit) => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.SET_LIMIT(cardId),
      {
        method: 'PATCH',
        body: JSON.stringify({ creditLimit: Number(creditLimit) }),
      },
      'Error al actualizar el limite de la tarjeta',
    );

    return normalizeCard(data.data);
  } catch (error) {
    console.error('Error setting card limit:', error);
    throw error;
  }
};

export const changeCardPin = async (cardId, newPin, currentPin = '') => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.CHANGE_PIN(cardId),
      {
        method: 'PATCH',
        body: JSON.stringify({ pin: newPin, currentPin }),
      },
      'Error al cambiar el PIN de la tarjeta',
    );

    return normalizeCard(data.data);
  } catch (error) {
    console.error('Error changing card PIN:', error);
    throw error;
  }
};

export const getCardMovements = async (cardId) => {
  try {
    const data = await request(
      API_ENDPOINTS.CARDS.GET_MOVEMENTS(cardId),
      { method: 'GET' },
      'Error al obtener los movimientos de la tarjeta',
    );

    return data.data || [];
  } catch (error) {
    console.error('Error fetching card movements:', error);
    throw error;
  }
};

export const searchCards = async (query) => {
  try {
    const params = new URLSearchParams({ search: query, status: '' });
    const data = await request(
      `${API_ENDPOINTS.CARDS.GET_ALL}?${params}`,
      { method: 'GET' },
      'Error al buscar tarjetas',
    );

    return normalizeCardList(data.data);
  } catch (error) {
    console.error('Error searching cards:', error);
    throw error;
  }
};
