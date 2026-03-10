import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from "react-native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <TouchableOpacity className="bg-card-light dark:bg-card-dark rounded-2xl p-5 mb-3 border border-border-light dark:border-border-dark shadow-sm" onPress={toggleExpand} activeOpacity={0.7}>
            <View className="flex-row justify-between items-center">
                <Text className="text-base font-semibold text-text-light dark:text-text-dark flex-1 pr-4">{question}</Text>
                <MaterialCommunityIcons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#6366f1"
                />
            </View>
            {expanded && (
                <Text className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-3 leading-[22px]">{answer}</Text>
            )}
        </TouchableOpacity>
    );
};

export default function HelpPage() {
    return (
        <View className="flex-1">
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                    <View className="mb-8 pt-3">
                        <Text className="text-3xl font-extrabold text-text-light dark:text-text-dark tracking-tight">Help & Support</Text>
                        <Text className="text-base text-textSecondary-light dark:text-textSecondary-dark mt-1">Frequently asked questions and support contact</Text>
                    </View>

                    <View className="mb-8">
                        <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Frequently Asked Questions</Text>
                        <FAQItem
                            question="How is my Accuracy calculated?"
                            answer="Accuracy is the percentage of questions you answered correctly across all your quiz attempts. It's calculated as (Correct Answers / Total Attempts) * 100."
                        />
                        <FAQItem
                            question="What is CPI?"
                            answer="CPI (Cumulative Performance Index) is a weighted metric that considers your accuracy, the difficulty of questions, and your recent progress trends."
                        />
                        <FAQItem
                            question="How can I improve my Recommendations?"
                            answer="Recommendations are based on your identified weaknesses. By attempting more quizzes in your 'Focus Needed' chapters, the AI will refine its suggestions to better help you."
                        />
                        <FAQItem
                            question="How do I export my data?"
                            answer="You can use the 'Export Data' menu in the settings to download a CSV file of your detailed activity or a performance summary."
                        />
                    </View>

                    <View className="mb-8">
                        <Text className="text-lg font-bold text-text-light dark:text-text-dark mb-4">Contact Support</Text>
                        <View className="bg-card-light dark:bg-card-dark rounded-[20px] p-2 border border-border-light dark:border-border-dark">
                            <View className="flex-row items-center p-4 gap-4">
                                <View className="w-12 h-12 rounded-xl bg-[#f5f3ff] justify-center items-center">
                                    <Ionicons name="mail-outline" size={24} color="#6366f1" />
                                </View>
                                <View>
                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase tracking-wider">Email Us</Text>
                                    <Text className="text-base font-semibold text-text-light dark:text-text-dark">support@learnengg.com</Text>
                                </View>
                            </View>
                            <View className="h-[1px] bg-background-light dark:bg-background-dark mx-4" />
                            <View className="flex-row items-center p-4 gap-4">
                                <View className="w-12 h-12 rounded-xl bg-[#f5f3ff] justify-center items-center">
                                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#6366f1" />
                                </View>
                                <View>
                                    <Text className="text-xs text-textSecondary-light dark:text-textSecondary-dark font-semibold uppercase tracking-wider">Live Chat</Text>
                                    <Text className="text-base font-semibold text-text-light dark:text-text-dark">Available 9 AM - 6 PM</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="items-center mt-5 gap-2">
                        <Text className="text-[13px] text-textSecondary-light dark:text-textSecondary-dark mb-2">App Version 1.2.0</Text>
                        <Text className="text-sm text-[#6366f1] font-semibold">Terms of Service</Text>
                        <Text className="text-sm text-[#6366f1] font-semibold">Privacy Policy</Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
