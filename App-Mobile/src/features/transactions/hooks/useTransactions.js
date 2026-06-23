import { useCallback, useMemo, useState } from "react";
import accountsClient from "../../../shared/api/accountsClient";
import {
    cancelTransaction,
    createTransfer,
    getFavorites,
    getTransactions,
} from "../services/transactionService";

const ACCOUNT_REGEX = /^ACC-\d{3}-\d{4}$/;

const normalizeAccount = (value) => String(value || "").trim().toUpperCase();

const isCancelableTransaction = (transaction) => {
    if (transaction?.status !== "exitosa") return false;
    const createdAt = new Date(transaction.createdAt || transaction.transactionDate || transaction.date).getTime();
    return Boolean(createdAt) && Date.now() - createdAt <= 30 * 60 * 1000;
};

const validateAccountNumber = (accountNumber, label) => {
    const value = normalizeAccount(accountNumber);
    if (!value) return `${label} es requerida.`;
    if (!ACCOUNT_REGEX.test(value)) return `${label} debe tener formato ACC-000-0000.`;
    return "";
};

const validateAmount = (amount) => {
    const numericAmount = Number(amount);
    if (!String(amount).trim()) return "El monto es requerido.";
    if (Number.isNaN(numericAmount) || numericAmount < 0.01) {
        return "El monto debe ser mayor o igual a 0.01.";
    }
    return "";
};

export const validateCancelReason = (reason) => {
    const value = String(reason || "").trim();
    if (value.length < 8) return "Escribe un motivo de al menos 8 caracteres.";
    if (value.length > 200) return "El motivo no puede exceder 200 caracteres.";
    return "";
};

export const useTransactions = () => {
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const activeAccounts = useMemo(
        () => accounts.filter((account) => account.status === "activa"),
        [accounts],
    );

    const totals = useMemo(() => ({
        count: transactions.length,
        transfers: transactions.filter((item) => item.transactionType === "transferencia").length,
        received: transactions.filter((item) =>
            activeAccounts.some((account) => account.accountNumber === item.destinationAccountNumber),
        ).length,
    }), [activeAccounts, transactions]);

    const fetchData = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            setError("");

            const [accountsRes, txRes, favoritesRes] = await Promise.allSettled([
                accountsClient.get("/accounts/me"),
                getTransactions({ limit: 25, status: "exitosa" }),
                getFavorites(),
            ]);

            if (accountsRes.status === "fulfilled") {
                const raw = accountsRes.value.data;
                const data = raw?.data ?? raw ?? [];
                setAccounts(Array.isArray(data) ? data : []);
            } else {
                setAccounts([]);
            }

            if (txRes.status === "fulfilled") {
                setTransactions(Array.isArray(txRes.value.transactions) ? txRes.value.transactions : []);
            } else {
                setTransactions([]);
                setError(txRes.reason?.message || "No se pudo cargar el historial.");
            }

            setFavorites(favoritesRes.status === "fulfilled" && Array.isArray(favoritesRes.value)
                ? favoritesRes.value
                : []);
        } catch (err) {
            setError(err.message || "No se pudo cargar la informacion.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData({ silent: true });
    }, [fetchData]);

    const submitTransfer = useCallback(async (form) => {
        const sourceAccountNumber = normalizeAccount(form.sourceAccountNumber);
        const destinationAccountNumber = normalizeAccount(form.destinationAccountNumber);
        const amountError = validateAmount(form.amount);
        if (amountError) throw new Error(amountError);

        const sourceError = validateAccountNumber(sourceAccountNumber, "La cuenta origen");
        if (sourceError) throw new Error(sourceError);

        const destinationError = validateAccountNumber(destinationAccountNumber, "La cuenta destino");
        if (destinationError) throw new Error(destinationError);

        if (sourceAccountNumber === destinationAccountNumber) {
            throw new Error("La cuenta origen y destino no pueden ser la misma.");
        }

        try {
            setSaving(true);
            const transfer = await createTransfer({
                sourceAccountNumber,
                destinationAccountNumber,
                amount: Number(form.amount),
                currencyCode: form.currencyCode,
                description: form.description.trim() || "Transferencia bancaria",
                favorito: Boolean(form.favorito),
                alias: form.favorito ? form.alias.trim() : "",
            });

            if (transfer) {
                setTransactions((current) => [transfer, ...current].slice(0, 25));
            }
            await fetchData({ silent: true });
            return transfer;
        } finally {
            setSaving(false);
        }
    }, [fetchData]);

    const submitCancel = useCallback(async (transaction, reason) => {
        if (!isCancelableTransaction(transaction)) {
            throw new Error("Solo puedes cancelar transacciones exitosas dentro de 30 minutos.");
        }

        const reasonError = validateCancelReason(reason);
        if (reasonError) throw new Error(reasonError);

        try {
            setSaving(true);
            await cancelTransaction(transaction._id || transaction.id, {
                cancelReason: reason.trim(),
            });
            await fetchData({ silent: true });
        } finally {
            setSaving(false);
        }
    }, [fetchData]);

    return {
        accounts,
        activeAccounts,
        transactions,
        favorites,
        totals,
        loading,
        refreshing,
        saving,
        error,
        fetchData,
        refresh,
        submitTransfer,
        submitCancel,
        isCancelableTransaction,
        normalizeAccount,
    };
};
