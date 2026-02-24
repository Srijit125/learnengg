import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface ChatbotFABProps {
    onPress: () => void;
    isOpen?: boolean;
}

const ChatbotFAB: React.FC<ChatbotFABProps> = ({ onPress, isOpen }) => {
    return (
        <TouchableOpacity
            style={styles.fab}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <MaterialCommunityIcons
                name={isOpen ? "minus" : "robot"}
                size={30}
                color="white"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#6366f1",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
});

export default ChatbotFAB;
