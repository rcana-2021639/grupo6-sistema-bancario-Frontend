import { useState, useCallback } from "react";
import accountsClient from "../../../shared/api/accountsClient";
import transactionsClient from "../../../shared/api/transactionsClient";

export const useHome = () => {
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [accountsRes, txRes] = await Promise.allSettled([
                accountsClient.get("/accounts/me"),
                transactionsClient.get("/transaction", { params: { limit: 5 } }),
            ]);

            if (accountsRes.status === "fulfilled") {
                const raw = accountsRes.value.data;
                const data = raw?.data ?? raw ?? [];
                setAccounts(Array.isArray(data) ? data : []);
            }

            if (txRes.status === "fulfilled") {
                const raw = txRes.value.data;
                const data = raw?.data ?? raw ?? [];
                setTransactions(Array.isArray(data) ? data : []);
            }

            if (
                accountsRes.status === "rejected" &&
                txRes.status === "rejected"
            ) {
                setError("Error al cargar la información");
            }
        } catch (err) {
            setError(err.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    }, []);

    const wealthByCurrency = accounts.reduce((acc, acct) => {
        const currency = acct.currencyCode || "GTQ";
        acc[currency] = (acc[currency] || 0) + Number(acct.balance || 0);
        return acc;
    }, {});

    const primaryAccount =
        accounts.find((a) => a.status === "activa") || accounts[0] || null;

    const activeCount = accounts.filter((a) => a.status === "activa").length;

    return {
        accounts,
        transactions,
        loading,
        error,
        fetchData,
        wealthByCurrency,
        primaryAccount,
        activeCount,
    };
};
