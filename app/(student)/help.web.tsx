import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
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
        <TouchableOpacity style={styles.faqCard} onPress={toggleExpand} activeOpacity={0.7}>
            <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{question}</Text>
                <MaterialCommunityIcons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#6366f1"
                />
            </View>
            {expanded && (
                <Text style={styles.faqAnswer}>{answer}</Text>
            )}
        </TouchableOpacity>
    );
};

export default function HelpPage() {
    return (
        <View style={styles.container}>
            <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={styles.gradientBackground}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Help & Support</Text>
                        <Text style={styles.subtitle}>Frequently asked questions and support contact</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
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

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Support</Text>
                        <View style={styles.contactCard}>
                            <View style={styles.contactItem}>
                                <View style={styles.contactIcon}>
                                    <Ionicons name="mail-outline" size={24} color="#6366f1" />
                                </View>
                                <View>
                                    <Text style={styles.contactLabel}>Email Us</Text>
                                    <Text style={styles.contactValue}>support@learnengg.com</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.contactItem}>
                                <View style={styles.contactIcon}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#6366f1" />
                                </View>
                                <View>
                                    <Text style={styles.contactLabel}>Live Chat</Text>
                                    <Text style={styles.contactValue}>Available 9 AM - 6 PM</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.versionText}>App Version 1.2.0</Text>
                        <Text style={styles.footerLink}>Terms of Service</Text>
                        <Text style={styles.footerLink}>Privacy Policy</Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradientBackground: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 40 },
    header: {
        marginBottom: 32,
        paddingTop: 12,
    },
    title: { fontSize: 32, fontWeight: "800", color: "#1e293b", letterSpacing: -0.5 },
    subtitle: { fontSize: 16, color: "#64748b", marginTop: 4 },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: 16,
    },
    faqCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    faqHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
        flex: 1,
        paddingRight: 16,
    },
    faqAnswer: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 12,
        lineHeight: 22,
    },
    contactCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 16,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#f5f3ff",
        justifyContent: "center",
        alignItems: "center",
    },
    contactLabel: {
        fontSize: 12,
        color: "#94a3b8",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1e293b",
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginHorizontal: 16,
    },
    footer: {
        alignItems: "center",
        marginTop: 20,
        gap: 8,
    },
    versionText: {
        fontSize: 13,
        color: "#94a3b8",
        marginBottom: 8,
    },
    footerLink: {
        fontSize: 14,
        color: "#6366f1",
        fontWeight: "600",
    },
});
