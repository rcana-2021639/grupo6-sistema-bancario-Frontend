import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from "../constants/themes";

const Button = ({
    title,
    onPress,
    loading,
    variant = "primary",
    style,
    ...props
}) => {
    const isSecondary = variant === "secondary";

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isSecondary ? styles.buttonSecondary : styles.buttonPrimary,
                loading && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={isSecondary ? COLORS.gold : "#11120d"}
                />
            ) : (
                <Text
                    style={[
                        styles.text,
                        isSecondary ? styles.textSecondary : styles.textPrimary,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: 48,
    },
    buttonPrimary: {
        backgroundColor: COLORS.gold,
    },
    buttonSecondary: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonDisabled: {
        opacity: 0.55,
    },
    text: {
        fontSize: FONT_SIZE.md,
        fontWeight: "800",
    },
    textPrimary: {
        color: "#11120d",
    },
    textSecondary: {
        color: COLORS.text,
    },
});

export default Button;
