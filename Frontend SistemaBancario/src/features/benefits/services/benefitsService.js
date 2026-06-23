import axios from 'axios';
import { API_URLS, TOKEN_KEY } from '../../../shared/config/api';

const LEGACY_STORAGE_KEY = 'lumina_benefits_redemptions_v1';

const benefitsApi = axios.create({
  baseURL: `${API_URLS.AUTH}/benefits`,
  headers: { 'Content-Type': 'application/json' },
});

benefitsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const benefitCatalog = [
  {
    id: 'salon-lumina-50',
    title: 'Salon Lumina',
    perk: '50% de descuento',
    category: 'Belleza',
    description: 'Descuento en corte, peinado o tratamiento capilar en salon aliado.',
    partner: 'Salon Aurora',
    accent: '#f7cf5f',
  },
  {
    id: 'cafe-bruma-2x1',
    title: 'Cafe Bruma',
    perk: '2x1 en bebidas',
    category: 'Gastronomia',
    description: 'Bebida caliente o fria gratis al comprar una bebida participante.',
    partner: 'Cafe Bruma',
    accent: '#5ee4a8',
  },
  {
    id: 'cine-nova-entrada',
    title: 'Cine Nova',
    perk: 'Entrada gratis',
    category: 'Entretenimiento',
    description: 'Una entrada general para funciones seleccionadas de lunes a jueves.',
    partner: 'Cine Nova',
    accent: '#a855f7',
  },
  {
    id: 'fit-club-semana',
    title: 'Fit Club',
    perk: '7 dias gratis',
    category: 'Bienestar',
    description: 'Acceso semanal a gimnasio, clases grupales y zona funcional.',
    partner: 'Fit Club GT',
    accent: '#2dd4bf',
  },
  {
    id: 'book-house-30',
    title: 'Book House',
    perk: '30% de descuento',
    category: 'Educacion',
    description: 'Descuento en libros seleccionados, papeleria premium y agendas.',
    partner: 'Book House',
    accent: '#f97316',
  },
  {
    id: 'hotel-vento-brunch',
    title: 'Hotel Vento',
    perk: 'Brunch especial',
    category: 'Experiencias',
    description: 'Brunch de fin de semana para una persona con reservacion previa.',
    partner: 'Hotel Vento',
    accent: '#60a5fa',
  },
];

export const getUserBenefitKey = (user = {}) => {
  const value = user.id || user.Id || user._id || user.userId || user.email || user.Email || user.username || user.Username;
  return String(value || 'anonymous').trim().toLowerCase();
};

export const getUserDisplayName = (user = {}) => (
  user.name || user.Name || user.username || user.Username || user.email || user.Email || 'Usuario'
);

const normalizeApiError = (error, fallback) => {
  const message = error.response?.data?.message || error.message;
  return new Error(message || fallback);
};

export const getMyBenefitState = async () => {
  try {
    const response = await benefitsApi.get('/me');
    return response.data.data;
  } catch (error) {
    throw normalizeApiError(error, 'No se pudieron cargar los beneficios');
  }
};

export const getBenefitStateForUser = async (userIdentifier) => {
  try {
    const response = await benefitsApi.get(`/user/${encodeURIComponent(userIdentifier)}`);
    return response.data.data;
  } catch (error) {
    throw normalizeApiError(error, 'No se pudieron cargar los beneficios del usuario');
  }
};

export const redeemBenefit = async ({ benefitId }) => {
  try {
    const response = await benefitsApi.post('/redeem', { benefitId });
    return {
      redemption: response.data.redemption,
      userState: response.data.data,
      alreadyRedeemed: Boolean(response.data.alreadyRedeemed),
    };
  } catch (error) {
    throw normalizeApiError(error, 'No se pudo canjear el beneficio');
  }
};

export const resetBenefitsForUser = async ({ userIdentifier }) => {
  try {
    const response = await benefitsApi.post('/reset', { userIdentifier });
    return response.data.data;
  } catch (error) {
    throw normalizeApiError(error, 'No se pudo reiniciar el cupo');
  }
};

export const migrateLegacyBenefitsForUser = async (user) => {
  const userKey = getUserBenefitKey(user);
  if (!userKey || userKey === 'anonymous') return;

  let legacyState = {};
  try {
    legacyState = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '{}');
  } catch {
    legacyState = {};
  }

  const redemptions = legacyState[userKey]?.redemptions;
  if (!Array.isArray(redemptions) || redemptions.length === 0) return;

  for (const redemption of redemptions) {
    if (redemption?.benefitId) {
      try {
        await redeemBenefit({ benefitId: redemption.benefitId });
      } catch {
        // If the centralized limit is already reached, the backend remains the source of truth.
      }
    }
  }
};
