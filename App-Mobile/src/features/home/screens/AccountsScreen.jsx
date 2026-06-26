import {
    View,
    Text,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Animated,
    StatusBar,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../shared/components/Header";
import { LoadingSpinner } from "../../../shared/components/Common";
import Button from "../../../shared/components/Button";
import FeedbackModal from "../../../shared/components/FeedbackModal";
import { useAccounts } from "../hooks/useAccounts";
import { COLORS, SPACING } from "../../../shared/constants/themes";
import { formatBalance, formatCompact, maskDPI, formatDate } from "../../../shared/utils/money";
import { sendAccountStatementByEmail } from "../services/accountStatementService";
import styles from "./AccountsScreen.styles";

const STATUS_CONFIG = {
    activa: { color: COLORS.statusActive, label: "Activa" },
    inactiva: { color: COLORS.statusInactive, label: "Inactiva" },
    bloqueada: { color: COLORS.statusBlocked, label: "Bloqueada" },
};

const DetailItem = ({ icon, label, value }) => (
    <View style={styles.detailItem}>
        <Ionicons name={icon} size={13} color={COLORS.textMuted} />
        <View style={styles.detailTextWrap}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
                {value || "—"}
            </Text>
        </View>
    </View>
);

const AccountCard = ({ account, onSendStatement, statementLoading }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const statusCfg = STATUS_CONFIG[account.status] || STATUS_CONFIG.inactiva;

    const pressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, tension: 180, friction: 8 }).start();
    const pressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 8 }).start();

    return (
        <Animated.View style={[styles.accountCard, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
                <LinearGradient
                    colors={["rgba(11,15,53,0.98)", "rgba(8,9,22,0.95)", "rgba(5,6,18,0.98)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.accountCardGradient}
                >
                    {/* Franja superior según estado */}
                    <View style={[styles.statusStripe, { backgroundColor: statusCfg.color }]} />
                    <View style={[styles.glow, { backgroundColor: `${statusCfg.color}1f` }]} />

                    {/* Cabecera */}
                    <View style={styles.cardTopRow}>
                        <View style={styles.cardIconWrap}>
                            <Ionicons name="card" size={20} color={COLORS.gold} />
                        </View>
                        <View style={styles.cardHeadInfo}>
                            <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                            <View style={styles.accountTypeRow}>
                                <View style={styles.typeBadge}>
                                    <Text style={styles.typeBadgeText}>{account.accountType}</Text>
                                </View>
                                <Text style={styles.currencyText}>{account.currencyCode}</Text>
                            </View>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: `${statusCfg.color}1a`, borderColor: `${statusCfg.color}4d` }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
                            <Text style={[styles.statusPillText, { color: statusCfg.color }]}>
                                {statusCfg.label}
                            </Text>
                        </View>
                    </View>

                    {/* Saldo */}
                    <View style={styles.balanceBox}>
                        <Text style={styles.balanceLabel}>Saldo disponible</Text>
                        <Text style={styles.balanceAmount}>
                            {formatBalance(account.balance, account.currencyCode)}
                        </Text>
                    </View>

                    {/* Detalles */}
                    <View style={styles.detailsGrid}>
                        <DetailItem icon="person-outline" label="Titular" value={account.name} />
                        <DetailItem icon="finger-print-outline" label="DPI" value={maskDPI(account.dpi)} />
                        <DetailItem icon="calendar-outline" label="Apertura" value={formatDate(account.openingDate)} />
                        <DetailItem icon="call-outline" label="Teléfono" value={account.phone} />
                    </View>

                    {account.jobName && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.detailsGrid}>
                                <DetailItem icon="briefcase-outline" label="Empleo" value={account.jobName} />
                                <DetailItem
                                    icon="cash-outline"
                                    label="Ingreso mensual"
                                    value={formatBalance(account.monthlyIncome, account.currencyCode)}
                                />
                            </View>
                        </>
                    )}

                    <View style={styles.statementActionWrap}>
                        <Button
                            title="Obtener Historial de Cuenta"
                            variant="secondary"
                            loading={statementLoading}
                            onPress={() => onSendStatement(account)}
                            style={styles.statementButton}
                        />
                        <Text style={styles.statementHint}>
                            Se enviara el historial de la cuenta {account.accountNumber} al correo registrado.
                        </Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const StatCard = ({ icon, value, label, tint }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${tint}18`, borderColor: `${tint}40` }]}>
            <Ionicons name={icon} size={16} color={tint} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const EmptyAccounts = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
            <Ionicons name="card-outline" size={48} color={COLORS.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Sin cuentas registradas</Text>
        <Text style={styles.emptySubtitle}>
            Tus cuentas bancarias aparecerán aquí una vez que estén registradas.
        </Text>
    </View>
);

const AccountsScreen = () => {
    const {
        accounts,
        loading,
        refreshing,
        fetchAccounts,
        refresh,
        totalBalance,
        activeCount,
    } = useAccounts();
    const [sendingAccounts, setSendingAccounts] = useState({});
    const [feedback, setFeedback] = useState({
        visible: false,
        type: "success",
        title: "",
        message: "",
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const closeFeedback = () =>
        setFeedback((current) => ({ ...current, visible: false }));

    const handleSendStatement = async (account) => {
        const accountNumber = account?.accountNumber;
        if (!accountNumber || sendingAccounts[accountNumber]) return;

        try {
            setSendingAccounts((current) => ({ ...current, [accountNumber]: true }));
            const response = await sendAccountStatementByEmail({ accountNumber });

            setFeedback({
                visible: true,
                type: "success",
                title: "Historial enviado",
                message:
                    response.message ||
                    `El historial de la cuenta ${accountNumber} fue enviado al correo registrado.`,
            });
        } catch (error) {
            setFeedback({
                visible: true,
                type: "error",
                title: "No se pudo enviar",
                message: error.message || `No se pudo enviar el historial de la cuenta ${accountNumber}.`,
            });
        } finally {
            setSendingAccounts((current) => {
                const next = { ...current };
                delete next[accountNumber];
                return next;
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <StatusBar barStyle="light-content" backgroundColor="#03040a" />
            <Header />

            <View style={styles.statsRow}>
                <StatCard icon="albums-outline" value={accounts.length} label="Total" tint="#eab308" />
                <StatCard icon="checkmark-circle-outline" value={activeCount} label="Activas" tint={COLORS.statusActive} />
                <StatCard
                    icon="wallet-outline"
                    value={formatCompact(totalBalance, "GTQ")}
                    label="Saldo GTQ"
                    tint={COLORS.statusInactive}
                />
            </View>

            {loading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <LoadingSpinner />
                </View>
            ) : (
                <FlatList
                    data={accounts}
                    keyExtractor={(item) => item.accountNumber}
                    renderItem={({ item }) => (
                        <AccountCard
                            account={item}
                            onSendStatement={handleSendStatement}
                            statementLoading={Boolean(sendingAccounts[item.accountNumber])}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        accounts.length === 0 && { flex: 1 },
                    ]}
                    ListEmptyComponent={<EmptyAccounts />}
                    ListHeaderComponent={
                        <View style={styles.sectionHeaderContainer}>
                            <Text style={styles.sectionHeaderText}>Mis cuentas bancarias</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            tintColor={COLORS.gold}
                            colors={[COLORS.gold]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            <FeedbackModal
                visible={feedback.visible}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onClose={closeFeedback}
            />
        </SafeAreaView>
    );
};

export default AccountsScreen;
