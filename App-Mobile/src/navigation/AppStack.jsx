import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../features/auth/screens/DashboardScreen";

const Stack = createNativeStackNavigator();

const AppStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </Stack.Navigator>
    );
};

export default AppStack;
