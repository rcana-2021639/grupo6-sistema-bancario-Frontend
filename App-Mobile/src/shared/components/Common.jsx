import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../constants/themes";

export const LoadingSpinner = ({ color = COLORS.gold, size = "large" }) => (
    <View style={styles.center}>
        <ActivityIndicator size={size} color={color} />
    </View>
);

export const EmptyState = ({ message = "No hay datos disponibles", icon }) => (
    <View style={styles.center}>
        {icon || null}
        <Text style={styles.emptyText}>{message}</Text>
    </View>
);

export const SkeletonBlock = ({ width = "100%", height = 20, style }) => (
    <View style={[styles.skeleton, { width, height }, style]} />
);

export const Card = ({ children, style }) => (
    <View style={[styles.card, style]}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: 150,
        gap: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginVertical: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    skeleton: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: BORDER_RADIUS.sm,
    },
    emptyText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textMuted,
        textAlign: "center",
    },
});
