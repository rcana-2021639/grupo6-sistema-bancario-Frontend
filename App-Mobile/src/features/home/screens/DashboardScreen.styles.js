import { StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, BORDER_RADIUS } from "../../../shared/constants/themes";

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: SPACING.xxl,
    },

    // ── Wealth Card ──────────────────────────────
    wealthCardWrapper: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(234, 179, 8, 0.35)",
        shadowColor: "#eab308",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 22,
        elevation: 10,
    },
    wealthGradient: {
        padding: SPACING.lg,
        minHeight: 210,
        position: "relative",
    },
    glowGold: {
        position: "absolute",
        top: -50,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(234, 179, 8, 0.16)",
    },
    glowPurple: {
        position: "absolute",
        bottom: -60,
        left: -30,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "rgba(120, 90, 220, 0.14)",
    },
    wealthTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.sm,
    },
    wealthLabelWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    wealthLabel: {
        color: "rgba(240, 205, 97, 0.7)",
        fontSize: FONT_SIZE.xs,
        fontFamily: FONT_FAMILY.serif,
        letterSpacing: 2.5,
        textTransform: "uppercase",
    },
    eyeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.06)",
        justifyContent: "center",
        alignItems: "center",
    },
    wealthBalance: {
        color: "#fff1b8",
        fontSize: FONT_SIZE.huge,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    wealthCurrency: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        marginBottom: SPACING.md,
    },
    wealthFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.lg,
    },
    wealthBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(94, 228, 168, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(94, 228, 168, 0.3)",
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    wealthBadgeDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#5ee4a8",
    },
    wealthBadgeText: {
        color: "#5ee4a8",
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
    },
    wealthMultiCurrency: {
        flexDirection: "row",
        gap: 6,
    },
    currencyPill: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    currencyPillText: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: "600",
    },
    wealthCardFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.md,
        marginTop: "auto",
    },
    chip: {
        width: 32,
        height: 24,
        borderRadius: 5,
        backgroundColor: "rgba(255, 232, 150, 0.85)",
        padding: 4,
        justifyContent: "space-between",
    },
    chipLine: {
        height: 1.5,
        backgroundColor: "rgba(120, 90, 20, 0.55)",
        borderRadius: 1,
    },
    cardNumber: {
        flex: 1,
        color: "rgba(255,241,184,0.75)",
        fontSize: FONT_SIZE.md,
        fontFamily: FONT_FAMILY.serif,
        letterSpacing: 2,
        fontWeight: "600",
    },
    cardBrand: {
        color: "rgba(240, 205, 97, 0.55)",
        fontSize: FONT_SIZE.sm,
        fontFamily: FONT_FAMILY.serif,
        letterSpacing: 3,
        fontWeight: "700",
    },

    // ── Section header ───────────────────────────
    sectionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        marginBottom: SPACING.sm,
    },
    sectionTitleWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
    },
    sectionAccent: {
        width: 3,
        height: 18,
        borderRadius: 2,
        backgroundColor: COLORS.gold,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    sectionLink: {
        color: COLORS.gold,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
    },

    // ── Quick actions ────────────────────────────
    quickActionsScroll: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xs,
    },
    quickActionsContent: {
        gap: SPACING.md,
        paddingRight: SPACING.lg,
    },
    quickActionBtn: {
        alignItems: "center",
        gap: 8,
        width: 74,
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    quickActionLabel: {
        color: COLORS.textSilver,
        fontSize: 11,
        fontWeight: "700",
        textAlign: "center",
    },

    // ── Mini account cards ───────────────────────
    miniAccountsList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    miniCard: {
        borderRadius: BORDER_RADIUS.lg,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    miniCardGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: SPACING.md,
        gap: SPACING.md,
    },
    miniCardIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(234, 179, 8, 0.25)",
        justifyContent: "center",
        alignItems: "center",
    },
    miniCardLeft: {
        flex: 1,
        gap: 4,
    },
    miniCardNumber: {
        color: COLORS.text,
        fontSize: FONT_SIZE.md,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
        letterSpacing: 1,
    },
    miniCardType: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    miniCardRight: {
        alignItems: "flex-end",
        gap: 4,
    },
    miniCardBalance: {
        color: COLORS.goldLight,
        fontSize: FONT_SIZE.lg,
        fontWeight: "800",
    },
    miniCardStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    miniCardStatusDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    miniCardStatusText: {
        fontSize: 10,
        fontWeight: "700",
        textTransform: "capitalize",
    },

    // ── Transaction rows ─────────────────────────
    txList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    txRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    txIconBox: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    txInfo: {
        flex: 1,
        gap: 2,
    },
    txType: {
        color: COLORS.text,
        fontSize: FONT_SIZE.sm,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    txDate: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
    },
    txAmount: {
        fontSize: FONT_SIZE.md,
        fontWeight: "800",
    },

    // ── Skeleton ─────────────────────────────────
    skeletonCard: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        borderRadius: BORDER_RADIUS.xl,
        height: 210,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    skeletonRow: {
        flexDirection: "row",
        gap: SPACING.sm,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.sm,
    },

    // ── Empty state ──────────────────────────────
    emptyCard: {
        marginHorizontal: SPACING.lg,
        padding: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        gap: SPACING.sm,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
        textAlign: "center",
        fontWeight: "500",
    },
});
