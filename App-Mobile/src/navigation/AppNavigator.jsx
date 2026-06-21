import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { useAuthStore } from "../shared/store/authStore.js";
import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import FeedbackModal from "../shared/components/FeedbackModal.jsx";
import { COLORS } from "../shared/constants/themes";
import { isWebOnlyUser, WEB_ONLY_MESSAGE } from "../features/auth/hooks/useAuth.js";

const AppNavigator = () => {
    const { isAuthenticated, _hasHydrated, token, user, logout } = useAuthStore();
    const hasShownWebOnlyMessage = useRef(false);
    const [feedback, setFeedback] = useState({ visible: false, title: "", message: "", type: "error" });

    useEffect(() => {
        if (!_hasHydrated || !isAuthenticated) return;

        if (isWebOnlyUser({ user, token }) && !hasShownWebOnlyMessage.current) {
            hasShownWebOnlyMessage.current = true;
            logout();
            setFeedback({
                visible: true,
                title: "",
                message: WEB_ONLY_MESSAGE,
                type: "error",
            });
        }
    }, [_hasHydrated, isAuthenticated, logout, token, user]);

    const handleCloseFeedback = () => {
        setFeedback({ visible: false, title: "", message: "", type: "error" });
    };

    if (!_hasHydrated) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.gold} />
            </View>
        );
    }

    return (
        <>
            <NavigationContainer>
                {isAuthenticated && !isWebOnlyUser({ user, token }) ? <AppStack /> : <AuthStack />}
            </NavigationContainer>
            <FeedbackModal
                visible={feedback.visible}
                title={feedback.title}
                message={feedback.message}
                type={feedback.type}
                onClose={handleCloseFeedback}
            />
        </>
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
