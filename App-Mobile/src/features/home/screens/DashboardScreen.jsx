import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    StatusBar,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../shared/components/Header";
import { SkeletonBlock } from "../../../shared/components/Common";
import FeedbackModal from "../../../shared/components/FeedbackModal";
import { useHome } from "../hooks/useHome";
import { COLORS, SPACING } from "../../../shared/constants/themes";
import {
    formatBalance,
    formatCompact,
    maskAccount,
    formatDate,
    getTransactionIcon,
    isIncomeTransaction,
} from "../../../shared/utils/money";
import styles from "./DashboardScreen.styles";

const STATUS_COLORS = {
    activa: "#5ee4a8",
    inactiva: "#aeb6ff",
    bloqueada: "#fb7185",
};

const QUICK_ACTIONS = [
    { key: "transfer", icon: "swap-horizontal", label: "Transferir", tint: "#eab308" },
    { key: "deposit", icon: "arrow-down", label: "Depositar", tint: "#5ee4a8" },
    { key: "pay", icon: "flash", label: "Pagar", tint: "#aeb6ff" },
    { key: "history", icon: "receipt-outline", label: "Historial", tint: "#fbbf24" },
];

const SectionHeader = ({ title, actionLabel, onAction }) => (
    <View style={styles.sectionRow}>
        <View style={styles.sectionTitleWrap}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {actionLabel && (
            <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
                <Text style={styles.sectionLink}>{actionLabel}</Text>
            </TouchableOpacity>
        )}
    </View>
);

const WealthCard = ({ wealthByCurrency, activeCount, primaryAccount, floatStyle }) => {
    const [hidden, setHidden] = useState(false);
    const currencies = Object.entries(wealthByCurrency);
    const primary = currencies.find(([c]) => c === "GTQ") || currencies[0];
    const others = currencies.filter(([c]) => c !== (primary?.[0] || "GTQ"));

    const amount = primary
        ? formatBalance(primary[1], primary[0])
        : "Q 0.00";

    return (
        <Animated.View style={[styles.wealthCardWrapper, floatStyle]}>
            <LinearGradient
                colors={["#0b0f35", "#1a1040", "#080916"]}
                start={{ x: 0.05, y: 0 }}
                end={{ x: 0.95, y: 1 }}
                style={styles.wealthGradient}
            >
                {/* Glows decorativos */}
                <View style={styles.glowGold} />
                <View style={styles.glowPurple} />

                {/* Encabezado de la tarjeta */}
                <View style={styles.wealthTopRow}>
                    <View style={styles.wealthLabelWrap}>
                        <Ionicons name="diamond" size={11} color="rgba(240,205,97,0.7)" />
                        <Text style={styles.wealthLabel}>Patrimonio total</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setHidden((h) => !h)}
                        activeOpacity={0.7}
                        style={styles.eyeBtn}
                        hitSlop={10}
                    >
                        <Ionicons
                            name={hidden ? "eye-off-outline" : "eye-outline"}
                            size={18}
                            color="rgba(255,241,184,0.85)"
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.wealthBalance}>
                    {hidden ? "Q •••••••" : amount}
                </Text>
                <Text style={styles.wealthCurrency}>
                    Saldo en {primary?.[0] || "GTQ"}
                </Text>

                <View style={styles.wealthFooter}>
                    <View style={styles.wealthBadge}>
                        <View style={styles.wealthBadgeDot} />
                        <Text style={styles.wealthBadgeText}>
                            {activeCount} cuenta{activeCount !== 1 ? "s" : ""} activa
                            {activeCount !== 1 ? "s" : ""}
                        </Text>
                    </View>
                    {others.length > 0 && (
                        <View style={styles.wealthMultiCurrency}>
                            {others.map(([code, bal]) => (
                                <View key={code} style={styles.currencyPill}>
                                    <Text style={styles.currencyPillText}>
                                        {hidden ? "•••" : formatCompact(bal, code)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Pie estilo tarjeta bancaria */}
                <View style={styles.wealthCardFooter}>
                    <View style={styles.chip}>
                        <View style={styles.chipLine} />
                        <View style={styles.chipLine} />
                    </View>
                    <Text style={styles.cardNumber}>
                        {primaryAccount
                            ? maskAccount(primaryAccount.accountNumber)
                            : "•••• ••••"}
                    </Text>
                    <Text style={styles.cardBrand}>LUMINA</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const QuickActionBtn = ({ icon, label, tint, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const pressIn = () =>
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
            tension: 180,
            friction: 8,
        }).start();

    const pressOut = () =>
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 180,
            friction: 8,
        }).start();

    return (
        <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={onPress}
            onPressIn={pressIn}
            onPressOut={pressOut}
            activeOpacity={1}
        >
            <Animated.View
                style={[
                    styles.quickActionIcon,
                    {
                        transform: [{ scale: scaleAnim }],
                        borderColor: `${tint}55`,
                        backgroundColor: `${tint}14`,
                    },
                ]}
            >
                <Ionicons name={icon} size={24} color={tint} />
            </Animated.View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

const MiniAccountCard = ({ account }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const statusColor = STATUS_COLORS[account.status] || COLORS.textMuted;

    const pressIn = () =>
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 180, friction: 8 }).start();
    const pressOut = () =>
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 8 }).start();

    return (
        <Animated.View style={[styles.miniCard, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPressIn={pressIn} onPressOut={pressOut} activeOpacity={1}>
                <LinearGradient
                    colors={["rgba(11,15,53,0.95)", "rgba(8,9,22,0.9)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.miniCardGradient}
                >
                    <View style={styles.miniCardIcon}>
                        <Ionicons name="card" size={18} color={COLORS.gold} />
                    </View>
                    <View style={styles.miniCardLeft}>
                        <Text style={styles.miniCardNumber}>
                            {maskAccount(account.accountNumber)}
                        </Text>
                        <Text style={styles.miniCardType}>
                            {account.accountType} · {account.currencyCode}
                        </Text>
                    </View>
                    <View style={styles.miniCardRight}>
                        <Text style={styles.miniCardBalance}>
                            {formatCompact(account.balance, account.currencyCode)}
                        </Text>
                        <View style={styles.miniCardStatus}>
                            <View
                                style={[styles.miniCardStatusDot, { backgroundColor: statusColor }]}
                            />
                            <Text style={[styles.miniCardStatusText, { color: statusColor }]}>
                                {account.status}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const TransactionRow = ({ tx, userAccountNumbers }) => {
    const income = isIncomeTransaction(tx, userAccountNumbers);
    const iconName = getTransactionIcon(tx.transactionType);
    const accent = income ? COLORS.success : COLORS.danger;

    return (
        <View style={styles.txRow}>
            <View style={[styles.txIconBox, { borderColor: `${accent}3a`, backgroundColor: `${accent}12` }]}>
                <Ionicons name={iconName} size={19} color={accent} />
            </View>
            <View style={styles.txInfo}>
                <Text style={styles.txType} numberOfLines={1}>
                    {tx.transactionType?.replace(/_/g, " ") || "Movimiento"}
                </Text>
                <Text style={styles.txDate}>
                    {formatDate(tx.transactionDate || tx.createdAt)}
                </Text>
            </View>
            <Text style={[styles.txAmount, { color: accent }]}>
                {income ? "+" : "-"}
                {formatCompact(tx.amount, tx.currencyCode)}
            </Text>
        </View>
    );
};

const DashboardSkeleton = ({ shimmerAnim }) => (
    <>
        <Animated.View style={[styles.skeletonCard, { opacity: shimmerAnim }]} />
        <View style={[styles.skeletonRow, { marginTop: SPACING.xl }]}>
            {[0, 1, 2, 3].map((i) => (
                <Animated.View key={i} style={{ opacity: shimmerAnim, flex: 1 }}>
                    <SkeletonBlock height={58} style={{ borderRadius: 14 }} />
                </Animated.View>
            ))}
        </View>
        {[0, 1].map((i) => (
            <View key={i} style={[styles.skeletonRow, { marginTop: SPACING.sm }]}>
                <Animated.View style={{ opacity: shimmerAnim, flex: 1 }}>
                    <SkeletonBlock height={64} style={{ borderRadius: 12 }} />
                </Animated.View>
            </View>
        ))}
    </>
);

const DashboardScreen = ({ navigation }) => {
    const {
        accounts,
        transactions,
        loading,
        fetchData,
        wealthByCurrency,
        primaryAccount,
        activeCount,
    } = useHome();

    const [modal, setModal] = useState(null);

    const fadeAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(shimmerAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [loading]);

    useEffect(() => {
        if (loading) return;

        fadeAnims.forEach((a) => a.setValue(0));

        Animated.stagger(
            80,
            fadeAnims.map((anim) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 420,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ),
        ).start(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(floatAnim, {
                        toValue: 1,
                        duration: 2500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatAnim, {
                        toValue: 0,
                        duration: 2500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        });
    }, [loading]);

    const section = (index) => ({
        opacity: fadeAnims[index],
        transform: [
            {
                translateY: fadeAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                }),
            },
        ],
    });

    const floatStyle = {
        transform: [
            {
                translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -7],
                }),
            },
        ],
    };

    const userAccountNumbers = accounts.map((a) => a.accountNumber);

    const handleQuickAction = () => {
        setModal({
            type: "info",
            title: "Próximamente",
            message: "Esta funcionalidad estará disponible pronto.",
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <StatusBar barStyle="light-content" backgroundColor="#03040a" />
            <Header primaryAccount={primaryAccount} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <DashboardSkeleton shimmerAnim={shimmerAnim} />
                ) : (
                    <>
                        <Animated.View style={section(0)}>
                            <WealthCard
                                wealthByCurrency={wealthByCurrency}
                                activeCount={activeCount}
                                primaryAccount={primaryAccount}
                                floatStyle={floatStyle}
                            />
                        </Animated.View>

                        <Animated.View style={section(1)}>
                            <SectionHeader title="Acciones rápidas" />
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.quickActionsContent}
                                style={styles.quickActionsScroll}
                            >
                                {QUICK_ACTIONS.map((a) => (
                                    <QuickActionBtn
                                        key={a.key}
                                        icon={a.icon}
                                        label={a.label}
                                        tint={a.tint}
                                        onPress={handleQuickAction}
                                    />
                                ))}
                            </ScrollView>
                        </Animated.View>

                        <Animated.View style={section(2)}>
                            <SectionHeader
                                title="Mis cuentas"
                                actionLabel="Ver todas →"
                                onAction={() => navigation.navigate("Cuentas")}
                            />
                            <View style={styles.miniAccountsList}>
                                {accounts.length === 0 ? (
                                    <View style={styles.emptyCard}>
                                        <Ionicons name="card-outline" size={32} color={COLORS.textMuted} />
                                        <Text style={styles.emptyText}>
                                            No tienes cuentas registradas.
                                        </Text>
                                    </View>
                                ) : (
                                    accounts.slice(0, 3).map((acct) => (
                                        <MiniAccountCard key={acct.accountNumber} account={acct} />
                                    ))
                                )}
                            </View>
                        </Animated.View>

                        <Animated.View style={section(3)}>
                            <SectionHeader title="Últimos movimientos" />
                            <View style={styles.txList}>
                                {transactions.length === 0 ? (
                                    <View style={styles.emptyCard}>
                                        <Ionicons name="swap-horizontal-outline" size={32} color={COLORS.textMuted} />
                                        <Text style={styles.emptyText}>
                                            No hay movimientos recientes.
                                        </Text>
                                    </View>
                                ) : (
                                    transactions.slice(0, 5).map((tx) => (
                                        <TransactionRow
                                            key={tx._id || tx.id}
                                            tx={tx}
                                            userAccountNumbers={userAccountNumbers}
                                        />
                                    ))
                                )}
                            </View>
                        </Animated.View>
                    </>
                )}
            </ScrollView>

            {modal && (
                <FeedbackModal
                    visible={!!modal}
                    type={modal.type}
                    title={modal.title}
                    message={modal.message}
                    onClose={() => setModal(null)}
                />
            )}
        </SafeAreaView>
    );
};

export default DashboardScreen;
