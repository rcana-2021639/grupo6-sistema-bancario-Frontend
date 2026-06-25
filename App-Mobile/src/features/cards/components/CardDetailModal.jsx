import { useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, BORDER_RADIUS } from "../../../shared/constants/themes";
import { formatCompact } from "../../../shared/utils/money";

const formatCardNumber = (cardNumber) => (
    String(cardNumber || "").replace(/(\d{4})(?=\d)/g, "$1 ").trim() || "N/D"
);

const formatDate = (value) => {
    if (!value) return "N/D";
    try {
        return new Date(value).toLocaleDateString("es-GT");
    } catch {
        return "N/D";
    }
};

const CardDetailModal = ({ visible, card, onClose, onVerify }) => {
    const [password, setPassword] = useState("");
    const [verifiedCard, setVerifiedCard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verifyError, setVerifyError] = useState("");

    const handleVerify = async () => {
        Keyboard.dismiss();
        if (!password.trim()) {
            setVerifyError("Ingresa tu contrasena para ver el detalle");
            return;
        }

        try {
            setLoading(true);
            setVerifyError("");
            const targetId = card.id || card._id;
            const fullCard = await onVerify(targetId, password);
            setVerifiedCard(fullCard);
            setPassword("");
        } catch (error) {
            setVerifyError(error.message || "No se pudo verificar la contrasena");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPassword("");
        setVerifiedCard(null);
        setVerifyError("");
        onClose();
    };

    const detailCard = verifiedCard || card;

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Detalle de tarjeta</Text>
                        <TouchableOpacity onPress={handleClose} hitSlop={10}>
                            <Ionicons name="close" size={22} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {!verifiedCard ? (
                        <View>
                            <Text style={styles.fieldLabel}>Contrasena de inicio de sesion *</Text>
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (verifyError) setVerifyError("");
                                }}
                                placeholder="Tu contrasena de inicio de sesion"
                                placeholderTextColor="rgba(184,176,160,0.58)"
                                secureTextEntry
                                autoComplete="current-password"
                                editable={!loading}
                            />
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle-outline" size={16} color={COLORS.gold} />
                                <Text style={styles.infoText}>
                                    Usa tu contrasena de inicio de sesion. No es el PIN de la tarjeta.
                                </Text>
                            </View>

                            {verifyError ? (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                                    <Text style={styles.errorText}>{verifyError}</Text>
                                </View>
                            ) : null}

                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.secondaryBtn} onPress={handleClose} disabled={loading} activeOpacity={0.8}>
                                    <Text style={styles.secondaryBtnText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                                    onPress={handleVerify}
                                    disabled={loading}
                                    activeOpacity={0.84}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#11120d" />
                                    ) : (
                                        <Text style={styles.primaryBtnText}>Ver detalle</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.detailGrid}>
                                <DetailItem label="Numero de tarjeta" value={formatCardNumber(detailCard.cardNumber)} />
                                <DetailItem label="CVV" value={detailCard.cvv || "N/D"} />
                                <DetailItem label="Cuenta" value={detailCard.accountNumber || "N/D"} />
                                <DetailItem label="Tipo" value={detailCard.cardType || "N/D"} />
                                <DetailItem
                                    label="Saldo disponible"
                                    value={formatCompact(detailCard.availableBalance, detailCard.currencyCode)}
                                />
                                <DetailItem label="Vence" value={formatDate(detailCard.expirationDate)} />
                                <DetailItem label="Estado" value={detailCard.status || "N/D"} />
                            </View>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={handleClose} activeOpacity={0.8}>
                                <Text style={styles.secondaryBtnText}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const DetailItem = ({ label, value }) => (
    <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

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
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontFamily: FONT_FAMILY.serif,
        color: COLORS.goldLight,
        fontWeight: "700",
    },
    fieldLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSilver,
        marginBottom: SPACING.sm,
        fontWeight: "600",
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: "rgba(234,179,8,0.08)",
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
    },
    infoText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textGold,
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(251,113,133,0.1)",
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
    },
    errorText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        color: COLORS.danger,
    },
    actionRow: {
        flexDirection: "row",
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: COLORS.gold,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.sm,
        alignItems: "center",
        justifyContent: "center",
    },
    disabledBtn: {
        opacity: 0.6,
    },
    primaryBtnText: {
        fontSize: FONT_SIZE.md,
        fontWeight: "700",
        color: "#11120d",
    },
    secondaryBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.sm,
        alignItems: "center",
    },
    secondaryBtnText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textMuted,
        fontWeight: "600",
    },
    detailGrid: {
        gap: SPACING.md,
        marginBottom: SPACING.lg,
    },
    detailItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(240,205,97,0.1)",
    },
    detailLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
    },
    detailValue: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
        fontWeight: "700",
        fontFamily: FONT_FAMILY.sans,
    },
});

export default CardDetailModal;
