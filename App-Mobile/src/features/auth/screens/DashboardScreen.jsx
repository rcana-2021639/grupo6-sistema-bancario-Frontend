import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { COLORS, SPACING, FONT_SIZE } from "../../../shared/constants/themes";
import { useAuthStore } from "../../../shared/store/authStore.js";
import Button from "../../../shared/components/Button";
import kinalSportsLogo from "../../../../assets/kinalSportsLogo.png";

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={kinalSportsLogo} style={styles.logo} resizeMode="contain" />
                <Text style={styles.title}>Bienvenido, {user?.username || user?.name || "Usuario"}</Text>
                <Text style={styles.subtitle}>Este es tu dashboard de cliente.</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Información de tu cuenta</Text>
                <Text style={styles.detail}>Nombre: {user?.name || "-"}</Text>
                <Text style={styles.detail}>Apellido: {user?.surname || "-"}</Text>
                <Text style={styles.detail}>Usuario: {user?.username || "-"}</Text>
                <Text style={styles.detail}>Rol: {user?.role || "Cliente"}</Text>
            </View>

            <View style={styles.actions}>
                <Button title="Cerrar sesión" onPress={handleLogout} style={styles.button} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.xl,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: SPACING.xl,
    },
    logo: {
        height: 80,
        width: 200,
        marginBottom: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZE.xl,
        fontWeight: "700",
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
        color: COLORS.secondary,
        marginBottom: SPACING.lg,
    },
    content: {
        width: "100%",
        backgroundColor: COLORS.surface,
        borderRadius: SPACING.md,
        padding: SPACING.lg,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: "700",
        color: COLORS.secondary,
        marginBottom: SPACING.sm,
    },
    detail: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    actions: {
        width: "100%",
        marginTop: SPACING.xl,
    },
    button: {
        marginTop: SPACING.sm,
    },
});

export default DashboardScreen;
