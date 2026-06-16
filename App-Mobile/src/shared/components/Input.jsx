import { TextInput, View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../constants/themes";

const Input = ({ label, error, ...props }) => {
    return (
        <View style={StyleSheet.container}>
            {label && <Text style={StyleSheet.label}>{label}</Text>}
            <TextInput style={[StyleSheet.input, error && StyleSheet.inputError]}
                placeholderTextColor={COLORS.secundary}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
        width: "100%",
    },
    label: {
        fontSize: FONT_SIZE.sm,
        fontWeight: "600",
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONT_SIZE.xs,
        marginTop: SPACING.xs,
    },
});
export default Input;