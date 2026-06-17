import { Platform, StyleSheet } from "react-native";

// ─── Design tokens (mirrors lumina web CSS variables) ────────────────────────
// --lumina-black:      #03040b
// --lumina-panel:      #050715
// --lumina-gold:       #eab308
// --lumina-gold-light: #fff1b8
// --lumina-gold-deep:  #b7791f
// --lumina-text:       #f7f4eb
// --lumina-muted:      #aeb6ff
// --lumina-blue:       #0b0f35
// Button gradient:     #fff0c2 → #d59b2c (90deg)
// Input bg:            rgba(8,12,48,0.88)
// Input border:        rgba(76,88,158,0.5)
// Input focus border:  rgba(234,179,8,0.76)
// Input filled bg:     web has no explicit "filled" state — keep dark
// ─────────────────────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({
    // ── Layout ────────────────────────────────────────────────────────────────
    container: {
        flex: 1,
        backgroundColor: "#03040b", // --lumina-black
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 22,
        paddingVertical: 34,
    },
    card: {
        width: "100%",
        maxWidth: 520,
        alignSelf: "center",
    },

    // ── Brand block ───────────────────────────────────────────────────────────
    brand: {
        alignItems: "center",
        marginBottom: 42,
    },
    logoGlowWrap: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        position: "relative",
        width: 128,
        height: 92,
        // drop-shadow(0 18px 24px rgba(0,0,0,0.65)) drop-shadow(0 0 18px rgba(234,179,8,0.28))
        shadowColor: "#eab308",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
        elevation: 8,
    },
    logoGlowOuter: {
        position: "absolute",
        width: 142,
        height: 96,
        borderRadius: 72,
        backgroundColor: "rgba(168, 85, 247, 0.09)",
        transform: [{ scaleX: 1.24 }],
    },
    logoGlowMiddle: {
        position: "absolute",
        width: 110,
        height: 76,
        borderRadius: 56,
        backgroundColor: "rgba(124, 58, 237, 0.15)",
        transform: [{ scaleX: 1.12 }],
    },
    logoGlowCore: {
        position: "absolute",
        width: 72,
        height: 56,
        borderRadius: 36,
        backgroundColor: "rgba(216, 180, 254, 0.12)",
    },
    logo: {
        width: 104,
        height: 82,
        opacity: 0.92, // matches .lumina-logo-mark opacity
    },

    // .lumina-brand-title
    brandTitle: {
        color: "#f7f4eb", // --lumina-text
        fontFamily: Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
        }),
        fontSize: 34,
        fontWeight: "700",
        letterSpacing: 8.84,  // 0.26em × 34
        lineHeight: 40,
        textAlign: "center",
        textShadowColor: "rgba(255, 241, 184, 0.24)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 16,
    },

    // .lumina-brand-subtitle row with flanking lines
    brandSubtitleRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 18,
        marginTop: 17,
    },
    subtitleLine: {
        width: 26,
        height: 1,
        // linear-gradient(90deg, transparent, --lumina-gold, transparent)
        // RN can't gradient a View natively; solid gold at 0.72 is a close match
        backgroundColor: "rgba(234, 179, 8, 0.72)",
    },
    // .lumina-brand-subtitle
    brandSubtitle: {
        color: "rgba(255, 241, 184, 0.86)",
        fontFamily: Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
        }),
        fontSize: 9.5,       // ~0.72rem × 13.33
        fontWeight: "700",
        letterSpacing: 3.2,  // 0.34em
        textTransform: "uppercase",
    },

    // ── Intro / heading ───────────────────────────────────────────────────────
    intro: {
        marginBottom: 27,
    },
    // .lumina-form-title
    formTitle: {
        color: "#eef1ff",
        fontFamily: Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
        }),
        fontSize: 36,        // clamp(2rem…3.1rem) → ~36px on mobile
        fontWeight: "800",
        lineHeight: 36,
        letterSpacing: -1,   // -0.03em
        textShadowColor: "rgba(174, 182, 255, 0.25)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },
    // .lumina-form-copy
    formCopy: {
        color: "#aeb6ff",    // --lumina-muted
        fontSize: 12.3,      // 0.92rem
        fontWeight: "700",
        lineHeight: 17,
        marginTop: 12,
    },

    // ── Form ──────────────────────────────────────────────────────────────────
    form: {
        gap: 18,
    },
    // .lumina-field
    field: {
        gap: 9,
    },
    // .lumina-field label  →  color: --lumina-gold-light (#fff1b8), uppercase, spaced
    label: {
        color: "#eab308",    // --lumina-gold (more saturated so it reads clearly on dark bg)
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 2,    // 0.13em — noticeable on mobile
        textTransform: "uppercase",
        marginBottom: 2,
    },

    // .lumina-input (default / unfilled)
    input: {
        minHeight: 44,
        width: "100%",
        borderWidth: 1,
        borderColor: "rgba(76, 88, 158, 0.5)",
        borderRadius: 5,
        backgroundColor: "rgba(8, 12, 48, 0.88)",
        color: "#eef1ff",
        fontSize: 15,
        fontWeight: "700",
        paddingHorizontal: 16,
        paddingVertical: 11,
        // box-shadow: inset 0 0 0 1px rgba(14,20,70,0.55), 0 0 22px rgba(30,39,118,0.1)
        shadowColor: "#1e2776",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 22,
        elevation: 2,
    },
    // .lumina-input:focus  — applied programmatically via onFocus/onBlur if desired
    inputFocused: {
        borderColor: "rgba(234, 179, 8, 0.76)",
        shadowColor: "rgba(234, 179, 8, 0.12)",
        shadowRadius: 8,
        shadowOpacity: 1,
    },
    // .lumina-input-error
    inputError: {
        borderColor: "rgba(248, 113, 113, 0.76)",
    },

    // Password row
    passwordWrap: {
        position: "relative",
        justifyContent: "center",
    },
    passwordInput: {
        paddingRight: 54,
    },

    // .lumina-eye
    eyeButton: {
        position: "absolute",
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.16)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    eyeText: {
        color: "#eef1ff",
        fontSize: 9.6,
        fontWeight: "800",
    },

    // .lumina-error-text
    errorText: {
        color: "#fca5a5",
        fontSize: 10.4,      // 0.78rem
        fontWeight: "700",
    },

    // ── Options row (.lumina-options) ─────────────────────────────────────────
    options: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    // .lumina-check
    remember: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },
    checkBox: {
        width: 15,
        height: 15,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: "#c7d2fe",  // accent-color: #c7d2fe in web
        backgroundColor: "rgba(199, 210, 254, 0.08)",
    },
    optionText: {
        color: "rgba(238, 241, 255, 0.82)",
        fontSize: 11.5,
        fontWeight: "700",
    },
    // .lumina-link
    forgotLink: {
        color: "#f5f2ff",
        fontSize: 11.5,
        fontWeight: "700",
    },

    // ── Submit button (.lumina-button) ────────────────────────────────────────
    // Web: background: linear-gradient(90deg, #fff0c2 0%, #d59b2c 100%)
    // The left side reads pale/cream; the right reads deep amber.
    // In RN without LinearGradient we use a warm gold midpoint + shine overlay.
    submitButton: {
        minHeight: 50,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 241, 184, 0.72)",
        borderRadius: 10,
        // Midpoint of #fff0c2→#d59b2c shifted slightly warm to read as gold, not cream
        backgroundColor: "#d6a12b",
        shadowColor: "#eab308",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.62,        // matches .lumina-button:disabled
    },
    // .lumina-button text styles (Cinzel → Georgia serif fallback)
    submitText: {
        color: "#111217",
        fontFamily: Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
        }),
        fontSize: 11.5,
        fontWeight: "800",
        letterSpacing: 2.2,
        textTransform: "uppercase",
    },

    // ── Footer (.lumina-footer) ───────────────────────────────────────────────
    footer: {
        color: "rgba(238, 241, 255, 0.76)",
        fontSize: 11.5,
        fontWeight: "700",
        lineHeight: 17,
        marginTop: 22,
        textAlign: "center",
    },
});
