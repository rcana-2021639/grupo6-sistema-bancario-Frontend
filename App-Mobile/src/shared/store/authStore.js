import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            login: async (accessToken, user, refreshToken) => {
                set({
                    token: accessToken,
                    user,
                    isAuthenticated: true,
                });

                if (refreshToken) {
                    await SecureStore.setItemAsync("refreshToken", refreshToken);
                }
            },

            setAccessToken: (token) => set({ token }),

            logout: async () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
                await SecureStore.deleteItemAsync("refreshToken");
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
