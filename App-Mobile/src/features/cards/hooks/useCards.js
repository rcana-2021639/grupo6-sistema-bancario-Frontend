import { useState, useCallback } from "react";
import authClient from "../../../shared/api/authClient";
import { getMyCards, getCardById } from "../services/cardService";

export const useCards = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchCards = useCallback(async ({ silent } = {}) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const result = await getMyCards();
            setCards(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCards({ silent: true });
        setRefreshing(false);
    }, [fetchCards]);

    const handleViewDetail = useCallback(async (cardId, password) => {
        await authClient.post("/verify-password", { password });
        const fullCard = await getCardById(cardId);
        return fullCard;
    }, []);

    return {
        cards,
        loading,
        refreshing,
        error,
        fetchCards,
        refresh,
        handleViewDetail,
    };
};
