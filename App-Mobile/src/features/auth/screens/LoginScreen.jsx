import {
    View,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../hooks/useAuth.js";
import FeedbackModal from "../../../shared/components/FeedbackModal.jsx";
import { styles } from "./LoginScreen.styles.js";

import luminaLogo from "../../../../assets/luminaLogo.png";

const LoginScreen = ({ navigation }) => {
    const { handleLogin, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [feedback, setFeedback] = useState({ visible: false, title: "", message: "", type: "success" });

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
            setFeedback({
                visible: true,
                title: "",
                message: error.message || "Error al iniciar sesion",
                type: "error",
            });
        }
    };

    const handleCloseFeedback = () => {
        setFeedback({ visible: false, title: "", message: "", type: "success" });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>
                    <View style={styles.brand}>
                        <View style={styles.logoGlowWrap}>
                            <View style={styles.logoGlowOuter} />
                            <View style={styles.logoGlowMiddle} />
                            <View style={styles.logoGlowCore} />
                            <Image source={luminaLogo} style={styles.logo} resizeMode="contain" />
                        </View>
                        <Text style={styles.brandTitle}>LUMINA{"\n"}BANK</Text>
                        <View style={styles.brandSubtitleRow}>
                            <View style={styles.subtitleLine} />
                            <Text style={styles.brandSubtitle}>Institutional Private Banking</Text>
                            <View style={styles.subtitleLine} />
                        </View>
                    </View>

                    <View style={styles.intro}>
                        <Text style={styles.formTitle}>EXCLUSIVE ACCESS</Text>
                        <Text style={styles.formCopy}>
                            Por favor, verifica tus credenciales institucionales.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Controller
                            control={control}
                            rules={{ required: "Email o usuario requerido" }}
                            render={({ field: { onChange, value } }) => (
                                <View style={styles.field}>
                                    <Text style={styles.label}>Direccion de correo electronico</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            value && styles.inputFilled,
                                            errors.emailOrUsername && styles.inputError,
                                        ]}
                                        placeholder="correo@ejemplo.com o usuario"
                                        placeholderTextColor="rgba(131, 142, 222, 0.62)"
                                        onChangeText={onChange}
                                        value={value}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!loading}
                                    />
                                    {errors.emailOrUsername && (
                                        <Text style={styles.errorText}>
                                            {errors.emailOrUsername.message}
                                        </Text>
                                    )}
                                </View>
                            )}
                            name="emailOrUsername"
                        />

                        <Controller
                            control={control}
                            rules={{ required: "Contrasena requerida" }}
                            render={({ field: { onChange, value } }) => (
                                <View style={styles.field}>
                                    <Text style={styles.label}>Contrasena</Text>
                                    <View style={styles.passwordWrap}>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                styles.passwordInput,
                                                value && styles.inputFilled,
                                                errors.password && styles.inputError,
                                            ]}
                                            placeholder="Ingresa tu clave privada"
                                            placeholderTextColor="rgba(131, 142, 222, 0.62)"
                                            secureTextEntry={!showPassword}
                                            onChangeText={onChange}
                                            value={value}
                                            editable={!loading}
                                        />
                                        <TouchableOpacity
                                            style={[styles.eyeButton, value && styles.eyeButtonFilled]}
                                            onPress={() => setShowPassword((current) => !current)}
                                            activeOpacity={0.78}
                                        >
                                            <Text style={[styles.eyeText, value && styles.eyeTextFilled]}>
                                                {showPassword ? "Oc" : "Ve"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {errors.password && (
                                        <Text style={styles.errorText}>{errors.password.message}</Text>
                                    )}
                                </View>
                            )}
                            name="password"
                        />

                        <View style={styles.options}>
                            <View style={styles.remember}>
                                <View style={styles.checkBox} />
                                <Text style={styles.optionText}>Remember for 30 days</Text>
                            </View>
                            <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
                                <Text style={styles.forgotLink}>Forgot password</Text>
                            </Pressable>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            activeOpacity={0.84}
                        >
                            <Text style={styles.submitText}>
                                {loading ? "VALIDANDO..." : "INICIAR SESION"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.footer}>
                        Solicita tu acceso con un administrador del banco.
                    </Text>
                </View>
            </ScrollView>

            <FeedbackModal
                visible={feedback.visible}
                title={feedback.title}
                message={feedback.message}
                type={feedback.type}
                onClose={handleCloseFeedback}
            />
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
