import { useEffect, useMemo, useState } from "react";
import {
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../shared/components/Header";
import FeedbackModal from "../../../shared/components/FeedbackModal";
import { LoadingSpinner } from "../../../shared/components/Common";
import { COLORS } from "../../../shared/constants/themes";
import { CURRENCIES } from "../../../shared/constants/endpoints";
import {
    formatBalance,
    formatCompact,
    formatDate,
    getTransactionIcon,
    isIncomeTransaction,
    maskAccount,
} from "../../../shared/utils/money";
import { useTransactions } from "../hooks/useTransactions";
import styles from "./TransactionsScreen.styles";

const initialForm = {
    sourceAccountNumber: "",
    destinationAccountNumber: "",
    amount: "",
    currencyCode: "GTQ",
    description: "",
    favorito: false,
    alias: "",
};

const typeLabels = {
    deposito: "Deposito",
    retiro: "Retiro",
    transferencia: "Transferencia",
    pago_servicio: "Pago de servicio",
    pago_prestamo: "Pago de prestamo",
    compra_tarjeta: "Compra con tarjeta",
};

const Field = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "none",
    multiline = false,
}) => (
    <View style={styles.field}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && styles.textArea]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="rgba(184,176,160,0.58)"
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
        />
    </View>
);

const AccountPicker = ({ accounts, selected, onSelect }) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.accountPickerContent}
    >
        {accounts.map((account) => {
            const active = account.accountNumber === selected;
            return (
                <TouchableOpacity
                    key={account.accountNumber}
                    style={[styles.accountPill, active && styles.accountPillActive]}
                    onPress={() => onSelect(account)}
                    activeOpacity={0.82}
                >
                    <Ionicons
                        name={active ? "checkmark-circle" : "card-outline"}
                        size={17}
                        color={active ? "#11120d" : COLORS.gold}
                    />
                    <View style={styles.accountPillTextWrap}>
                        <Text style={[styles.accountPillNumber, active && styles.accountPillNumberActive]}>
                            {maskAccount(account.accountNumber)}
                        </Text>
                        <Text style={[styles.accountPillBalance, active && styles.accountPillBalanceActive]}>
                            {formatCompact(account.balance, account.currencyCode)}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        })}
    </ScrollView>
);

const CurrencyPicker = ({ value, onChange }) => (
    <View style={styles.currencyGrid}>
        {Object.keys(CURRENCIES).map((code) => {
            const active = value === code;
            return (
                <TouchableOpacity
                    key={code}
                    style={[styles.currencyChip, active && styles.currencyChipActive]}
                    onPress={() => onChange(code)}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.currencyChipText, active && styles.currencyChipTextActive]}>
                        {code}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const FavoriteList = ({ favorites, onUseFavorite }) => {
    if (!favorites.length) return null;

    return (
        <View style={styles.favoritesBlock}>
            <Text style={styles.blockTitle}>Favoritos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesContent}>
                {favorites.map((favorite) => (
                    <TouchableOpacity
                        key={`${favorite.accountNumber}-${favorite.alias || "favorite"}`}
                        style={styles.favoriteChip}
                        onPress={() => onUseFavorite(favorite)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="star" size={14} color={COLORS.gold} />
                        <Text style={styles.favoriteAlias} numberOfLines={1}>
                            {favorite.alias || favorite.name || "Destino"}
                        </Text>
                        <Text style={styles.favoriteAccount}>{maskAccount(favorite.accountNumber)}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const TransactionRow = ({ transaction, accountNumbers, canCancel, onCancel }) => {
    const income = isIncomeTransaction(transaction, accountNumbers);
    const accent = income ? COLORS.success : COLORS.danger;
    const type = transaction.transactionType || transaction.type || "movimiento";

    return (
        <View style={styles.txCard}>
            <View style={[styles.txIcon, { borderColor: `${accent}40`, backgroundColor: `${accent}14` }]}>
                <Ionicons name={getTransactionIcon(type)} size={19} color={accent} />
            </View>
            <View style={styles.txMain}>
                <View style={styles.txTopRow}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                        {typeLabels[type] || type.replace(/_/g, " ")}
                    </Text>
                    <Text style={[styles.txAmount, { color: accent }]}>
                        {income ? "+" : "-"}
                        {formatCompact(transaction.amount, transaction.currencyCode)}
                    </Text>
                </View>
                <Text style={styles.txDate}>
                    {formatDate(transaction.transactionDate || transaction.date || transaction.createdAt)}
                </Text>
                <Text style={styles.txDescription} numberOfLines={2}>
                    {transaction.description || "Sin descripcion"}
                </Text>
                <View style={styles.txAccounts}>
                    {!!transaction.sourceAccountNumber && (
                        <Text style={styles.txAccountText}>Origen {maskAccount(transaction.sourceAccountNumber)}</Text>
                    )}
                    {!!transaction.destinationAccountNumber && (
                        <Text style={styles.txAccountText}>Destino {maskAccount(transaction.destinationAccountNumber)}</Text>
                    )}
                </View>
                <View style={styles.txFooter}>
                    <View style={styles.statusPill}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{transaction.status || "exitosa"}</Text>
                    </View>
                    {canCancel(transaction) && (
                        <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel(transaction)} activeOpacity={0.8}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const CancelModal = ({ visible, transaction, reason, saving, onReasonChange, onClose, onConfirm }) => (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalIcon}>
                        <Ionicons name="alert-circle-outline" size={24} color={COLORS.warning} />
                    </View>
                    <TouchableOpacity onPress={onClose} disabled={saving} hitSlop={10}>
                        <Ionicons name="close" size={22} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.modalTitle}>Cancelar transaccion</Text>
                <Text style={styles.modalText}>
                    Esta accion reversara la operacion seleccionada si todavia esta dentro del periodo permitido.
                </Text>
                {transaction && (
                    <View style={styles.modalSummary}>
                        <Text style={styles.modalSummaryLabel}>Monto</Text>
                        <Text style={styles.modalSummaryValue}>
                            {formatBalance(transaction.amount, transaction.currencyCode)}
                        </Text>
                    </View>
                )}
                <Field
                    label="Motivo"
                    value={reason}
                    onChangeText={onReasonChange}
                    placeholder="Ej. cuenta destino incorrecta"
                    multiline
                />
                <TouchableOpacity
                    style={[styles.primaryButton, saving && styles.disabledButton]}
                    onPress={onConfirm}
                    disabled={saving}
                    activeOpacity={0.84}
                >
                    <Text style={styles.primaryButtonText}>{saving ? "Cancelando..." : "Confirmar cancelacion"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

const TransactionsScreen = () => {
    const {
        activeAccounts,
        transactions,
        favorites,
        totals,
        loading,
        refreshing,
        saving,
        error,
        fetchData,
        refresh,
        submitTransfer,
        submitCancel,
        isCancelableTransaction,
        normalizeAccount,
    } = useTransactions();

    const [form, setForm] = useState(initialForm);
    const [feedback, setFeedback] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState("");

    const accountNumbers = useMemo(
        () => activeAccounts.map((account) => account.accountNumber),
        [activeAccounts],
    );

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!form.sourceAccountNumber && activeAccounts[0]) {
            setForm((current) => ({
                ...current,
                sourceAccountNumber: activeAccounts[0].accountNumber,
                currencyCode: activeAccounts[0].currencyCode || current.currencyCode,
            }));
        }
    }, [activeAccounts, form.sourceAccountNumber]);

    const selectedAccount = activeAccounts.find(
        (account) => account.accountNumber === form.sourceAccountNumber,
    );

    const updateForm = (key, value) => {
        setForm((current) => ({
            ...current,
            [key]: key.toLowerCase().includes("account") ? normalizeAccount(value) : value,
        }));
    };

    const handleSelectAccount = (account) => {
        setForm((current) => ({
            ...current,
            sourceAccountNumber: account.accountNumber,
            currencyCode: account.currencyCode || current.currencyCode,
        }));
    };

    const handleUseFavorite = (favorite) => {
        setForm((current) => ({
            ...current,
            destinationAccountNumber: favorite.accountNumber || "",
            alias: favorite.alias || favorite.name || "",
        }));
    };

    const handleSubmit = async () => {
        try {
            await submitTransfer(form);
            setFeedback({
                type: "success",
                title: "Transferencia realizada",
                message: "La operacion se proceso correctamente.",
            });
            setForm((current) => ({
                ...initialForm,
                sourceAccountNumber: current.sourceAccountNumber,
                currencyCode: current.currencyCode,
            }));
        } catch (err) {
            setFeedback({
                type: "error",
                title: "No se pudo transferir",
                message: err.message || "Revisa los datos e intenta de nuevo.",
            });
        }
    };

    const handleConfirmCancel = async () => {
        try {
            await submitCancel(cancelTarget, cancelReason);
            setCancelTarget(null);
            setCancelReason("");
            setFeedback({
                type: "success",
                title: "Transaccion cancelada",
                message: "La operacion fue reversada correctamente.",
            });
        } catch (err) {
            setFeedback({
                type: "error",
                title: "No se pudo cancelar",
                message: err.message || "Intenta nuevamente.",
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <StatusBar barStyle="light-content" backgroundColor="#03040a" />
            <Header primaryAccount={selectedAccount} />

            {loading && !refreshing ? (
                <LoadingSpinner />
            ) : (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            tintColor={COLORS.gold}
                            colors={[COLORS.gold]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    <LinearGradient
                        colors={["#0b0f35", "#10142f", "#080916"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroTop}>
                            <View>
                                <Text style={styles.kicker}>Operaciones</Text>
                                <Text style={styles.heroTitle}>Transferencias</Text>
                            </View>
                            <View style={styles.heroIcon}>
                                <Ionicons name="swap-horizontal" size={24} color={COLORS.goldLight} />
                            </View>
                        </View>
                        <Text style={styles.heroSubtitle}>
                            Envia desde tus cuentas activas y consulta tus movimientos recientes.
                        </Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totals.count}</Text>
                                <Text style={styles.statLabel}>Movimientos</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totals.transfers}</Text>
                                <Text style={styles.statLabel}>Transferencias</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totals.received}</Text>
                                <Text style={styles.statLabel}>Recibidas</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {!!error && (
                        <View style={styles.notice}>
                            <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} />
                            <Text style={styles.noticeText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>Nueva transferencia</Text>
                    </View>

                    <View style={styles.formCard}>
                        {activeAccounts.length > 0 ? (
                            <>
                                <Text style={styles.blockTitle}>Cuenta origen</Text>
                                <AccountPicker
                                    accounts={activeAccounts}
                                    selected={form.sourceAccountNumber}
                                    onSelect={handleSelectAccount}
                                />

                                <Field
                                    label="Cuenta destino"
                                    value={form.destinationAccountNumber}
                                    onChangeText={(value) => updateForm("destinationAccountNumber", value)}
                                    placeholder="ACC-000-0000"
                                    autoCapitalize="characters"
                                />
                                <Field
                                    label="Monto"
                                    value={form.amount}
                                    onChangeText={(value) => updateForm("amount", value)}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                />
                                <Text style={styles.fieldLabel}>Moneda</Text>
                                <CurrencyPicker
                                    value={form.currencyCode}
                                    onChange={(value) => updateForm("currencyCode", value)}
                                />
                                <Field
                                    label="Descripcion"
                                    value={form.description}
                                    onChangeText={(value) => updateForm("description", value)}
                                    placeholder="Transferencia bancaria"
                                />
                                <TouchableOpacity
                                    style={styles.checkRow}
                                    onPress={() => updateForm("favorito", !form.favorito)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={form.favorito ? "checkbox" : "square-outline"}
                                        size={22}
                                        color={form.favorito ? COLORS.gold : COLORS.textMuted}
                                    />
                                    <Text style={styles.checkText}>Guardar destino como favorito</Text>
                                </TouchableOpacity>
                                {form.favorito && (
                                    <Field
                                        label="Alias favorito"
                                        value={form.alias}
                                        onChangeText={(value) => updateForm("alias", value)}
                                        placeholder="Casa, renta, proveedor"
                                    />
                                )}
                                <TouchableOpacity
                                    style={[styles.primaryButton, saving && styles.disabledButton]}
                                    onPress={handleSubmit}
                                    disabled={saving}
                                    activeOpacity={0.84}
                                >
                                    <Ionicons name="send" size={18} color="#11120d" />
                                    <Text style={styles.primaryButtonText}>
                                        {saving ? "Procesando..." : "Transferir"}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.emptyBox}>
                                <Ionicons name="card-outline" size={36} color={COLORS.textMuted} />
                                <Text style={styles.emptyTitle}>Sin cuentas activas</Text>
                                <Text style={styles.emptyText}>
                                    Necesitas una cuenta activa para realizar transferencias.
                                </Text>
                            </View>
                        )}
                    </View>

                    <FavoriteList favorites={favorites} onUseFavorite={handleUseFavorite} />

                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>Historial</Text>
                    </View>

                    <View style={styles.txList}>
                        {transactions.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
                                <Text style={styles.emptyTitle}>Sin movimientos</Text>
                                <Text style={styles.emptyText}>Tus transacciones apareceran aqui.</Text>
                            </View>
                        ) : (
                            transactions.map((transaction, index) => (
                                <TransactionRow
                                    key={transaction._id || transaction.id || `${transaction.accountNumber}-${index}`}
                                    transaction={transaction}
                                    accountNumbers={accountNumbers}
                                    canCancel={isCancelableTransaction}
                                    onCancel={(item) => {
                                        setCancelTarget(item);
                                        setCancelReason("");
                                    }}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>
            )}

            <CancelModal
                visible={!!cancelTarget}
                transaction={cancelTarget}
                reason={cancelReason}
                saving={saving}
                onReasonChange={setCancelReason}
                onClose={() => {
                    if (!saving) setCancelTarget(null);
                }}
                onConfirm={handleConfirmCancel}
            />

            {feedback && (
                <FeedbackModal
                    visible={!!feedback}
                    type={feedback.type}
                    title={feedback.title}
                    message={feedback.message}
                    onClose={() => setFeedback(null)}
                />
            )}
        </SafeAreaView>
    );
};

export default TransactionsScreen;
