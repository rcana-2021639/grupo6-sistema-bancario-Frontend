export const ENDPOINTS = {
    AUTH: process.env.EXPO_PUBLIC_AUTH_URL || "http://localhost:3005/api/v1/auth",
    ACCOUNTS: process.env.EXPO_PUBLIC_ACCOUNTS_URL || "http://localhost:3008/api/v1",
    TRANSACTIONS: process.env.EXPO_PUBLIC_TRANSACTIONS_URL || "http://localhost:3010/api/v1",
};
