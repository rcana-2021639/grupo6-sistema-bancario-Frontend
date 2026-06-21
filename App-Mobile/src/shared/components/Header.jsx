import { View, Text, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../constants/themes";
import { getGreeting, formatCompact } from "../utils/money";

const ROLE_LABELS = {
    USER_ROLE: "Cliente privado",
    ADMIN_ROLE: "Administrador",
    MANAGER_ROLE: "Gerente",
    ATM_ROLE: "Cajero",
};

const Header = ({ primaryAccount }) => {
    const insets = useSafeAreaInsets();
    const user = useAuthStore((s) => s.user);

    const fullName =
        [user?.name, user?.surname].filter(Boolean).join(" ").trim() ||
        user?.username ||
        "Cliente";
    const firstName = fullName.split(" ")[0];

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "U";

    const hasAvatar =
        user?.profilePicture &&
        !String(user.profilePicture).includes("DEFAULT_PROFILE");

    const roleLabel = ROLE_LABELS[user?.role] || "Cliente";
    const greeting = getGreeting();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.row}>
                {/* Avatar con anillo dorado y glow */}
                <View style={styles.avatarGlow}>
                    <LinearGradient
                        colors={[COLORS.goldGradientStart, COLORS.goldGradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatarRing}
                    >
                        <View style={styles.avatarInner}>
                            {hasAvatar ? (
                                <Image
                                    source={{ uri: user.profilePicture }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.initialsText}>{initials}</Text>
                            )}
                        </View>
                    </LinearGradient>
                    <View style={styles.onlineDot} />
                </View>

                {/* Saludo + nombre */}
                <View style={styles.greetingBlock}>
                    <Text style={styles.greetingText}>{greeting},</Text>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {firstName}
                    </Text>
                    <View style={styles.rolePill}>
                        <Ionicons
                            name="shield-checkmark"
                            size={10}
                            color={COLORS.gold}
                        />
                        <Text style={styles.rolePillText}>{roleLabel}</Text>
                    </View>
                </View>

                {/* Chip de saldo (solo si hay cuenta principal) */}
                {primaryAccount && (
                    <View style={styles.balanceChip}>
                        <Text style={styles.balanceChipLabel}>Disponible</Text>
                        <Text style={styles.balanceChipValue}>
                            {formatCompact(
                                primaryAccount.balance,
                                primaryAccount.currencyCode,
                            )}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#03040a",
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(240, 205, 97, 0.1)",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.md,
    },
    avatarGlow: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarRing: {
        width: 52,
        height: 52,
        borderRadius: 26,
        padding: 2.5,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInner: {
        flex: 1,
        width: "100%",
        borderRadius: 24,
        backgroundColor: "#120a26",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    initialsText: {
        color: COLORS.goldLight,
        fontSize: FONT_SIZE.lg,
        fontWeight: "800",
        fontFamily: FONT_FAMILY.serif,
    },
    onlineDot: {
        position: "absolute",
        bottom: 1,
        right: 1,
        width: 13,
        height: 13,
        borderRadius: 7,
        backgroundColor: COLORS.success,
        borderWidth: 2.5,
        borderColor: "#03040a",
    },
    greetingBlock: {
        flex: 1,
        gap: 2,
    },
    greetingText: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
        fontWeight: "500",
        letterSpacing: 0.3,
    },
    nameText: {
        color: COLORS.text,
        fontSize: FONT_SIZE.xl,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    rolePill: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 4,
        marginTop: 3,
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(234, 179, 8, 0.28)",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    rolePillText: {
        color: COLORS.gold,
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 0.6,
        textTransform: "uppercase",
    },
    balanceChip: {
        alignItems: "flex-end",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(234, 179, 8, 0.3)",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    balanceChipLabel: {
        color: "rgba(240, 205, 97, 0.6)",
        fontSize: 8,
        fontWeight: "800",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    balanceChipValue: {
        color: COLORS.goldLight,
        fontSize: FONT_SIZE.md,
        fontWeight: "800",
        marginTop: 1,
    },
});

export default Header;
