import { StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY, BORDER_RADIUS } from "../../../shared/constants/themes";

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // ── Stats row ────────────────────────────────
    statsRow: {
        flexDirection: "row",
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        alignItems: "center",
        gap: 6,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    statValue: {
        color: COLORS.text,
        fontSize: FONT_SIZE.xl,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },

    // ── List ─────────────────────────────────────
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
        gap: SPACING.md,
    },

    // ── Account card ─────────────────────────────
    accountCard: {
        borderRadius: BORDER_RADIUS.xl,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 7,
    },
    accountCardGradient: {
        padding: SPACING.lg,
        position: "relative",
    },
    statusStripe: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    glow: {
        position: "absolute",
        top: -40,
        right: -40,
        width: 130,
        height: 130,
        borderRadius: 65,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    cardIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(234, 179, 8, 0.25)",
        justifyContent: "center",
        alignItems: "center",
    },
    cardHeadInfo: {
        flex: 1,
    },
    accountNumber: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    accountTypeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        marginTop: 4,
    },
    typeBadge: {
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(234, 179, 8, 0.3)",
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    typeBadgeText: {
        color: COLORS.gold,
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    currencyText: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
        fontWeight: "600",
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: "800",
        textTransform: "capitalize",
    },

    // ── Balance ──────────────────────────────────
    balanceBox: {
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: "rgba(255, 241, 184, 0.12)",
    },
    balanceLabel: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.xs,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    balanceAmount: {
        color: "#fff1b8",
        fontSize: FONT_SIZE.xxl,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
    },

    // ── Details grid ─────────────────────────────
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: SPACING.md,
        columnGap: SPACING.sm,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexBasis: "47%",
        flexGrow: 1,
    },
    detailTextWrap: {
        flex: 1,
        gap: 2,
    },
    detailLabel: {
        color: COLORS.textMuted,
        fontSize: 9,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    detailValue: {
        color: COLORS.textSilver,
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
    },

    // ── Divider ──────────────────────────────────
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md,
    },

    // ── Section header ───────────────────────────
    sectionHeaderContainer: {
        marginTop: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    sectionHeaderText: {
        color: "rgba(240, 205, 97, 0.5)",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 3,
        textTransform: "uppercase",
    },

    // ── Empty state ──────────────────────────────
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: SPACING.xxl,
        gap: SPACING.md,
    },
    emptyIcon: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: FONT_SIZE.lg,
        fontFamily: FONT_FAMILY.serif,
        fontWeight: "700",
        textAlign: "center",
    },
    emptySubtitle: {
        color: COLORS.textMuted,
        fontSize: FONT_SIZE.sm,
        textAlign: "center",
        paddingHorizontal: SPACING.xl,
        lineHeight: 20,
    },
});
