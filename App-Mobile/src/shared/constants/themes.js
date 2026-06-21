import { Platform } from "react-native";

export const COLORS = {
    // Fondos
    background: "#03040a",
    surface: "#080916",
    surfaceElevated: "#0b0f35",
    surfaceCard: "rgba(8,12,48,0.88)",

    // Dorados
    gold: "#eab308",
    goldLight: "#fff1b8",
    goldDeep: "#b7791f",
    goldGradientStart: "#fff0c2",
    goldGradientEnd: "#d59b2c",

    // Textos
    text: "#f7f4eb",
    textMuted: "#b8b0a0",
    textSilver: "#d7dded",
    textGold: "#fff1b8",

    // Estado
    success: "#5ee4a8",
    danger: "#fb7185",
    warning: "#fbbf24",

    // Bordes
    border: "rgba(240, 205, 97, 0.2)",
    borderBlue: "rgba(76, 88, 158, 0.5)",
    borderGold: "rgba(255, 241, 184, 0.72)",

    // Pills de estado
    statusActive: "#5ee4a8",
    statusInactive: "#aeb6ff",
    statusBlocked: "#fb7185",
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FONT_SIZE = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    huge: 36,
};

export const FONT_FAMILY = {
    serif: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    sans: Platform.select({ ios: "System", android: "Roboto", default: "System" }),
};

export const SHADOWS = {
    gold: {
        shadowColor: "#eab308",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 4,
    },
    dark: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    sm: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
};

export const BORDER_RADIUS = {
    sm: 5,
    md: 10,
    lg: 16,
    xl: 24,
    full: 999,
};
