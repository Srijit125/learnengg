import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Platform,
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

    const { width, height } = Dimensions.get("window");

    return (
        <View className="absolute inset-0 justify-end items-end bg-transparent pb-[100px] pr-[30px] z-[999]" pointerEvents="box-none">
            <View
                className="bg-card-light dark:bg-card-dark rounded-[20px] overflow-hidden shadow-xl elevation-10 border border-border-light dark:border-border-dark"
                style={{
                    width: Platform.OS === "web" ? 400 : width * 0.9,
                    height: Platform.OS === "web" ? 600 : height * 0.7,
                }}
            >
                <View className="flex-row justify-between items-center p-4 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
                    <View className="flex-row items-center gap-3">
                        <MaterialCommunityIcons name="robot" size={24} color="#6366f1" />
                        <Text className="text-lg font-bold text-text-light dark:text-text-dark">Learning Assistant</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} className="p-1">
                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 bg-background-light dark:bg-background-dark">
                    {Platform.OS === 'web' ? (
                        <iframe
                            src={chatbotUrl}
                            style={{ border: 'none', width: '100%', height: '100%' }}
                            title="Chatbot Interface"
                        />
                    ) : (
                        <WebView
                            source={{ uri: chatbotUrl }}
                            className="flex-1"
                            startInLoadingState={true}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

export default ChatbotWindow;
