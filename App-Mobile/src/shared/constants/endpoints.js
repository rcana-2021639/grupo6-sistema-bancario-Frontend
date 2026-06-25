const AUTH_URL = process.env.EXPO_PUBLIC_AUTH_URL || "http://localhost:3005/api/v1/auth";

export const ENDPOINTS = {
    AUTH: AUTH_URL,
    BENEFITS: AUTH_URL.replace(/\/auth\/?$/, "/benefits"),
    ACCOUNTS: process.env.EXPO_PUBLIC_ACCOUNTS_URL || "http://localhost:3008/api/v1",
    TRANSACTIONS: process.env.EXPO_PUBLIC_TRANSACTIONS_URL || "http://localhost:3011/api/v1",
    PRODUCTS: process.env.EXPO_PUBLIC_PRODUCTS_URL || "http://localhost:3009/api/v1",
};

export const CURRENCIES = {
    GTQ: { symbol: "Q", name: "Quetzal guatemalteco" },
    MXN: { symbol: "$", name: "Peso mexicano" },
    COP: { symbol: "$", name: "Peso colombiano" },
    USD: { symbol: "$", name: "Dolar estadounidense" },
    EUR: { symbol: "EUR", name: "Euro" },
    HNL: { symbol: "L", name: "Lempira hondureno" },
    PEN: { symbol: "S/", name: "Sol peruano" },
    JPY: { symbol: "JPY", name: "Yen japones" },
};
