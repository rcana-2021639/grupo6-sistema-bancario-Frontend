import { useEffect, useMemo, useState } from "react";
import {
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
import { useBenefits } from "../hooks/useBenefits";
import styles from "./BenefitsScreen.styles";

const BenefitCard = ({ benefit, redemption, locked, saving, onRedeem }) => {
    const redeemed = Boolean(redemption);

    return (
        <View style={[styles.benefitCard, locked && styles.benefitCardLocked, { borderColor: `${benefit.accent}55` }]}>
            <View style={[styles.accentStripe, { backgroundColor: benefit.accent }]} />
            <View style={styles.benefitTopRow}>
                <View style={[styles.benefitIcon, { borderColor: `${benefit.accent}55`, backgroundColor: `${benefit.accent}16` }]}>
                    <Ionicons name={redeemed ? "ticket" : benefit.icon} size={22} color={benefit.accent} />
                </View>
                <View style={styles.benefitBadges}>
                    <Text style={styles.categoryBadge}>{benefit.category}</Text>
                    <Text style={[styles.statusBadge, redeemed && styles.statusBadgeRedeemed]}>
                        {redeemed ? "Canjeado" : locked ? "Cupo agotado" : "Disponible"}
                    </Text>
                </View>
            </View>

            <Text style={styles.benefitTitle}>{benefit.title}</Text>
            <Text style={styles.benefitPerk}>{benefit.perk}</Text>
            <Text style={styles.benefitDescription}>{benefit.description}</Text>

            <View style={styles.partnerRow}>
                <Ionicons name="business-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.partnerText}>{benefit.partner}</Text>
            </View>

            {redeemed && (
                <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>Codigo de canje</Text>
                    <Text style={styles.codeValue}>{redemption.code}</Text>
                </View>
            )}

            <TouchableOpacity
                style={[styles.redeemButton, redeemed && styles.secondaryButton, (locked || saving) && styles.disabledButton]}
                onPress={() => onRedeem(benefit)}
                disabled={locked || saving}
                activeOpacity={0.84}
            >
                <Ionicons name={redeemed ? "eye-outline" : "gift-outline"} size={18} color={redeemed ? COLORS.gold : "#11120d"} />
                <Text style={[styles.redeemButtonText, redeemed && styles.secondaryButtonText]}>
                    {redeemed ? "Ver codigo" : locked ? "Limite alcanzado" : "Canjear"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const AdminResetPanel = ({ saving, onReset }) => {
    const [target, setTarget] = useState("");

    const handleReset = () => {
        onReset(target);
        setTarget("");
    };

    return (
        <View style={styles.adminPanel}>
            <View style={styles.adminHeader}>
                <View style={styles.adminIcon}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.goldLight} />
                </View>
                <View style={styles.adminCopy}>
                    <Text style={styles.adminTitle}>Habilitar beneficios</Text>
                    <Text style={styles.adminText}>Ingresa el correo, usuario o id del cliente para reiniciar su cupo en este dispositivo.</Text>
                </View>
            </View>
            <TextInput
                value={target}
                onChangeText={setTarget}
                placeholder="usuario@correo.com"
                placeholderTextColor="rgba(184,176,160,0.58)"
                autoCapitalize="none"
                style={styles.adminInput}
            />
            <TouchableOpacity
                style={[styles.redeemButton, saving && styles.disabledButton]}
                onPress={handleReset}
                disabled={saving}
                activeOpacity={0.84}
            >
                <Ionicons name="refresh" size={18} color="#11120d" />
                <Text style={styles.redeemButtonText}>{saving ? "Reiniciando..." : "Reiniciar cupo"}</Text>
            </TouchableOpacity>
        </View>
    );
};

const BenefitsScreen = () => {
    const {
        benefits,
        benefitState,
        redemptionsByBenefit,
        loading,
        refreshing,
        saving,
        isAdmin,
        fetchBenefits,
        refresh,
        redeem,
        resetUserBenefits,
    } = useBenefits();

    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        fetchBenefits();
    }, []);

    const progress = useMemo(() => (
        Math.min((benefitState.redemptions.length / benefitState.maxRedemptions) * 100, 100)
    ), [benefitState.maxRedemptions, benefitState.redemptions.length]);

    const handleRedeem = async (benefit) => {
        try {
            const result = await redeem(benefit);
            setFeedback({
                type: "success",
                title: result.alreadyRedeemed ? "Codigo disponible" : "Beneficio canjeado",
                message: result.redemption.code,
            });
        } catch (error) {
            setFeedback({
                type: "error",
                title: "No se pudo canjear",
                message: error.message || "Intenta nuevamente.",
            });
        }
    };

    const handleReset = async (target) => {
        try {
            await resetUserBenefits(target);
            setFeedback({
                type: "success",
                title: "Cupo reiniciado",
                message: "El usuario puede canjear nuevamente sus beneficios.",
            });
        } catch (error) {
            setFeedback({
                type: "error",
                title: "No se pudo reiniciar",
                message: error.message || "Verifica el usuario.",
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <StatusBar barStyle="light-content" backgroundColor="#03040a" />
            <Header />

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
                            <View style={styles.heroCopy}>
                                <Text style={styles.kicker}>Beneficios Lumina</Text>
                                <Text style={styles.heroTitle}>Premios</Text>
                            </View>
                            <View style={styles.heroIcon}>
                                <Ionicons name="gift" size={25} color={COLORS.goldLight} />
                            </View>
                        </View>
                        <Text style={styles.heroSubtitle}>
                            Canjea hasta dos beneficios exclusivos y conserva tu codigo para usarlo con el aliado.
                        </Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{benefitState.remaining}</Text>
                                <Text style={styles.statLabel}>Disponibles</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{benefitState.redemptions.length}</Text>
                                <Text style={styles.statLabel}>Canjeados</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{benefitState.maxRedemptions}</Text>
                                <Text style={styles.statLabel}>Maximo</Text>
                            </View>
                        </View>

                        <View style={styles.progressTrack}>
                            <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        </View>
                    </LinearGradient>

                    {isAdmin && <AdminResetPanel saving={saving} onReset={handleReset} />}

                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionAccent} />
                        <Text style={styles.sectionTitle}>Catalogo de beneficios</Text>
                    </View>

                    <View style={styles.benefitsList}>
                        {benefits.map((benefit) => {
                            const redemption = redemptionsByBenefit.get(benefit.id);
                            const locked = !redemption && benefitState.remaining <= 0;

                            return (
                                <BenefitCard
                                    key={benefit.id}
                                    benefit={benefit}
                                    redemption={redemption}
                                    locked={locked}
                                    saving={saving}
                                    onRedeem={handleRedeem}
                                />
                            );
                        })}
                    </View>
                </ScrollView>
            )}

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

export default BenefitsScreen;
