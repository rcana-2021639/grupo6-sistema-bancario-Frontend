import { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, BORDER_RADIUS } from "../../../shared/constants/themes";
import { formatCompact, formatDate, getTransactionIcon, isIncomeTransaction } from "../../../shared/utils/money";
import { getCardMovements } from "../services/cardService";
import { useAuthStore } from "../../../shared/store/authStore";

const typeLabels = {
    purchase: "Compra",
    compra_tarjeta: "Compra tarjeta",
    withdrawal: "Retiro",
    retiro: "Retiro",
    local_retiro: "Retiro",
    deposit: "Deposito",
    deposito: "Deposito",
    transfer: "Transferencia",
    transferencia: "Transferencia",
    payment: "Pago",
    refund: "Reembolso",
};

const normalizeType = (type) => String(type || "").toLowerCase();

const CardMovementsModal = ({ visible, card, onClose }) => {
    const user = useAuthStore(state => state.user);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!visible) return;

        const loadMovements = async () => {
            try {
                setLoading(true);
                const result = await getCardMovements(card.id);
                setMovements(Array.isArray(result) ? result : []);
            } catch {
                setMovements([]);
            } finally {
                setLoading(false);
            }
        };

        loadMovements();
    }, [visible, card.id]);

    const userAccountNumbers = card.accountNumber ? [card.accountNumber] : [];

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Movimientos de tarjeta</Text>
                            <Text style={styles.subtitle}>Tarjeta: {card.cardHolder || user?.name || user?.username || "Sin titular"}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} hitSlop={10}>
                            <Ionicons name="close" size={22} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator size="large" color={COLORS.gold} />
                        </View>
                    ) : movements.length === 0 ? (
                        <View style={styles.centerBox}>
                            <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyTitle}>Sin movimientos</Text>
                            <Text style={styles.emptySubtitle}>
                                No hay movimientos registrados para esta tarjeta.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                            {movements.map((movement, index) => {
                                const type = normalizeType(movement.transactionType);
                                const iconName = getTransactionIcon(type);
                                const income = isIncomeTransaction(movement, userAccountNumbers);
                                const accent = income ? COLORS.success : COLORS.danger;

                                return (
                                    <View key={movement.id || movement._id || index} style={styles.movementItem}>
                                        <View style={[styles.movementIcon, { borderColor: `${accent}40`, backgroundColor: `${accent}14` }]}>
                                            <Ionicons name={iconName} size={18} color={accent} />
                                        </View>
                                        <View style={styles.movementInfo}>
                                            <Text style={styles.movementType}>
                                                {typeLabels[type] || type.replace(/_/g, " ") || "Movimiento"}
                                            </Text>
                                            <Text style={styles.movementDate}>
                                                {formatDate(movement.transactionDate || movement.createdAt)}
                                            </Text>
                                            <Text style={styles.movementDesc} numberOfLines={1}>
                                                {movement.concept || movement.description || "Transaccion bancaria"}
                                            </Text>
                                        </View>
                                        <Text style={[styles.movementAmount, { color: accent }]}>
                                            {income ? "+" : "-"}
                                            {formatCompact(Math.abs(movement.amount || 0), movement.currencyCode)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                        <Text style={styles.closeBtnText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(3,4,10,0.85)",
        justifyContent: "center",
        padding: SPACING.md,
    },
    container: {
        backgroundColor: COLORS.surfaceElevated,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        maxHeight: "80%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontFamily: FONT_FAMILY.serif,
        color: COLORS.goldLight,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    centerBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: SPACING.xxl,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        fontWeight: "600",
        marginTop: SPACING.md,
    },
    emptySubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        textAlign: "center",
        marginTop: SPACING.xs,
    },
    list: {
        marginBottom: SPACING.md,
    },
    movementItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(240,205,97,0.08)",
    },
    movementIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        marginRight: SPACING.sm,
    },
    movementInfo: {
        flex: 1,
    },
    movementType: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
        fontWeight: "600",
    },
    movementDate: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textMuted,
        marginTop: 1,
    },
    movementDesc: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSilver,
        marginTop: 1,
    },
    movementAmount: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        marginLeft: SPACING.sm,
    },
    closeBtn: {
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.sm,
        alignItems: "center",
    },
    closeBtnText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textMuted,
        fontWeight: "600",
    },
});

export default CardMovementsModal;
