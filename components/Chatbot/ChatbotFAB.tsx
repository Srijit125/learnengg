import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface ChatbotFABProps {
    onPress: () => void;
    isOpen?: boolean;
}

const ChatbotFAB: React.FC<ChatbotFABProps> = ({ onPress, isOpen }) => {
    return (
        <TouchableOpacity
            className="absolute bottom-[30px] right-[30px] bg-primary w-[60px] h-[60px] rounded-[30px] justify-center items-center elevation-8 shadow-lg shadow-primary/30 z-[1000]"
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

export default ChatbotFAB;
