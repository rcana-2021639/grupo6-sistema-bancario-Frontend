import reportingClient from "../../../shared/api/reportingClient";

const extractMessage = (error, fallback) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    if (Array.isArray(message)) return message[0] || fallback;
    return message || fallback;
};

export const sendAccountStatementByEmail = async ({ accountNumber, periodStart, periodEnd }) => {
    try {
        const params = {};

        if (periodStart) params.periodStart = periodStart;
        if (periodEnd) params.periodEnd = periodEnd;

        const { data } = await reportingClient.get(`/accountStatements/account/${accountNumber}/pdf`, {
            params,
        });

        return {
            message: data?.message || "Historial de cuenta enviado correctamente",
            data: data?.data || null,
        };
    } catch (error) {
        throw new Error(extractMessage(error, "No se pudo enviar el historial de cuenta"));
    }
};
