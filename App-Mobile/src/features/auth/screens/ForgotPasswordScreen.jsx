import {
    View,
    Text,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/themes";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { useAuth } from "../hooks/useAuth.js";

import kinalSportsLogo from "../../../../assets/kinalSportsLogo.png";

const ForgotPasswordScreen = ({ navigation }) => {
    const { handleForgotPassword, loading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            const response = await handleForgotPassword(data.email);
            Alert.alert("Solicitud enviada", response.message || "Revisa tu correo para continuar.", [
                {
                    text: "OK",
                    onPress: () => navigation.navigate("Login"),
                },
            ]);
        } catch (error) {
            Alert.alert("Error", error.message || "No se pudo enviar la solicitud");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Image
                        source={kinalSportsLogo}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.subtitle}>Recuperar contraseña</Text>
                </View>

                <View>
                    <Controller
                        control={control}
                        rules={{
                            required: "Email requerido",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email inválido",
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email"
                                placeholder="correo@ejemplo.com"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.email?.message}
                            />
                        )}
                        name="email"
                    />
                </View>

                <Button
                    title={loading ? "Enviando..." : "Enviar enlace"}
                    onPress={handleSubmit(onSubmit)}
                    style={styles.button}
                    disabled={loading}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>¿Ya recuerdas tu contraseña?</Text>
                    <Text style={styles.link} onPress={() => navigation.navigate("Login")}>Iniciar sesión</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.xl,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: SPACING.xxl,
    },
    logo: {
        height: 80,
        width: 200,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZE.lg,
        color: COLORS.secondary,
        marginTop: SPACING.sm,
    },
    button: {
        marginTop: SPACING.lg,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: SPACING.xl,
    },
    footerText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.textLight,
    },
    link: {
        fontSize: FONT_SIZE.md,
        color: COLORS.primary,
        fontWeight: "700",
    },
});

export default ForgotPasswordScreen;
