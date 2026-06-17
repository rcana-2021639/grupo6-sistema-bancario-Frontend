import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";

const FeedbackModal = ({ visible, title, message, type = "success", onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <View
                        style={[
                            styles.modalStatus,
                            type === "error" && styles.modalStatusError,
                        ]}
                    />
                    {title && <Text style={styles.modalTitle}>{title}</Text>}
                    <Text style={[styles.modalMessage, !title && styles.modalMessageNoTitle]}>{message}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.modalButton}
                        activeOpacity={0.84}
                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
    modalMessageNoTitle: {
        marginBottom: 28,
        marginTop: 8,
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

export default FeedbackModal;
