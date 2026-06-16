import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { useAuthStore } from "../shared/store/authStore.js";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { COLORS } from "../shared/constants/themes";

const AppNavigator = () => {
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    if (!_hasHydrated) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
    },
});

export default AppNavigator;