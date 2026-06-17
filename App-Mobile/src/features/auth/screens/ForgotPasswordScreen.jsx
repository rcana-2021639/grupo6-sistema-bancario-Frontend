import {
    View,
    Text,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    TextInput,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../hooks/useAuth.js";
import { styles as loginStyles } from "./LoginScreen.styles.js";

import luminaLogo from "../../../../assets/luminaLogo.png";

const ForgotPasswordScreen = ({ navigation }) => {
    const { handleForgotPassword, loading } = useAuth();
    const [feedback, setFeedback] = useState({
        visible: false,
        type: "success",
        title: "",
        message: "",
    });

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
            setFeedback({
                visible: true,
                type: "success",
                title: "Solicitud enviada",
                message: response.message || "Revisa tu correo para continuar.",
            });
        } catch (error) {
            setFeedback({
                visible: true,
                type: "error",
                title: "Error",
                message: error.message || "No se pudo enviar la solicitud",
            });
        }
    };

    const handleCloseFeedback = () => {
        const shouldReturnToLogin = feedback.type === "success";

        setFeedback((current) => ({ ...current, visible: false }));

        if (shouldReturnToLogin) {
            navigation.navigate("Login");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={loginStyles.container}
        >
            <ScrollView
                contentContainerStyle={loginStyles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={loginStyles.card}>
                    <View style={loginStyles.brand}>
                        <View style={loginStyles.logoGlowWrap}>
                            <View style={loginStyles.logoGlowOuter} />
                            <View style={loginStyles.logoGlowMiddle} />
                            <View style={loginStyles.logoGlowCore} />
                            <Image source={luminaLogo} style={loginStyles.logo} resizeMode="contain" />
                        </View>
                        <Text style={loginStyles.brandTitle}>LUMINA{"\n"}BANK</Text>
                        <View style={loginStyles.brandSubtitleRow}>
                            <View style={loginStyles.subtitleLine} />
                            <Text style={loginStyles.brandSubtitle}>Institutional Private Banking</Text>
                            <View style={loginStyles.subtitleLine} />
                        </View>
                    </View>

                    <View style={loginStyles.intro}>
                        <Text style={loginStyles.formTitle}>RECUPERAR ACCESO</Text>
                        <Text style={loginStyles.formCopy}>
                            Ingresa tu correo institucional para recibir instrucciones seguras.
                        </Text>
                    </View>

                    <View style={loginStyles.form}>
                        <Controller
                            control={control}
                            rules={{
                                required: "Email requerido",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Email invalido",
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <View style={loginStyles.field}>
                                    <Text style={loginStyles.label}>Direccion de correo electronico</Text>
                                    <TextInput
                                        style={[
                                            loginStyles.input,
                                            value && loginStyles.inputFilled,
                                            errors.email && loginStyles.inputError,
                                        ]}
                                        placeholder="correo@ejemplo.com"
                                        placeholderTextColor="rgba(131, 142, 222, 0.62)"
                                        onChangeText={onChange}
                                        value={value}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                        editable={!loading}
                                    />
                                    {errors.email && (
                                        <Text style={loginStyles.errorText}>
                                            {errors.email.message}
                                        </Text>
                                    )}
                                </View>
                            )}
                            name="email"
                        />

                        <TouchableOpacity
                            style={[
                                loginStyles.submitButton,
                                loading && loginStyles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            activeOpacity={0.84}
                        >
                            <Text style={loginStyles.submitText}>
                                {loading ? "ENVIANDO..." : "ENVIAR ENLACE"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Ya recuerdas tu contrasena?</Text>
                        <Pressable onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.link}>Iniciar sesion</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={feedback.visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={handleCloseFeedback}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View
                            style={[
                                styles.modalStatus,
                                feedback.type === "error" && styles.modalStatusError,
                            ]}
                        />
                        <Text style={styles.modalTitle}>{feedback.title}</Text>
                        <Text style={styles.modalMessage}>{feedback.message}</Text>
                        <TouchableOpacity
                            onPress={handleCloseFeedback}
                            style={styles.modalButton}
                            activeOpacity={0.84}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    footerRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        justifyContent: "center",
        marginTop: 22,
    },
    footerText: {
        color: "rgba(238, 241, 255, 0.76)",
        fontSize: 11.5,
        fontWeight: "700",
        lineHeight: 17,
    },
    link: {
        color: "#fff1b8",
        fontSize: 11.5,
        fontWeight: "700",
        lineHeight: 17,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(3, 4, 11, 0.78)",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
    },
    modalCard: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#050715",
        borderWidth: 1,
        borderColor: "rgba(76, 88, 158, 0.5)",
        borderRadius: 10,
        padding: 22,
        alignItems: "center",
        elevation: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    modalStatus: {
        width: 48,
        height: 4,
        borderRadius: 999,
        backgroundColor: "#eab308",
        marginBottom: 16,
    },
    modalStatusError: {
        backgroundColor: "#f87171",
    },
    modalTitle: {
        color: "#eef1ff",
        fontFamily: Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
        }),
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 9,
        textAlign: "center",
    },
    modalMessage: {
        color: "#aeb6ff",
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 22,
        textAlign: "center",
        marginBottom: 20,
        width: "100%",
    },
    modalButton: {
        minHeight: 44,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 241, 184, 0.72)",
        borderRadius: 10,
        backgroundColor: "#d6a12b",
    },
    modalButtonText: {
        color: "#111217",
        fontFamily: Platform.select({
            ios: "Georgia",
            android: "serif",
            default: "serif",
        }),
        fontSize: 11.5,
        fontWeight: "800",
        letterSpacing: 2.2,
    },
});

export default ForgotPasswordScreen;
