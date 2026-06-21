import { useState, useCallback } from "react";
import accountsClient from "../../../shared/api/accountsClient";

export const useAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchAccounts = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            setError(null);
            const response = await accountsClient.get("/accounts/me");
            const raw = response.data;
            const data = raw?.data ?? raw ?? [];
            setAccounts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Error al cargar cuentas",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAccounts({ silent: true });
    }, [fetchAccounts]);

    const totalBalance = accounts.reduce((sum, a) => {
        if (a.currencyCode === "GTQ") return sum + Number(a.balance || 0);
        return sum;
    }, 0);

    const activeCount = accounts.filter((a) => a.status === "activa").length;

    return {
        accounts,
        loading,
        refreshing,
        error,
        fetchAccounts,
        refresh,
        totalBalance,
        activeCount,
    };
};
