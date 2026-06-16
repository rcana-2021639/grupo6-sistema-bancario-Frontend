import { useState } from "react";
import authClient from "../../../shared/api/authClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);

    const handleLogin = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authClient.post("/login", data);
            const { token, userDetails } = response.data;

            if (!token) {
                throw new Error("Token no recibido desde el servidor");
            }

            await login(token, userDetails || null);
            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message || err.message || "Error al iniciar sesion";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authClient.post("/forgot-password", { email });
            return response.data;
        } catch (err) {
            const message =
                err.response?.data?.message || err.message || "Error al enviar la solicitud";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, handleForgotPassword, loading, error };
};
