import { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../shared/components/Header";
import { LoadingSpinner } from "../../../shared/components/Common";
import { COLORS } from "../../../shared/constants/themes";
import { useCards } from "../hooks/useCards";
import CardItem from "../components/CardItem";
import CardDetailModal from "../components/CardDetailModal";
import CardMovementsModal from "../components/CardMovementsModal";
import styles from "./CardsScreen.styles";

const CardsScreen = () => {
    const {
        cards,
        loading,
        refreshing,
        error,
        fetchCards,
        refresh,
        handleViewDetail,
    } = useCards();

    const [selectedCard, setSelectedCard] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showMovements, setShowMovements] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const openDetail = useCallback((card) => {
        setSelectedCard(card);
        setShowDetail(true);
    }, []);

    const openMovements = useCallback((card) => {
        setSelectedCard(card);
        setShowMovements(true);
    }, []);

    const closeDetail = useCallback(() => {
        setShowDetail(false);
        setSelectedCard(null);
    }, []);

    const closeMovements = useCallback(() => {
        setShowMovements(false);
        setSelectedCard(null);
    }, []);

    const onVerifyPassword = useCallback(async (cardId, password) => {
        const fullCard = await handleViewDetail(cardId, password);
        return fullCard;
    }, [handleViewDetail]);

    const renderItem = useCallback(({ item }) => (
        <CardItem
            card={item}
            onViewDetail={() => openDetail(item)}
            onViewMovements={() => openMovements(item)}
        />
    ), [openDetail, openMovements]);

    const keyExtractor = useCallback((item) => item.id || item._id || item.cardNumber, []);

    const renderEmpty = useCallback(() => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <Ionicons name="card-outline" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Sin tarjetas registradas</Text>
            <Text style={styles.emptySubtitle}>
                Tus tarjetas bancarias apareceran aqui una vez que esten registradas.
            </Text>
        </View>
    ), []);

    const renderHeader = useCallback(() => (
        <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionHeaderText}>Mis tarjetas</Text>
        </View>
    ), []);

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
                <StatusBar barStyle="light-content" backgroundColor="#03040a" />
                <Header />
                <View style={{ flex: 1, justifyContent: "center" }}>
                    <LoadingSpinner />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <StatusBar barStyle="light-content" backgroundColor="#03040a" />
            <Header />

            {error && (
                <View style={styles.notice}>
                    <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} />
                    <Text style={styles.noticeText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={cards}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContent,
                    cards.length === 0 && { flex: 1 },
                ]}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor={COLORS.gold}
                        colors={[COLORS.gold]}
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            {selectedCard && (
                <CardDetailModal
                    visible={showDetail}
                    card={selectedCard}
                    onClose={closeDetail}
                    onVerify={onVerifyPassword}
                />
            )}

            {selectedCard && (
                <CardMovementsModal
                    visible={showMovements}
                    card={selectedCard}
                    onClose={closeMovements}
                />
            )}
        </SafeAreaView>
    );
};

export default CardsScreen;
