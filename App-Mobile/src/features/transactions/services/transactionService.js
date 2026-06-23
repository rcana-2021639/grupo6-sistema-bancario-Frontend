import transactionsClient from "../../../shared/api/transactionsClient";

const extractMessage = (error, fallback) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    if (Array.isArray(message)) return message[0] || fallback;
    return message || fallback;
};

export const getTransactions = async ({ page = 1, limit = 25, status = "exitosa" } = {}) => {
    try {
        const { data } = await transactionsClient.get("/transaction", {
            params: { page, limit, status },
        });

        return {
            transactions: data?.data || [],
            pagination: data?.pagination || null,
        };
    } catch (error) {
        throw new Error(extractMessage(error, "Error al obtener las transacciones"));
    }
};

export const getFavorites = async () => {
    try {
        const { data } = await transactionsClient.get("/transaction/favorites");
        return data?.data || [];
    } catch (error) {
        throw new Error(extractMessage(error, "Error al obtener favoritos"));
    }
};

export const createTransfer = async (transferData) => {
    try {
        const { data } = await transactionsClient.post("/transaction/create", {
            ...transferData,
            transactionType: "transferencia",
        });
        return data?.data;
    } catch (error) {
        throw new Error(extractMessage(error, "Error al crear la transferencia"));
    }
};

export const cancelTransaction = async (transactionId, payload = {}) => {
    try {
        const { data } = await transactionsClient.delete(`/transaction/${transactionId}`, {
            data: payload,
        });
        return data?.data;
    } catch (error) {
        throw new Error(extractMessage(error, "Error al cancelar la transaccion"));
    }
};
