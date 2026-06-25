import { StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from "../../../shared/constants/themes";

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    notice: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(251,191,36,0.1)",
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        marginHorizontal: SPACING.md,
        borderRadius: 8,
    },
    noticeText: {
        flex: 1,
        fontSize: FONT_SIZE.sm,
        color: COLORS.warning,
    },
    listContent: {
        padding: SPACING.md,
        paddingTop: SPACING.sm,
    },
    sectionHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    sectionAccent: {
        width: 3,
        height: 18,
        backgroundColor: COLORS.gold,
        borderRadius: 2,
        marginRight: 10,
    },
    sectionHeaderText: {
        fontSize: FONT_SIZE.xl,
        fontFamily: FONT_FAMILY.serif,
        color: COLORS.text,
        fontWeight: "700",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(184,176,160,0.08)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.text,
        fontWeight: "700",
        marginBottom: SPACING.xs,
    },
    emptySubtitle: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.textMuted,
        textAlign: "center",
        paddingHorizontal: 40,
    },
});

export default styles;
