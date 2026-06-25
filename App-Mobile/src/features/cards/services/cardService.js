import cardsClient from "../../../shared/api/cardsClient";

const extractMessage = (error, fallback) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    if (Array.isArray(message)) return message[0] || fallback;
    return message || fallback;
};

export const getMyCards = async () => {
    try {
        const { data } = await cardsClient.get("/cards/my");
        return data?.data || [];
    } catch (error) {
        throw new Error(extractMessage(error, "Error al obtener tus tarjetas"));
    }
};

export const getCardById = async (cardId) => {
    try {
        const { data } = await cardsClient.get(`/cards/${cardId}`);
        return data?.data || null;
    } catch (error) {
        throw new Error(extractMessage(error, "Error al obtener la tarjeta"));
    }
};

export const getCardMovements = async (cardId) => {
    try {
        const { data } = await cardsClient.get(`/cards/${cardId}/movements`);
        return data?.data || [];
    } catch (error) {
        throw new Error(extractMessage(error, "Error al obtener los movimientos"));
    }
};
