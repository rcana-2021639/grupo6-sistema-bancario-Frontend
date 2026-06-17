import { useState } from "react";
import authClient from "../../../shared/api/authClient.js";
import { useAuthStore } from "../../../shared/store/authStore.js";

const MOBILE_ONLY_ROLE = "USER_ROLE";
const WEB_ONLY_ROLES = ["ADMIN_ROLE", "ATM_ROLE", "MANAGER_ROLE"];
export const WEB_ONLY_MESSAGE = "La vista administrativa se ve únicamente en la web";
const WEB_ONLY_IDENTIFIERS = ["adminb", "adminb@sistemabancario.local"];
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const decodeBase64Url = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const input = normalized + padding;
    let output = "";

    for (let index = 0; index < input.length; index += 4) {
        const encoded1 = BASE64_CHARS.indexOf(input[index]);
        const encoded2 = BASE64_CHARS.indexOf(input[index + 1]);
        const encoded3 = BASE64_CHARS.indexOf(input[index + 2]);
        const encoded4 = BASE64_CHARS.indexOf(input[index + 3]);

        const byte1 = (encoded1 << 2) | (encoded2 >> 4);
        const byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        const byte3 = ((encoded3 & 3) << 6) | encoded4;

        output += String.fromCharCode(byte1);
        if (input[index + 2] !== "=") output += String.fromCharCode(byte2);
        if (input[index + 3] !== "=") output += String.fromCharCode(byte3);
    }

    return decodeURIComponent(
        output.split("").map((character) => (
            `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`
        )).join("")
    );
};

const getJwtPayload = (token) => {
    try {
        const payload = token?.split(".")?.[1];
        return payload ? JSON.parse(decodeBase64Url(payload)) : null;
    } catch {
        return null;
    }
};

const getUserRoles = (user) => {
    if (!user) return [];

    const directRoles = [
        user.role,
        user.roleName,
        user.Role,
        user.RoleName,
    ];

    const arrayRoles = Array.isArray(user.roles)
        ? user.roles
        : Array.isArray(user.UserRoles)
            ? user.UserRoles.map((userRole) => userRole.Role?.Name || userRole.role || userRole.name)
            : [];

    return [...directRoles, ...arrayRoles]
        .filter(Boolean)
        .map((role) => String(role).trim().toUpperCase());
};

const getEffectiveRole = ({ user, token, responseData } = {}) => {
    const tokenPayload = getJwtPayload(token);
    return [
        responseData?.userDetails?.role,
        responseData?.data?.role,
        responseData?.role,
        user?.role,
        user?.Role?.Name,
        tokenPayload?.role,
        tokenPayload?.Role?.Name,
    ]
        .filter(Boolean)
        .map((role) => String(role).trim().toUpperCase())[0] || "";
};

export const isWebOnlyUser = ({ user, token, credentials, responseData } = {}) => {
    const tokenPayload = getJwtPayload(token);
    const responseRole = getEffectiveRole({ user, token, responseData });
    const candidateRoles = [
        ...getUserRoles(user),
        ...getUserRoles(tokenPayload),
        ...getUserRoles(responseData),
        ...getUserRoles(responseData?.data),
        responseRole,
    ].filter(Boolean).map((role) => String(role).trim().toUpperCase());

    const hasUserRole = candidateRoles.includes(MOBILE_ONLY_ROLE);
    const hasWebOnlyRole = candidateRoles.some((role) => WEB_ONLY_ROLES.includes(role));
    const loginIdentifier = String(credentials?.emailOrUsername || "").trim().toLowerCase();
    const userIdentifiers = [
        user?.username,
        user?.email,
        user?.Email,
        tokenPayload?.username,
        tokenPayload?.email,
        responseData?.username,
        responseData?.email,
        responseData?.data?.username,
        responseData?.data?.email,
    ].filter(Boolean).map((value) => String(value).trim().toLowerCase());

    const isBlockedIdentifier = WEB_ONLY_IDENTIFIERS.includes(loginIdentifier) ||
        userIdentifiers.some((identifier) => WEB_ONLY_IDENTIFIERS.includes(identifier));

    return !hasUserRole || hasWebOnlyRole || isBlockedIdentifier;
};

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const login = useAuthStore((state) => state.login);

    const handleLogin = async (data) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authClient.post("/login", {
                ...data,
                source: "mobile",
            });
            const { token, userDetails } = response.data;

            if (!token) {
                throw new Error("Token no recibido desde el servidor");
            }

            if (isWebOnlyUser({
                user: userDetails,
                token,
                credentials: data,
                responseData: response.data,
            })) {
                throw new Error(WEB_ONLY_MESSAGE);
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

            const response = await authClient.post("/forgot-password", { email, source: "mobile" });
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
