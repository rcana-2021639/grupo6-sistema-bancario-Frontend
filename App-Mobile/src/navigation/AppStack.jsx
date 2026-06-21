import { Platform, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../features/home/screens/DashboardScreen";
import AccountsScreen from "../features/home/screens/AccountsScreen";
import ProfileScreen from "../features/home/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const AppStack = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: "#eab308",
                tabBarInactiveTintColor: "#b8b0a0",
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ focused, color }) => {
                    const icons = {
                        Dashboard: focused ? "home" : "home-outline",
                        Cuentas: focused ? "card" : "card-outline",
                        Perfil: focused ? "person" : "person-outline",
                    };
                    return (
                        <Ionicons name={icons[route.name]} size={22} color={color} />
                    );
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ tabBarLabel: "Inicio" }}
            />
            <Tab.Screen
                name="Cuentas"
                component={AccountsScreen}
                options={{ tabBarLabel: "Cuentas" }}
            />
            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
                options={{ tabBarLabel: "Perfil" }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: "#050715",
        borderTopWidth: 1,
        borderTopColor: "rgba(240, 205, 97, 0.18)",
        height: Platform.OS === "ios" ? 82 : 62,
        paddingBottom: Platform.OS === "ios" ? 24 : 8,
        paddingTop: 8,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});

export default AppStack;
