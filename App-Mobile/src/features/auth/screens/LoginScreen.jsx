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

const LoginScreen = ({ navigation }) => {
    const { handleLogin, loading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            emailOrUsername: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            await handleLogin(data);
            navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
        } catch (error) {
            Alert.alert("Error", error.message || "Error al iniciar sesión");
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
                    <Text style={styles.subtitle}> Bienvenido de nuevo</Text>
                </View>

                <View>
                    <Controller
                        control={control}
                        rules={{ required: "Email o usuario requerido" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Email o usuario"
                                placeholder="correo@ejemplo.com o usuario"
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                error={errors.emailOrUsername?.message}
                            />
                        )}
                        name="emailOrUsername"
                    />

                </View>

                <View>
                    <Controller
                        control={control}
                        rules={{ required: "Contraseña requerida" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label="Contraseña"
                                placeholder="••••••••••••"
                                secureTextEntry
                                onChangeText={onChange}
                                value={value}
                                error={errors.password?.message}
                            />
                        )}
                        name="password"
                    />
                </View>

                <Button
                    title="Iniciar Sesion"
                    onPress={handleSubmit(onSubmit)}
                    style={styles.button}
                />


                <View style={styles.footer}>
                    <Text style={styles.footerText}>¿Olvidaste tu contraseña?</Text>
                    <Text
                        style={styles.link}
                        onPress={() => navigation.navigate("ForgotPassword")}
                    >
                        Recuperar
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

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
    form: {
        width: "100%",
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

export default LoginScreen;