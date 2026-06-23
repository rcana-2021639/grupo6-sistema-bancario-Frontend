import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS } from "../../../shared/constants/endpoints";
import { useAuthStore } from "../../../shared/store/authStore";

const LEGACY_STORAGE_KEY = "lumina_benefits_redemptions_v1";

const benefitsClient = axios.create({
    baseURL: ENDPOINTS.BENEFITS,
    headers: { "Content-Type": "application/json" },
});

benefitsClient.interceptors.request.use(async (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
    failedQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(token),
    );
    failedQueue = [];
}

benefitsClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return benefitsClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const refreshToken = await SecureStore.getItemAsync("refreshToken");
                if (!refreshToken) throw new Error("No refresh token");
                const { data } = await axios.post(`${ENDPOINTS.AUTH}/refresh`, { refreshToken });
                useAuthStore.getState().setAccessToken(data.accessToken);
                await SecureStore.setItemAsync("refreshToken", data.refreshToken);
                processQueue(null, data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return benefitsClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await SecureStore.deleteItemAsync("refreshToken");
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);

export const benefitCatalog = [
    {
        id: "salon-lumina-50",
        title: "Salon Lumina",
        perk: "50% de descuento",
        category: "Belleza",
        description: "Descuento en corte, peinado o tratamiento capilar en salon aliado.",
        partner: "Salon Aurora",
        accent: "#f7cf5f",
        icon: "cut-outline",
    },
    {
        id: "cafe-bruma-2x1",
        title: "Cafe Bruma",
        perk: "2x1 en bebidas",
        category: "Gastronomia",
        description: "Bebida caliente o fria gratis al comprar una bebida participante.",
        partner: "Cafe Bruma",
        accent: "#5ee4a8",
        icon: "cafe-outline",
    },
    {
        id: "cine-nova-entrada",
        title: "Cine Nova",
        perk: "Entrada gratis",
        category: "Entretenimiento",
        description: "Una entrada general para funciones seleccionadas de lunes a jueves.",
        partner: "Cine Nova",
        accent: "#aeb6ff",
        icon: "film-outline",
    },
    {
        id: "fit-club-semana",
        title: "Fit Club",
        perk: "7 dias gratis",
        category: "Bienestar",
        description: "Acceso semanal a gimnasio, clases grupales y zona funcional.",
        partner: "Fit Club GT",
        accent: "#2dd4bf",
        icon: "barbell-outline",
    },
    {
        id: "book-house-30",
        title: "Book House",
        perk: "30% de descuento",
        category: "Educacion",
        description: "Descuento en libros seleccionados, papeleria premium y agendas.",
        partner: "Book House",
        accent: "#f97316",
        icon: "book-outline",
    },
    {
        id: "hotel-vento-brunch",
        title: "Hotel Vento",
        perk: "Brunch especial",
        category: "Experiencias",
        description: "Brunch de fin de semana para una persona con reservacion previa.",
        partner: "Hotel Vento",
        accent: "#60a5fa",
        icon: "restaurant-outline",
    },
];

const extractMessage = (error, fallback) => (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
);

export const getUserBenefitKey = (user = {}) => {
    const value = user.id || user.Id || user._id || user.userId || user.email || user.Email || user.username || user.Username;
    return String(value || "anonymous").trim().toLowerCase();
};

export const getMyBenefitState = async () => {
    try {
        const { data } = await benefitsClient.get("/me");
        return data?.data || { redemptions: [], remaining: 2, maxRedemptions: 2 };
    } catch (error) {
        throw new Error(extractMessage(error, "No se pudieron cargar los beneficios"));
    }
};

export const redeemBenefit = async ({ benefitId }) => {
    try {
        const { data } = await benefitsClient.post("/redeem", { benefitId });
        return {
            redemption: data?.redemption,
            userState: data?.data,
            alreadyRedeemed: Boolean(data?.alreadyRedeemed),
        };
    } catch (error) {
        throw new Error(extractMessage(error, "No se pudo canjear el beneficio"));
    }
};

export const resetBenefitsForUser = async ({ userIdentifier }) => {
    try {
        const { data } = await benefitsClient.post("/reset", { userIdentifier });
        return data?.data;
    } catch (error) {
        throw new Error(extractMessage(error, "No se pudo reiniciar el cupo"));
    }
};

export const migrateLegacyBenefitsForUser = async (user) => {
    const userKey = getUserBenefitKey(user);
    if (!userKey || userKey === "anonymous") return;

    let legacyState = {};
    try {
        legacyState = JSON.parse((await AsyncStorage.getItem(LEGACY_STORAGE_KEY)) || "{}");
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
                // The backend decides the final shared limit.
            }
        }
    }
};
