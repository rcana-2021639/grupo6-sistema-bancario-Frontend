import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, BORDER_RADIUS } from "../../../shared/constants/themes";
import { formatCompact } from "../../../shared/utils/money";
import { useAuthStore } from "../../../shared/store/authStore";

const STATUS_META = {
    activa: { label: "Activa", color: "#5ee4a8" },
    activo: { label: "Activa", color: "#5ee4a8" },
    bloqueada: { label: "Bloqueada", color: "#fb7185" },
    cancelada: { label: "Cancelada", color: "#aeb6ff" },
    vencida: { label: "Vencida", color: "#fbbf24" },
};

const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return "**** **** **** ****";
    const normalized = String(cardNumber).replace(/\D/g, "");
    return `**** **** **** ${normalized.slice(-4)}`;
};

const formatExpiry = (dateStr) => {
    if (!dateStr) return "N/D";
    try {
        const d = new Date(dateStr);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = String(d.getFullYear()).slice(-2);
        return `${mm}/${yy}`;
    } catch {
        return "N/D";
    }
};

const CardItem = ({ card, onViewDetail, onViewMovements }) => {
    const user = useAuthStore(state => state.user);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const statusMeta = STATUS_META[card.status] || STATUS_META.activa;
    const isCredit = card.cardType === "credito";

    const pressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 180, friction: 8 }).start();
    const pressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 8 }).start();

    return (
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
                <LinearGradient
                    colors={["#0b0f35", "#1a1040", "#080916"]}
                    start={{ x: 0.05, y: 0 }}
                    end={{ x: 0.95, y: 1 }}
                    style={styles.gradient}
                >
                    <View style={styles.glowGold} />
                    <View style={styles.glowPurple} />

                    <View style={styles.topRow}>
                        <Text style={styles.brand}>{card.cardBrand || "VISA"}</Text>
                        <View style={[styles.statusPill, { borderColor: `${statusMeta.color}4d`, backgroundColor: `${statusMeta.color}1a` }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                            <Text style={[styles.statusLabel, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                        </View>
                    </View>

                    <View style={styles.chipRow}>
                        <View style={styles.chip}>
                            <View style={styles.chipLine} />
                            <View style={styles.chipLine} />
                        </View>
                        <View style={styles.wave}>
                            {[0, 1, 2].map((i) => (
                                <View key={i} style={[styles.waveBar, { opacity: 0.6 - i * 0.15 }]} />
                            ))}
                        </View>
                    </View>

                    <Text style={styles.cardNumber}>{formatCardNumber(card.cardNumber)}</Text>

                    <View style={styles.bottomRow}>
                        <View>
                            <Text style={styles.label}>Titular</Text>
                            <Text style={styles.value}>{card.cardHolder || user?.name || user?.username || "Sin titular"}</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Vence</Text>
                            <Text style={styles.value}>{formatExpiry(card.expirationDate)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />
                </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoSection}>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>
                        {isCredit ? "Limite disponible" : "Saldo disponible"}
                    </Text>
                    <Text style={styles.balanceValue}>
                        {formatCompact(card.availableBalance, card.currencyCode)}
                    </Text>
                </View>

                <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Cuenta</Text>
                        <Text style={styles.metaValue}>{card.accountNumber || "N/D"}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Tipo</Text>
                        <Text style={styles.metaValue}>{card.cardType || "N/D"}</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={onViewDetail} activeOpacity={0.7}>
                        <Ionicons name="eye-outline" size={15} color={COLORS.gold} />
                        <Text style={styles.actionText}>Ver detalle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={onViewMovements} activeOpacity={0.7}>
                        <Ionicons name="swap-horizontal-outline" size={15} color={COLORS.gold} />
                        <Text style={styles.actionText}>Movimientos</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

const chipSize = 34;

const styles = StyleSheet.create({
    card: {
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    gradient: {
        padding: SPACING.md,
        position: "relative",
        overflow: "hidden",
    },
    glowGold: {
        position: "absolute",
        top: -40,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(234,179,8,0.08)",
    },
    glowPurple: {
        position: "absolute",
        bottom: -20,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(139,92,246,0.06)",
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    brand: {
        fontSize: FONT_SIZE.lg,
        fontFamily: FONT_FAMILY.serif,
        color: COLORS.goldLight,
        fontWeight: "700",
        letterSpacing: 1.5,
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 6,
    },
    statusLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    chipRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    chip: {
        width: chipSize,
        height: 24,
        borderRadius: 4,
        backgroundColor: "rgba(255,241,184,0.9)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 5,
        marginRight: 12,
    },
    chipLine: {
        width: "80%",
        height: 2,
        backgroundColor: "rgba(183,121,31,0.6)",
        borderRadius: 1,
        marginVertical: 2,
    },
    wave: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    waveBar: {
        width: 14,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.gold,
    },
    cardNumber: {
        fontSize: FONT_SIZE.xl,
        fontFamily: FONT_FAMILY.sans,
        color: COLORS.text,
        letterSpacing: 2,
        marginBottom: SPACING.md,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    label: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    value: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        fontWeight: "600",
    },
    divider: {
        height: 0,
    },
    infoSection: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        paddingTop: SPACING.sm,
    },
    balanceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.sm,
    },
    balanceLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
    },
    balanceValue: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.goldLight,
        fontWeight: "700",
    },
    metaGrid: {
        flexDirection: "row",
        marginBottom: SPACING.sm,
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    metaValue: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
        fontWeight: "600",
    },
    actionRow: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
        gap: SPACING.md,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gold,
        fontWeight: "600",
    },
});

export default CardItem;
