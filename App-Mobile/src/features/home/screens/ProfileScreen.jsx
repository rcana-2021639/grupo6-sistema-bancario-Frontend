import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../shared/store/authStore";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    FONT_FAMILY,
    BORDER_RADIUS,
} from "../../../shared/constants/themes";

const ROLE_LABELS = {
    USER_ROLE: "Cliente privado",
    ADMIN_ROLE: "Administrador",
    MANAGER_ROLE: "Gerente",
    ATM_ROLE: "Cajero",
};

const ProfileScreen = () => {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const name = [user?.name, user?.surname].filter(Boolean).join(" ") || "Usuario";
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    const role = ROLE_LABELS[user?.role] || "Cliente";
    const hasAvatar =
        user?.profilePicture && !user.profilePicture.includes("DEFAULT_PROFILE");

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#03040a" />
            <View style={styles.container}>
                {/* Avatar */}
                <LinearGradient
                    colors={["#0b0f35", "#1a1040"]}
                    style={styles.avatarSection}
                >
                    <View style={styles.avatarRing}>
                        {hasAvatar ? (
                            <Image
                                source={{ uri: user.profilePicture }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <LinearGradient
                                colors={["#fff0c2", "#d59b2c"]}
                                style={styles.avatarGradient}
                            >
                                <Text style={styles.initialsText}>{initials}</Text>
                            </LinearGradient>
                        )}
                    </View>
                    <Text style={styles.userName}>{name}</Text>
                    {user?.username && (
                        <Text style={styles.userUsername}>@{user.username}</Text>
                    )}
                    <View style={styles.roleBadge}>
                        <Ionicons name="shield-checkmark-outline" size={13} color={COLORS.gold} />
                        <Text style={styles.roleText}>{role}</Text>
                    </View>
                </LinearGradient>

                {/* Info cards */}
                <View style={styles.infoSection}>
                    {user?.email && (
                        <InfoRow icon="mail-outline" label="Correo" value={user.email} />
                    )}
                    {user?.username && (
                        <InfoRow icon="person-outline" label="Usuario" value={`@${user.username}`} />
                    )}
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={logout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={20} color="#fb7185" />
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>

                {/* Brand */}
                <Text style={styles.brand}>LUMINA BANK</Text>
                <Text style={styles.brandSub}>Banca privada de alta calidad</Text>
            </View>
        </SafeAreaView>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
            <Ionicons name={icon} size={18} color={COLORS.gold} />
        </View>
        <View style={styles.infoText}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
                {value}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },
    avatarSection: {
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    avatarRing: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: COLORS.gold,
        overflow: "hidden",
        marginBottom: SPACING.md,
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    initialsText: {
        color: "#11120d",
        fontSize: FONT_SIZE.xxl,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "800",
    },
    userName: {
        color: COLORS.text,
        fontSize: FONT_SIZE.xl,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
        marginBottom: 4,
        textAlign: "center",
    },
    userUsername: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        marginBottom: SPACING.sm,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(234, 179, 8, 0.3)",
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    roleText: {
        color: COLORS.gold,
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    infoSection: {
        gap: SPACING.sm,
        marginBottom: SPACING.xl,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    infoValue: {
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        fontWeight: "600",
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        backgroundColor: "rgba(251, 113, 133, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(251, 113, 133, 0.25)",
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: 14,
        marginBottom: SPACING.xl,
    },
    logoutText: {
        color: "#fb7185",
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
    },
    brand: {
        color: "rgba(240, 205, 97, 0.3)",
        fontSize: 11,
        fontFamily: FONT_FAMILY.serif,
        letterSpacing: 5,
        textTransform: "uppercase",
        textAlign: "center",
        marginBottom: 4,
    },
    brandSub: {
        color: "rgba(255,255,255,0.15)",
        fontSize: 10,
        textAlign: "center",
        letterSpacing: 1,
    },
});

export default ProfileScreen;
