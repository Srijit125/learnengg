import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { WebView } from "react-native-webview";

interface ChatbotWindowProps {
    isVisible: boolean;
    onClose: () => void;
    chatbotUrl?: string;
}

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({
    isVisible,
    onClose,
    chatbotUrl = "http://192.168.0.184:8002", // Replace with actual URL
}) => {
    if (!isVisible) return null;

    return (
        <View style={styles.overlayView} pointerEvents="box-none">
            <View style={styles.windowContainer}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <MaterialCommunityIcons name="robot" size={24} color="#6366f1" />
                        <Text style={styles.headerTitle}>Learning Assistant</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <View style={styles.webviewContainer}>
                    {Platform.OS === 'web' ? (
                        <iframe
                            src={chatbotUrl}
                            style={{ border: 'none', width: '100%', height: '100%' }}
                            title="Chatbot Interface"
                        />
                    ) : (
                        <WebView
                            source={{ uri: chatbotUrl }}
                            style={styles.webview}
                            startInLoadingState={true}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    overlayView: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "flex-end",
        backgroundColor: "transparent",
        paddingBottom: 100, // Positioned above the FAB
        paddingRight: 30,
        zIndex: 999,
    },
    windowContainer: {
        width: Platform.OS === "web" ? 400 : width * 0.9,
        height: Platform.OS === "web" ? 600 : height * 0.7,
        backgroundColor: "white",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        backgroundColor: "#ffffff",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
    },
    closeButton: {
        padding: 4,
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    webview: {
        flex: 1,
    },
});

export default ChatbotWindow;
